-- ============================================
-- CAPTEN — Unified Database Initialization Schema (V3)
-- Base de données : Supabase (PostgreSQL)
-- ============================================

-- --------------------------------------------
-- 1. CRÉATION DES TABLES (ORDRE DE DÉPENDANCE)
-- --------------------------------------------

-- Table 1 : Clubs (Settings, Plan Stripe et Solde Crédit)
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    whatsapp_display_name TEXT NOT NULL,
    twilio_messaging_service_sid TEXT,
    credit_balance_euros NUMERIC(10, 2) DEFAULT 15.00 NOT NULL,
    stripe_plan TEXT DEFAULT 'PRO' NOT NULL,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days') NOT NULL,
    stripe_subscription_status TEXT DEFAULT 'trialing' NOT NULL,
    whatsapp_messages_sent_this_month INTEGER DEFAULT 0 NOT NULL
);

-- Table 2 : Runs
CREATE TABLE IF NOT EXISTS runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    captain_id UUID DEFAULT gen_random_uuid() NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date_start TIMESTAMP WITH TIME ZONE NOT NULL,
    location_start TEXT NOT NULL,
    gpx_route_url TEXT,
    is_paid BOOLEAN DEFAULT FALSE NOT NULL,
    price_cents INTEGER DEFAULT 0,
    stripe_product_id TEXT,
    max_slots INTEGER DEFAULT NULL,
    slots_taken INTEGER DEFAULT 0,
    vibe TEXT DEFAULT 'Social & Chill',
    coach TEXT DEFAULT 'Alex Rivière',
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')) NOT NULL,
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    series_id UUID, -- Will reference run_series(id) once created
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sms_sent BOOLEAN DEFAULT FALSE NOT NULL,
    reminder_offset_minutes INTEGER DEFAULT 30
);

-- Table 3 : Members (Public Profiles mapped to auth.users)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT,
    phone TEXT
);

-- Table 3.5 : Profiles (SaaS Subscription details for Captains)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    stripe_customer_id TEXT,
    stripe_subscription_status TEXT DEFAULT 'trialing' NOT NULL,
    subscription_ends_at TIMESTAMP WITH TIME ZONE
);

-- Table 4 : Memberships (Relation Athlète <=> Club)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    no_show_streak INTEGER DEFAULT 0 NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE NOT NULL,
    blacklisted_until TIMESTAMP WITH TIME ZONE,
    user_signed_waiver BOOLEAN DEFAULT FALSE,
    waiver_date TIMESTAMP WITH TIME ZONE,
    waiver_ip TEXT,
    waiver_token TEXT,
    CONSTRAINT unique_club_member UNIQUE (club_id, member_id)
);

-- Table 5 : Run Participants (Inscriptions des membres du club)
CREATE TABLE IF NOT EXISTS run_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'checked_in', 'cancelled', 'no_show', 'waitlisted')) NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    verified_latitude DOUBLE PRECISION,
    verified_longitude DOUBLE PRECISION,
    waitlist_position INTEGER,
    promoted_at TIMESTAMP WITH TIME ZONE,
    whatsapp_session_opened_at TIMESTAMP WITH TIME ZONE,
    cancel_token TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 12),
    CONSTRAINT unique_run_member UNIQUE (run_id, member_id)
);

-- Table 6 : Runners (Profils anonymes / Coureurs externes s'identifiant par téléphone)
CREATE TABLE IF NOT EXISTS runners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    signed_waiver BOOLEAN DEFAULT FALSE NOT NULL,
    waiver_date TIMESTAMP WITH TIME ZONE,
    waiver_ip TEXT,
    waiver_token TEXT,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE NOT NULL,
    blacklisted_until TIMESTAMP WITH TIME ZONE,
    emergency_name TEXT,
    emergency_phone TEXT,
    emergency_relation TEXT,
    birth_date TEXT,
    blood_type TEXT,
    allergies TEXT,
    health_issues TEXT,
    insurance TEXT,
    address TEXT
);

-- Table 7 : Registrations (Inscriptions des runners anonymes)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE NOT NULL,
    runner_id UUID REFERENCES runners(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'checked_in' CHECK (status IN ('registered', 'checked_in', 'cancelled', 'waitlisted')) NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    verified_latitude DOUBLE PRECISION,
    verified_longitude DOUBLE PRECISION,
    check_in_method TEXT DEFAULT 'gps',
    CONSTRAINT unique_run_runner UNIQUE (run_id, runner_id)
);

-- Table 8 : Whatsapp Notification Queue (Phase 2 à H-15m)
CREATE TABLE IF NOT EXISTS whatsapp_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    message_content TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')) NOT NULL
);

-- Table 9 : Broadcast Queue (Phase 1 Immédiat)
CREATE TABLE IF NOT EXISTS broadcast_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    target_type TEXT CHECK (target_type IN ('group_broadcast', 'individual_dm')) NOT NULL,
    message_content TEXT NOT NULL,
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'hold' CHECK (status IN ('hold', 'pending', 'processing', 'sent', 'cancelled')) NOT NULL
);

