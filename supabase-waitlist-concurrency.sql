-- ============================================================
-- CAPTEN — Migration SQL : Waitlist Concurrency Optimization
-- ============================================================

CREATE OR REPLACE FUNCTION fn_cancel_and_promote(p_participant_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_run_id UUID;
    v_cancelled_status TEXT;
    v_cancelled_position INTEGER;
    v_promoted_id UUID;
    v_promoted_firstname TEXT;
    v_promoted_phone TEXT;
    v_promoted_cancel_token TEXT;
    v_promoted_session_opened TIMESTAMP WITH TIME ZONE;
    v_club_id UUID;
    v_club_display_name TEXT;
    v_twilio_service_sid TEXT;
    v_credit_balance NUMERIC;
    v_result JSONB;
BEGIN
    -- 1. Récupérer et verrouiller l'inscription concernée pour éviter tout accès concurrent
    SELECT run_id, status, waitlist_position 
    INTO v_run_id, v_cancelled_status, v_cancelled_position
    FROM run_participants
    WHERE id = p_participant_id
    FOR UPDATE;

    -- Si l'inscription n'existe pas, retourner une erreur
    IF v_run_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Inscription introuvable.');
    END IF;

    -- Si déjà annulée, retourner un statut de succès sans traitement supplémentaire
    IF v_cancelled_status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Cette inscription a déjà été annulée.', 
            'already_cancelled', true
        );
    END IF;

    -- 2. Verrouiller toutes les inscriptions associées à ce run pour sérialiser les modifications de la file d'attente
    -- Cela force toute autre transaction sur le même run à attendre.
    PERFORM id FROM run_participants WHERE run_id = v_run_id FOR UPDATE;

    -- 3. Marquer le participant s'annulant comme 'cancelled' et vider sa position
    UPDATE run_participants
    SET status = 'cancelled', waitlist_position = NULL
    WHERE id = p_participant_id;

    -- --- CAS A : Le participant qui s'annule était sur liste d'attente ---
    IF v_cancelled_status = 'waitlisted' AND v_cancelled_position IS NOT NULL THEN
        -- Décaler tous ceux qui étaient derrière lui dans la file d'attente
        UPDATE run_participants
        SET waitlist_position = waitlist_position - 1
        WHERE run_id = v_run_id 
          AND status = 'waitlisted' 
          AND waitlist_position > v_cancelled_position;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'waitlisted_cancelled',
            'promoted_id', NULL,
            'message', 'Retrait de la liste d''attente traité avec succès.'
        );
    END IF;

    -- --- CAS A2 : Le participant qui s'annule était sur liste d'attente mais sans position (sécurité) ---
    IF v_cancelled_status = 'waitlisted' THEN
        RETURN jsonb_build_object(
            'success', true,
            'type', 'waitlisted_cancelled',
            'promoted_id', NULL,
            'message', 'Retrait de la liste d''attente traité avec succès.'
        );
    END IF;

    -- --- CAS B : Le participant qui s'annule occupait une vraie place ---
    -- 4. Trouver le premier sur la liste d'attente (position = 1)
    SELECT rp.id, m.firstname, m.phone, rp.cancel_token, rp.whatsapp_session_opened_at
    INTO v_promoted_id, v_promoted_firstname, v_promoted_phone, v_promoted_cancel_token, v_promoted_session_opened
    FROM run_participants rp
    JOIN members m ON rp.member_id = m.id
    WHERE rp.run_id = v_run_id 
      AND rp.status = 'waitlisted' 
      AND rp.waitlist_position = 1;

    -- 5. Si quelqu'un est disponible en liste d'attente
    IF v_promoted_id IS NOT NULL THEN
        -- Promouvoir le coureur à la position 1
        UPDATE run_participants
        SET status = 'registered',
            waitlist_position = NULL,
            promoted_at = NOW()
        WHERE id = v_promoted_id;

        -- Décaler toutes les autres positions de la file d'attente (-1)
        UPDATE run_participants
        SET waitlist_position = waitlist_position - 1
        WHERE run_id = v_run_id 
          AND status = 'waitlisted';

        -- Récupérer les infos du club pour Twilio/Meta billing
        SELECT c.id, c.whatsapp_display_name, c.twilio_messaging_service_sid, c.credit_balance_euros
        INTO v_club_id, v_club_display_name, v_twilio_service_sid, v_credit_balance
        FROM runs r
        JOIN clubs c ON r.club_id = c.id
        WHERE r.id = v_run_id;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'promoted',
            'promoted_id', v_promoted_id,
            'promoted_firstname', v_promoted_firstname,
            'promoted_phone', v_promoted_phone,
            'promoted_cancel_token', v_promoted_cancel_token,
            'promoted_session_opened_at', v_promoted_session_opened,
            'club_id', v_club_id,
            'club_display_name', COALESCE(v_club_display_name, 'CAPTEN CLUB'),
            'twilio_service_sid', v_twilio_service_sid,
            'credit_balance_euros', v_credit_balance,
            'run_title', (SELECT title FROM runs WHERE id = v_run_id)
        );
    ELSE
        -- Aucun participant en attente => Décrémenter slots_taken du run
        UPDATE runs
        SET slots_taken = GREATEST(0, slots_taken - 1)
        WHERE id = v_run_id;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'cancelled_no_promotion',
            'promoted_id', NULL
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
