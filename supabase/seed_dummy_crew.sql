-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — SEED DE DONNÉES FACTICES POUR LE DÉVELOPPEMENT & LES TESTS
--  Permet de tester 100% de l'application sans JAMAIS utiliser de vraies données.
--  À exécuter dans Supabase → SQL Editor → Run (si besoin de tester).
-- ════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_demo_club_id UUID;
  v_member_1 UUID;
  v_member_2 UUID;
  v_member_3 UUID;
  v_member_4 UUID;
  v_member_5 UUID;
  v_event_upcoming UUID;
  v_event_past UUID;
  v_spot_id UUID;
BEGIN

  -- 1. Nettoyage d'un éventuel précédent crew de démo
  DELETE FROM public.clubs WHERE slug = 'demo-night-runners';

  -- 2. Création du club de démo
  INSERT INTO public.clubs (
    name,
    slug,
    description,
    city,
    sport_type,
    community_type,
    is_active,
    plan,
    stripe_plan,
    stripe_subscription_status,
    created_at
  ) VALUES (
    'Night Runners Paris (Démo)',
    'demo-night-runners',
    'Crew de running urbain tous niveaux. Sorties hebdomadaires et after-run convivial.',
    'Paris',
    'run',
    'run_club',
    true,
    'pro',
    'pro',
    'active',
    now()
  ) RETURNING id INTO v_demo_club_id;

  -- 3. Création de profils de faux coureurs (Données 100% inventées)
  INSERT INTO public.membre_profiles (first_name, last_name, phone, birth_date)
  VALUES ('Thomas', 'Martin', '+33600000001', '1995-04-12')
  RETURNING id INTO v_member_1;

  INSERT INTO public.membre_profiles (first_name, last_name, phone, birth_date)
  VALUES ('Léa', 'Dubois', '+33600000002', '1998-09-24')
  RETURNING id INTO v_member_2;

  INSERT INTO public.membre_profiles (first_name, last_name, phone, birth_date)
  VALUES ('Lucas', 'Bernard', '+33600000003', '1992-11-03')
  RETURNING id INTO v_member_3;

  INSERT INTO public.membre_profiles (first_name, last_name, phone, birth_date)
  VALUES ('Camille', 'Petit', '+33600000004', '1996-07-19')
  RETURNING id INTO v_member_4;

  INSERT INTO public.membre_profiles (first_name, last_name, phone, birth_date)
  VALUES ('Maxime', 'Robert', '+33600000005', '1990-01-30')
  RETURNING id INTO v_member_5;

  -- 4. Inscription des faux membres au club
  INSERT INTO public.membre_club (club_id, membre_id, is_active, joined_at) VALUES
    (v_demo_club_id, v_member_1, true, now() - INTERVAL '30 days'),
    (v_demo_club_id, v_member_2, true, now() - INTERVAL '20 days'),
    (v_demo_club_id, v_member_3, true, now() - INTERVAL '15 days'),
    (v_demo_club_id, v_member_4, true, now() - INTERVAL '5 days'),
    (v_demo_club_id, v_member_5, true, now() - INTERVAL '1 day');

  -- 5. Faux contacts d'urgence (ICE)
  INSERT INTO public.membre_ice (membre_id, contact_name, contact_phone, relationship, medical_notes) VALUES
    (v_member_1, 'Sophie Martin', '+33600000099', 'Conjointe', 'Aucune allergie'),
    (v_member_2, 'Pierre Dubois', '+33600000098', 'Père', 'Asthme d effort léger'),
    (v_member_3, 'Julie Bernard', '+33600000097', 'Sœur', NULL);

  -- 6. Fausses décharges de responsabilité signées
  INSERT INTO public.membre_waivers (club_id, membre_id, signed_at, waiver_version) VALUES
    (v_demo_club_id, v_member_1, now() - INTERVAL '30 days', '1.0'),
    (v_demo_club_id, v_member_2, now() - INTERVAL '20 days', '1.0'),
    (v_demo_club_id, v_member_3, now() - INTERVAL '15 days', '1.0'),
    (v_demo_club_id, v_member_4, now() - INTERVAL '5 days', '1.0'),
    (v_demo_club_id, v_member_5, now() - INTERVAL '1 day', '1.0');

  -- 7. Création de 2 sorties d'exemple (1 passée avec check-ins, 1 future)
  INSERT INTO public.events (
    club_id,
    created_by,
    title,
    description,
    event_date,
    meeting_point_address,
    meeting_point_lat,
    meeting_point_lng,
    status,
    distance_km,
    checkin_radius_meters
  ) VALUES (
    v_demo_club_id,
    v_demo_club_id,
    'Run Hebdo #12 — République & Canal',
    'Sortie 8km avec 3 sas d allures et serre-file 🛡️',
    now() - INTERVAL '3 days',
    'Place de la République, Paris',
    48.8675,
    2.3639,
    'completed',
    8.0,
    200
  ) RETURNING id INTO v_event_past;

  INSERT INTO public.events (
    club_id,
    created_by,
    title,
    description,
    event_date,
    meeting_point_address,
    meeting_point_lat,
    meeting_point_lng,
    status,
    distance_km,
    checkin_radius_meters
  ) VALUES (
    v_demo_club_id,
    v_demo_club_id,
    'Run Jeudi Soir — Bastille & Seine',
    'Session 9km tranquille, allure 5:45/km. After-run au Spot partenaire après les étirements !',
    now() + INTERVAL '3 days',
    'Place de la Bastille, Paris',
    48.8531,
    2.3698,
    'published',
    9.0,
    200
  ) RETURNING id INTO v_event_upcoming;

  -- 8. Faux check-ins sur la sortie passée
  INSERT INTO public.membre_checkins (event_id, membre_id, checked_in_at, is_valid, method) VALUES
    (v_event_past, v_member_1, now() - INTERVAL '3 days' + INTERVAL '5 minutes', true, 'gps'),
    (v_event_past, v_member_2, now() - INTERVAL '3 days' + INTERVAL '8 minutes', true, 'gps'),
    (v_event_past, v_member_3, now() - INTERVAL '3 days' + INTERVAL '12 minutes', true, 'qr_code');

  -- 9. Création d'un Spot Partenaire de démo
  INSERT INTO public.crew_spots (
    club_id,
    nom,
    categorie,
    adresse,
    avantage,
    mot_du_fondateur,
    status
  ) VALUES (
    v_demo_club_id,
    'Le Café des Runners',
    'bar',
    '12 Rue Oberkampf, 75011 Paris',
    'Happy Hour prolongé + boisson offerte dès 10 coureurs',
    'Super spot pour décompresser après les 8km !',
    'validated'
  );

  RAISE NOTICE 'Seed terminé avec succès pour le club demo-night-runners !';
END $$;