-- Table 10 : Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
    runner_id UUID REFERENCES runners(id) ON DELETE SET NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'Comportement Toxique' NOT NULL,
    priority TEXT DEFAULT 'MOYENNE' CHECK (priority IN ('BASSE', 'MOYENNE', 'HAUTE')) NOT NULL,
    status TEXT DEFAULT 'NOUVEAU' CHECK (status IN ('NOUVEAU', 'RÉSOLU', 'IGNORÉ')) NOT NULL,
    anonymous BOOLEAN DEFAULT TRUE NOT NULL,
    reporter_name TEXT,
    reporter_phone TEXT,
    involved TEXT,
    details TEXT NOT NULL
);

-- Table 11 : Run Series (Runs récurrents)
CREATE TABLE IF NOT EXISTS run_series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
    start_time TIME NOT NULL,
    max_radius_meters INTEGER DEFAULT 50 NOT NULL,
    location_gps POINT NOT NULL,
    reminder_offset_minutes INTEGER DEFAULT 30
);

-- Ajout des clés étrangères et contraintes croisées après création des tables
ALTER TABLE runs ADD CONSTRAINT fk_runs_series FOREIGN KEY (series_id) REFERENCES run_series(id) ON DELETE SET NULL;


-- --------------------------------------------
-- 2. CRÉATION DES FONCTIONS ET TRIGGERS
-- --------------------------------------------

-- Fonction de promotion de liste d'attente
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

-- Trigger d'auto-création de profil public.members et public.clubs à la création d'un utilisateur auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Création du profil membre
    INSERT INTO public.members (id, firstname, lastname, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstname', NEW.raw_user_meta_data->>'name', 'Coureur'),
        NEW.raw_user_meta_data->>'lastname',
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Création du club associé si c'est un capitaine qui s'inscrit
    INSERT INTO public.clubs (id, whatsapp_display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'club_name', 'MON RUN CLUB')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attachement du trigger à auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- --------------------------------------------
-- 3. POLITIQUES DE SÉCURITÉ (RLS)
-- --------------------------------------------

-- Table : clubs
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des clubs" ON clubs;
CREATE POLICY "Lecture publique des clubs" ON clubs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestion complète de son club par le fondateur" ON clubs;
CREATE POLICY "Gestion complète de son club par le fondateur" ON clubs FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Table : runs
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des runs" ON runs;
CREATE POLICY "Lecture publique des runs" ON runs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Création de runs par les Captains authentifiés" ON runs;
CREATE POLICY "Création de runs par les Captains authentifiés" ON runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);
DROP POLICY IF EXISTS "Modification des runs par leur Captain" ON runs;
CREATE POLICY "Modification des runs par leur Captain" ON runs FOR UPDATE TO authenticated USING (auth.uid() = captain_id OR auth.uid() = club_id) WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);
DROP POLICY IF EXISTS "Suppression des runs par leur Captain" ON runs;
CREATE POLICY "Suppression des runs par leur Captain" ON runs FOR DELETE TO authenticated USING (auth.uid() = captain_id OR auth.uid() = club_id);

-- Table : members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des membres" ON members;
CREATE POLICY "Lecture publique des membres" ON members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestion de son propre membre par l'utilisateur" ON members;
CREATE POLICY "Gestion de son propre membre par l'utilisateur" ON members FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Table : profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Captains update their own profile" ON public.profiles;
CREATE POLICY "Captains update their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Table : memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des memberships" ON memberships;
CREATE POLICY "Lecture publique des memberships" ON memberships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestion des memberships par le fondateur du club" ON memberships;
CREATE POLICY "Gestion des memberships par le fondateur du club" ON memberships FOR ALL TO authenticated USING (auth.uid() = club_id) WITH CHECK (auth.uid() = club_id);

-- Table : run_participants
ALTER TABLE run_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les athlètes voient leurs propres inscriptions" ON run_participants;
CREATE POLICY "Les athlètes voient leurs propres inscriptions" ON run_participants FOR SELECT TO authenticated USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Les athlètes peuvent s'inscrire" ON run_participants;
CREATE POLICY "Les athlètes peuvent s'inscrire" ON run_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id);
DROP POLICY IF EXISTS "L'athlète valide son propre check-in" ON run_participants;
CREATE POLICY "L'athlète valide son propre check-in" ON run_participants FOR UPDATE TO authenticated USING (auth.uid() = member_id) WITH CHECK (auth.uid() = member_id);

-- Table : runners
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès public en écriture des runners" ON runners;
CREATE POLICY "Accès public en écriture des runners" ON runners FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Accès restreint aux Captains pour la lecture des runners" ON runners;
CREATE POLICY "Accès restreint aux Captains pour la lecture des runners" ON runners FOR SELECT TO authenticated USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Accès restreint aux Captains pour la mise à jour des runners" ON runners;
CREATE POLICY "Accès restreint aux Captains pour la mise à jour des runners" ON runners FOR UPDATE TO authenticated USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
) WITH CHECK (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Accès restreint aux Captains pour la suppression des runners" ON runners;
CREATE POLICY "Accès restreint aux Captains pour la suppression des runners" ON runners FOR DELETE TO authenticated USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);

