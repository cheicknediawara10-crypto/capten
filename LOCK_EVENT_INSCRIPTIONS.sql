-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — VERROUILLAGE de `event_inscriptions` (fuite PII + intégrité)
--  À exécuter dans Supabase → SQL Editor → Run.
--
--  PROBLÈME (migration 20260826_run_evenement.sql) :
--   • GRANT ALL ... TO anon + RLS « SELECT USING(true) » → la clé publique
--     pouvait lire nom/prénom/email/téléphone de TOUS les inscrits, tous crews.
--   • RLS « UPDATE USING(true) WITH CHECK(true) » → n'importe qui pouvait
--     modifier n'importe quelle inscription (se valider « payé », se sur-classer
--     en liste d'attente, altérer les données d'autrui).
--   • INSERT anon libre → lignes arbitraires / pré-validées.
--
--  FIX : toute la logique publique passe désormais par des SERVER ACTIONS en
--  clé service (registerToEvent, declarePaymentByRunner, getPublicEventInfo).
--  On retire donc TOUT accès anon direct. service_role ignore la RLS → les
--  server actions continuent de fonctionner. Le fondateur (authenticated) garde
--  son accès borné à son crew via la policy existante.
-- ════════════════════════════════════════════════════════════════════════

REVOKE ALL ON public.event_inscriptions FROM anon;

DROP POLICY IF EXISTS "Public can register to published events"    ON public.event_inscriptions;
DROP POLICY IF EXISTS "Public can update their payment confirmation" ON public.event_inscriptions;
DROP POLICY IF EXISTS "Public can read event inscriptions count"    ON public.event_inscriptions;

-- Conservé : « Captains can view and manage their event inscriptions » (authenticated),
-- borné à e.club_id = auth.uid() OR e.created_by = auth.uid().


-- ════════════════════════════════════════════════════════════════════════
--  INSCRIPTION ATOMIQUE — anti-surbooking
--  Un verrou d'avis (advisory lock) sérialise les inscriptions concurrentes
--  sur un même run : compter puis insérer devient indivisible → jamais de
--  place vendue deux fois, même sous forte concurrence.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.register_event_inscription(
  p_event_id  UUID,
  p_membre_id UUID,
  p_nom       TEXT,
  p_prenom    TEXT,
  p_email     TEXT,
  p_telephone TEXT
) RETURNS public.event_inscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event          public.events;
  v_active_count   INT;
  v_waitlist_count INT;
  v_position       INT := NULL;
  v_expires        TIMESTAMPTZ := NULL;
  v_row            public.event_inscriptions;
BEGIN
  -- Sérialise toute inscription concurrente sur CE run (le lock tient jusqu'au commit).
  PERFORM pg_advisory_xact_lock(hashtextextended(p_event_id::text, 0));

  SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
  IF v_event.id IS NULL OR v_event.status <> 'published' THEN
    RAISE EXCEPTION 'event_not_open';
  END IF;

  SELECT count(*) INTO v_active_count
    FROM public.event_inscriptions
    WHERE event_id = p_event_id AND position_liste_attente IS NULL;

  IF v_event.is_evenement AND COALESCE(v_event.jauge_max, 0) > 0
     AND v_active_count >= v_event.jauge_max THEN
    SELECT count(*) INTO v_waitlist_count
      FROM public.event_inscriptions
      WHERE event_id = p_event_id AND position_liste_attente IS NOT NULL;
    v_position := v_waitlist_count + 1;            -- jauge pleine → liste d'attente
  ELSIF v_event.is_evenement THEN
    v_expires := now() + interval '48 hours';       -- réservation temporaire
  END IF;

  INSERT INTO public.event_inscriptions
    (event_id, membre_id, nom, prenom, email, telephone,
     statut_paiement, position_liste_attente, confirme_par_coureur,
     confirme_par_fondateur, expires_at)
  VALUES
    (p_event_id, p_membre_id, btrim(p_nom), btrim(p_prenom),
     NULLIF(btrim(COALESCE(p_email, '')), ''),
     NULLIF(btrim(COALESCE(p_telephone, '')), ''),
     'en_attente', v_position, false, false, v_expires)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL   ON FUNCTION public.register_event_inscription(UUID,UUID,TEXT,TEXT,TEXT,TEXT) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.register_event_inscription(UUID,UUID,TEXT,TEXT,TEXT,TEXT) TO service_role;
