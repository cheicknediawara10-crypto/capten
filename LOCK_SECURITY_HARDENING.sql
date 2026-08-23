-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — VERROUILLAGE TOTAL DE SÉCURITÉ (CLUBS + EVENTS)
--  À exécuter dans Supabase → SQL Editor → Run (1 seul clic).
--
--  1. TABLE CLUBS :
--     On retire l'accès total d'anon sur `clubs` pour stopper le leak des
--     données financières (cagnotte_data, stripe_*, owner_id, twilio_*).
--     Anon ne pourra lire QUE les colonnes publiques nécessaires aux pages /join.
--
--  2. TABLE EVENTS :
--     Anon ne pourra lire QUE les sorties publiées et les colonnes publiques.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Verrouillage de la table CLUBS
REVOKE SELECT ON public.clubs FROM anon;

GRANT SELECT (
  id,
  name,
  slug,
  description,
  logo_url,
  city,
  website_url,
  instagram_url,
  community_type,
  community_type_custom,
  sport_type,
  created_at,
  is_active,
  plan,
  stripe_plan,
  stripe_subscription_status,
  trial_ends_at,
  first_run_created_at,
  signup_variant,
  spot_name,
  branding
) ON public.clubs TO anon;

-- 2. Verrouillage de la table EVENTS
REVOKE SELECT ON public.events FROM anon;

GRANT SELECT (
  id,
  club_id,
  title,
  description,
  event_date,
  meeting_point_address,
  meeting_point_lat,
  meeting_point_lng,
  max_participants,
  status,
  checkin_radius_meters,
  distance_km,
  photos_url,
  created_at
) ON public.events TO anon;

-- RLS stricte : la clé publique ne lit que les events publiés ou terminés
DROP POLICY IF EXISTS "Published events are public" ON public.events;
CREATE POLICY "Published events are public" ON public.events
  FOR SELECT TO anon
  USING (status IN ('published', 'completed'));