-- Table : registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès public en lecture des registrations" ON registrations;
CREATE POLICY "Accès public en lecture des registrations" ON registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Accès public en écriture des registrations" ON registrations;
CREATE POLICY "Accès public en écriture des registrations" ON registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Accès public en mise à jour des registrations" ON registrations;
CREATE POLICY "Accès public en mise à jour des registrations" ON registrations FOR UPDATE USING (true);

-- Table : broadcast_queue
ALTER TABLE broadcast_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aucun accès client à la queue de diffusion" ON broadcast_queue;
CREATE POLICY "Aucun accès client à la queue de diffusion" ON broadcast_queue FOR ALL TO service_role USING (true);

-- Table : incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès public en insertion pour les incidents" ON incidents;
CREATE POLICY "Accès public en insertion pour les incidents" ON incidents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Accès restreint en lecture aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en lecture aux Captains authentifiés" ON incidents FOR SELECT TO authenticated USING (club_id = auth.uid());
DROP POLICY IF EXISTS "Accès restreint en modification aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en modification aux Captains authentifiés" ON incidents FOR UPDATE TO authenticated USING (club_id = auth.uid()) WITH CHECK (club_id = auth.uid());
DROP POLICY IF EXISTS "Accès restreint en suppression aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en suppression aux Captains authentifiés" ON incidents FOR DELETE TO authenticated USING (club_id = auth.uid());

-- Table : run_series
ALTER TABLE run_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des series" ON run_series;
CREATE POLICY "Lecture publique des series" ON run_series FOR SELECT USING (true);
DROP POLICY IF EXISTS "Création de series par les fondateurs" ON run_series;
CREATE POLICY "Création de series par les fondateurs" ON run_series FOR INSERT TO authenticated WITH CHECK (auth.uid() = club_id);
DROP POLICY IF EXISTS "Modification des series par leur fondateur" ON run_series;
CREATE POLICY "Modification des series par leur fondateur" ON run_series FOR UPDATE TO authenticated USING (auth.uid() = club_id) WITH CHECK (auth.uid() = club_id);
DROP POLICY IF EXISTS "Suppression des series par leur fondateur" ON run_series;
CREATE POLICY "Suppression des series par leur fondateur" ON run_series FOR DELETE TO authenticated USING (auth.uid() = club_id);


-- --------------------------------------------
-- 4. INSERTION DES DONNÉES DE DÉMONSTRATION (SEED)
-- --------------------------------------------

-- Nettoyage des anciens runs de test s'ils existent
TRUNCATE TABLE runs CASCADE;

INSERT INTO runs (title, description, date_start, location_start, is_paid, price_cents, max_slots, slots_taken, vibe, coach, status, scheduled_at, start_latitude, start_longitude) VALUES
  ('MORNING VIBES', 'Run social le long du canal avec arrêt café au Social Spot. Idéal pour les débutants.', NOW() + INTERVAL '2 hours', 'Social Spot → Canal St Martin', FALSE, 0, NULL, 47, 'Social & Chill', 'Alex Rivière', 'scheduled', NOW() + INTERVAL '2 hours', 48.8712, 2.3685),
  ('TEMPO THURSDAY', 'Séance de fractionné au Trocadéro. 4x1000m avec récupération active.', NOW() + INTERVAL '3 days', 'Trocadéro → Bois de Boulogne', FALSE, 0, NULL, 32, 'Performance', 'Chloé Simon', 'scheduled', NOW() + INTERVAL '3 days', 48.8629, 2.2872),
  ('SATURDAY CREW', 'Le run signature du samedi matin. Brunch offert au Social Spot après la session.', NOW() + INTERVAL '5 days', 'Social Spot → Parc des Buttes-Chaumont', FALSE, 0, NULL, 58, 'Social & Chill', 'Alex Rivière', 'scheduled', NOW() + INTERVAL '5 days', 48.8712, 2.3685),
  ('BERLIN SQUAD TRAINING', 'Entraînement spécial Marathon de Berlin. Séance exclusive réservée aux membres qualifiés.', NOW() + INTERVAL '7 days', 'Stade Charléty → Piste d''athlétisme', TRUE, 1500, 40, 12, 'Performance', 'Chloé Simon', 'scheduled', NOW() + INTERVAL '7 days', 48.8182, 2.3486),
  ('SUNSET SPRINT', 'Sprint final le long du canal avec le coucher de soleil.', NOW() - INTERVAL '5 days', 'Canal St Martin → Bastille', FALSE, 0, NULL, 42, 'Performance', 'Chloé Simon', 'completed', NOW() - INTERVAL '5 days', 48.8712, 2.3685),
  ('RECOVERY LOOP', 'Session douce pour les membres en récupération. Stretching collectif.', NOW() - INTERVAL '8 days', 'Parc Monceau', FALSE, 0, NULL, 28, 'Récupération', 'Alex Rivière', 'completed', NOW() - INTERVAL '8 days', 48.8787, 2.3089);
