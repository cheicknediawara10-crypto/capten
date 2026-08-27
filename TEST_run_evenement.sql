-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — TEST de la feature Run Événement (allocation jauge + liste d'attente)
--
--  SÛR : tout est enveloppé dans BEGIN … ROLLBACK → AUCUNE donnée n'est laissée
--  en base. À exécuter dans Supabase → SQL Editor → Run.
--
--  Scénario : événement de test à jauge = 2, on inscrit 4 coureurs.
--  Attendu : 2 inscrits (place confirmée) + 2 en liste d'attente (rangs 1 et 2).
--  Prouve que la fonction atomique register_event_inscription ne sur-vend jamais.
--
--  NOTE : réutilise ton club existant (clubs.id est fourni explicitement dans
--  ton modèle, pas auto-généré) — l'événement de test est de toute façon annulé.
-- ════════════════════════════════════════════════════════════════════════
BEGIN;

DO $$
DECLARE
  v_owner      UUID;
  v_club       UUID;
  v_event      UUID;
  v_main_count INT;
  v_wl_count   INT;
  v_positions  INT[];
BEGIN
  -- Réutilise un club existant + son fondateur (FK club_id / created_by).
  SELECT id, owner_id INTO v_club, v_owner FROM public.clubs ORDER BY created_at ASC LIMIT 1;
  IF v_club IS NULL THEN
    RAISE EXCEPTION 'Aucun club en base — crée ton crew d''abord, puis relance.';
  END IF;
  IF v_owner IS NULL THEN
    SELECT id INTO v_owner FROM public.profiles ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Événement de TEST (jauge = 2, publié) sous ce club.
  INSERT INTO public.events (club_id, created_by, title, event_date, status, is_evenement, jauge_max, devise)
    VALUES (v_club, v_owner, 'Run test (rollback)', now() + interval '2 days', 'published', true, 2, 'EUR')
    RETURNING id INTO v_event;

  -- 4 inscriptions via la fonction ATOMIQUE anti-surbooking.
  PERFORM public.register_event_inscription(v_event, NULL, 'Un',     'Coureur', NULL, NULL);
  PERFORM public.register_event_inscription(v_event, NULL, 'Deux',   'Coureur', NULL, NULL);
  PERFORM public.register_event_inscription(v_event, NULL, 'Trois',  'Coureur', NULL, NULL);
  PERFORM public.register_event_inscription(v_event, NULL, 'Quatre', 'Coureur', NULL, NULL);

  SELECT count(*) INTO v_main_count FROM public.event_inscriptions
    WHERE event_id = v_event AND position_liste_attente IS NULL;
  SELECT count(*) INTO v_wl_count FROM public.event_inscriptions
    WHERE event_id = v_event AND position_liste_attente IS NOT NULL;
  SELECT array_agg(position_liste_attente ORDER BY position_liste_attente) INTO v_positions
    FROM public.event_inscriptions
    WHERE event_id = v_event AND position_liste_attente IS NOT NULL;

  RAISE NOTICE '— Inscrits (attendu 2) ............ %', v_main_count;
  RAISE NOTICE '— Liste d''attente (attendu 2) .... %', v_wl_count;
  RAISE NOTICE '— Rangs liste d''attente (attendu {1,2}) : %', v_positions;

  IF v_main_count <> 2 OR v_wl_count <> 2 OR v_positions <> ARRAY[1,2] THEN
    RAISE EXCEPTION '❌ ÉCHEC : allocation incorrecte (inscrits=%, attente=%, rangs=%)',
      v_main_count, v_wl_count, v_positions;
  END IF;

  RAISE NOTICE '✅ SUCCÈS : jauge respectée — 2 inscrits, 2 en liste d''attente (rangs 1,2). Aucun surbooking.';
END $$;

ROLLBACK;
-- (ROLLBACK : la BDD est laissée exactement dans l'état initial, zéro trace.)
