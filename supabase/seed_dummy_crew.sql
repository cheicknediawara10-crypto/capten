-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — SEED DE DONNÉES FACTICES POUR LE DÉVELOPPEMENT & LES TESTS
--
--  Objectif : pouvoir tester/démoser 100% de l'app sans JAMAIS toucher à de
--  vraies données de coureurs. Les 5 membres ci-dessous sont 100% inventés.
--
--  À exécuter dans Supabase → SQL Editor → Run.
--  Idempotent + auto-nettoyant : re-lançable sans créer de doublons.
--
--  NOTE ARCHITECTURE : `clubs.owner_id` et `events.created_by` pointent vers
--  `profiles(id)`, qui référence `auth.users(id)`. On ne peut donc PAS
--  fabriquer un faux fondateur en pur SQL. Le crew de démo est donc rattaché
--  à TON compte fondateur existant (récupéré automatiquement) — mais tous les
--  MEMBRES restent factices. Aucune vraie donnée de coureur n'est utilisée.
-- ════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_owner         UUID;
  v_demo_club_id  UUID;
  v_member_1 UUID; v_member_2 UUID; v_member_3 UUID; v_member_4 UUID; v_member_5 UUID;
  v_event_upcoming UUID;
  v_event_past     UUID;
BEGIN
  -- 0. Fondateur : on rattache la démo à un compte fondateur EXISTANT.
  SELECT id INTO v_owner FROM public.profiles ORDER BY created_at ASC LIMIT 1;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Aucun profil fondateur trouvé. Crée d''abord ton compte fondateur (inscription), puis relance ce script.';
  END IF;

  -- 1. Nettoyage d'un éventuel précédent crew de démo (cascade : events,
  --    liens membre_club, décharges, check-ins…) + des membres factices.
  DELETE FROM public.clubs WHERE slug = 'demo-night-runners';
  DELETE FROM public.membre_profiles WHERE phone LIKE '+3360000000%';

  -- 2. Club de démo (rattaché à TON compte fondateur)
  INSERT INTO public.clubs (
    owner_id, name, slug, description, city, sport_type, community_type,
    is_active, plan, stripe_plan, stripe_subscription_status, created_at
  ) VALUES (
    v_owner,
    'Night Runners Paris (Démo)',
    'demo-night-runners',
    'Crew de running urbain tous niveaux. Sorties hebdomadaires et after-run convivial.',
    'Paris', 'run', 'run_club',
    true, 'pro', 'pro', 'active', now()
  ) RETURNING id INTO v_demo_club_id;

  -- 3. 5 faux coureurs (données 100% inventées). pin_hash/pin_salt sont des
  --    placeholders : ces comptes ne peuvent PAS se connecter (aucun vrai PIN).
  INSERT INTO public.membre_profiles (first_name, last_name, phone, date_of_birth, pin_hash, pin_salt)
  VALUES ('Thomas','Martin','+33600000001','1995-04-12','SEED_NO_LOGIN','SEED_NO_LOGIN')
  RETURNING id INTO v_member_1;
  INSERT INTO public.membre_profiles (first_name, last_name, phone, date_of_birth, pin_hash, pin_salt)
  VALUES ('Léa','Dubois','+33600000002','1998-09-24','SEED_NO_LOGIN','SEED_NO_LOGIN')
  RETURNING id INTO v_member_2;
  INSERT INTO public.membre_profiles (first_name, last_name, phone, date_of_birth, pin_hash, pin_salt)
  VALUES ('Lucas','Bernard','+33600000003','1992-11-03','SEED_NO_LOGIN','SEED_NO_LOGIN')
  RETURNING id INTO v_member_3;
  INSERT INTO public.membre_profiles (first_name, last_name, phone, date_of_birth, pin_hash, pin_salt)
  VALUES ('Camille','Petit','+33600000004','1996-07-19','SEED_NO_LOGIN','SEED_NO_LOGIN')
  RETURNING id INTO v_member_4;
  INSERT INTO public.membre_profiles (first_name, last_name, phone, date_of_birth, pin_hash, pin_salt)
  VALUES ('Maxime','Robert','+33600000005','1990-01-30','SEED_NO_LOGIN','SEED_NO_LOGIN')
  RETURNING id INTO v_member_5;

  -- 4. Inscription des faux membres au club
  INSERT INTO public.membre_club (club_id, membre_id, is_active, joined_at) VALUES
    (v_demo_club_id, v_member_1, true, now() - INTERVAL '30 days'),
    (v_demo_club_id, v_member_2, true, now() - INTERVAL '20 days'),
    (v_demo_club_id, v_member_3, true, now() - INTERVAL '15 days'),
    (v_demo_club_id, v_member_4, true, now() - INTERVAL '5 days'),
    (v_demo_club_id, v_member_5, true, now() - INTERVAL '1 day');

  -- 5. Fiches ICE factices
  INSERT INTO public.membre_ice (membre_id, contact_name, contact_phone, relationship, medical_notes) VALUES
    (v_member_1, 'Sophie Martin',  '+33600000099', 'Conjointe', 'Aucune allergie'),
    (v_member_2, 'Pierre Dubois',  '+33600000098', 'Père',      'Asthme d''effort léger'),
    (v_member_3, 'Julie Bernard',  '+33600000097', 'Sœur',      NULL);

  -- 6. Décharges signées factices (signature_hash = placeholder)
  INSERT INTO public.membre_waivers (club_id, membre_id, signed_at, signature_hash, waiver_version) VALUES
    (v_demo_club_id, v_member_1, now() - INTERVAL '30 days', 'SEED_SIGNATURE', 'v1'),
    (v_demo_club_id, v_member_2, now() - INTERVAL '20 days', 'SEED_SIGNATURE', 'v1'),
    (v_demo_club_id, v_member_3, now() - INTERVAL '15 days', 'SEED_SIGNATURE', 'v1'),
    (v_demo_club_id, v_member_4, now() - INTERVAL '5 days',  'SEED_SIGNATURE', 'v1'),
    (v_demo_club_id, v_member_5, now() - INTERVAL '1 day',   'SEED_SIGNATURE', 'v1');

  -- 7. 2 sorties (1 passée avec check-ins, 1 future). created_by = fondateur.
  INSERT INTO public.events (
    club_id, created_by, title, description, event_date,
    meeting_point_address, meeting_point_lat, meeting_point_lng,
    status, distance_km, checkin_radius_meters
  ) VALUES (
    v_demo_club_id, v_owner,
    'Run Hebdo #12 — République & Canal',
    'Sortie 8km avec 3 sas d''allures et serre-file 🛡️',
    now() - INTERVAL '3 days',
    'Place de la République, Paris', 48.8675, 2.3639,
    'completed', 8.0, 200
  ) RETURNING id INTO v_event_past;

  INSERT INTO public.events (
    club_id, created_by, title, description, event_date,
    meeting_point_address, meeting_point_lat, meeting_point_lng,
    status, distance_km, checkin_radius_meters
  ) VALUES (
    v_demo_club_id, v_owner,
    'Run Jeudi Soir — Bastille & Seine',
    'Session 9km tranquille, allure 5:45/km. After-run au Spot partenaire après les étirements !',
    now() + INTERVAL '3 days',
    'Place de la Bastille, Paris', 48.8531, 2.3698,
    'published', 9.0, 200
  ) RETURNING id INTO v_event_upcoming;

  -- 8. Faux check-ins sur la sortie passée (méthodes valides : gps / qr_code)
  INSERT INTO public.membre_checkins (event_id, membre_id, checked_in_at, is_valid, method) VALUES
    (v_event_past, v_member_1, now() - INTERVAL '3 days' + INTERVAL '5 minutes',  true, 'gps'),
    (v_event_past, v_member_2, now() - INTERVAL '3 days' + INTERVAL '8 minutes',  true, 'gps'),
    (v_event_past, v_member_3, now() - INTERVAL '3 days' + INTERVAL '12 minutes', true, 'qr_code');

  -- 9. Spot partenaire de démo (categorie valide : cafe/shop/kine/osteo/autre)
  INSERT INTO public.crew_spots (club_id, nom, categorie, adresse, avantage, mot_du_fondateur) VALUES
    (v_demo_club_id, 'Le Café des Runners', 'cafe', '12 Rue Oberkampf, 75011 Paris',
     'Happy Hour prolongé + boisson offerte dès 10 coureurs',
     'Super spot pour décompresser après les 8km !');

  RAISE NOTICE 'Seed OK : crew « demo-night-runners » créé (owner=%), 5 membres factices, 2 sorties, 3 check-ins, 1 spot.', v_owner;
END $$;
