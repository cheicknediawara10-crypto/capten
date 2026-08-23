-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — VERROUILLAGE SÉCURITÉ CONSOLIDÉ (CLUBS + EVENTS)
--  À exécuter dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Table CLUBS : révocation de l'accès total
REVOKE SELECT ON public.clubs FROM anon;

-- 2. Table CLUBS : autorisation des seules colonnes publiques nécessaires
GRANT SELECT (
  id,
  owner_id,
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

-- 3. Table EVENTS : révocation de l'accès total
REVOKE SELECT ON public.events FROM anon;

-- 4. Table EVENTS : autorisation des seules colonnes publiques
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

-- 5. RLS stricte sur events pour la clé publique (sorties publiées / terminées)
DROP POLICY IF EXISTS "Published events are public" ON public.events;
CREATE POLICY "Published events are public" ON public.events
  FOR SELECT TO anon
  USING (status IN ('published', 'completed'));
