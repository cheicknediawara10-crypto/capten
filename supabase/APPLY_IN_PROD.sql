-- ============================================================================
-- CAPTEN — BOOTSTRAP PRODUCTION COMPLET (idempotent, ré-exécutable)
-- ============================================================================
-- À exécuter dans Supabase SQL Editor (Role: postgres) → New query → Run.
--
-- Corrige :
--   - schéma de base jamais appliqué en entier (events / enums manquants)
--   - "CREATE POLICY IF NOT EXISTS" (syntaxe invalide) → DROP + CREATE
--   - "type checkin_method does not exist"
--   - "relation events does not exist"
--
-- Contenu, dans le bon ordre de dépendances :
--   1. Extensions + enums
--   2. Schéma de base (profiles, clubs, events, checkins, badges, ...)
--   3. Fonctions / triggers / vue / seed badges
--   4. Auth membre PIN (membre_profiles, ...)
--   5. Les Spots du Crew (crew_spots)
--
-- AUCUNE instruction destructive sur les données (pas de DROP TABLE / DELETE).
-- Ré-exécutable sans erreur "already exists".
-- ============================================================================


-- ─────────────────────────────────────────────
-- 1. Extensions + Enums
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE profile_role        AS ENUM ('organizer', 'member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE sport_type          AS ENUM ('run', 'walk', 'trail', 'rando', 'mixed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE club_role           AS ENUM ('member', 'co_organizer', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE event_status        AS ENUM ('draft', 'published', 'cancelled', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_status AS ENUM ('registered', 'cancelled', 'waitlisted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE checkin_method      AS ENUM ('gps', 'qr_code', 'manual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE spot_tx_status      AS ENUM ('pending', 'confirmed', 'paid_out'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE badge_category      AS ENUM ('participation', 'discovery', 'community', 'loyalty'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────
-- 2. Schéma de base
-- ─────────────────────────────────────────────

-- profiles — extends auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  role profile_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- clubs
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  instagram_url TEXT,
  whatsapp_link TEXT,
  city TEXT,
  sport_type sport_type NOT NULL DEFAULT 'run',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clubs_owner ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
CREATE INDEX IF NOT EXISTS idx_clubs_city ON clubs(city);
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clubs are viewable by everyone" ON clubs;
CREATE POLICY "Clubs are viewable by everyone" ON clubs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Organizers can create clubs" ON clubs;
CREATE POLICY "Organizers can create clubs" ON clubs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
);
DROP POLICY IF EXISTS "Owners can update their clubs" ON clubs;
CREATE POLICY "Owners can update their clubs" ON clubs FOR UPDATE USING (auth.uid() = owner_id);

-- club_members
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role club_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  referred_by UUID REFERENCES club_members(id) ON DELETE SET NULL,
  UNIQUE(club_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_member_id ON club_members(member_id);
CREATE INDEX IF NOT EXISTS idx_club_members_referral ON club_members(referral_code);
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members viewable by everyone" ON club_members;
CREATE POLICY "Members viewable by everyone" ON club_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join clubs" ON club_members;
CREATE POLICY "Users can join clubs" ON club_members FOR INSERT WITH CHECK (auth.uid() = member_id);
DROP POLICY IF EXISTS "Club admins can update members" ON club_members;
CREATE POLICY "Club admins can update members" ON club_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_members.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);

-- events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  meeting_point_lat DOUBLE PRECISION,
  meeting_point_lng DOUBLE PRECISION,
  meeting_point_address TEXT,
  max_participants INTEGER,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  checkin_radius_meters INTEGER NOT NULL DEFAULT 200,
  photos_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published events are public" ON events;
CREATE POLICY "Published events are public" ON events FOR SELECT USING (status = 'published' OR status = 'completed');
DROP POLICY IF EXISTS "Club admins can see all events" ON events;
CREATE POLICY "Club admins can see all events" ON events FOR SELECT USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = events.club_id AND cm.member_id = auth.uid())
);
DROP POLICY IF EXISTS "Club admins can manage events" ON events;
CREATE POLICY "Club admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = events.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);

-- event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status registration_status NOT NULL DEFAULT 'registered',
  UNIQUE(event_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_member ON event_registrations(member_id);
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Registrations viewable by club admins and self" ON event_registrations;
CREATE POLICY "Registrations viewable by club admins and self" ON event_registrations FOR SELECT USING (
  auth.uid() = member_id OR
  EXISTS (SELECT 1 FROM events e JOIN club_members cm ON e.club_id = cm.club_id WHERE e.id = event_registrations.event_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);
DROP POLICY IF EXISTS "Users can register themselves" ON event_registrations;
CREATE POLICY "Users can register themselves" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = member_id);
DROP POLICY IF EXISTS "Users can update own registration" ON event_registrations;
CREATE POLICY "Users can update own registration" ON event_registrations FOR UPDATE USING (auth.uid() = member_id);

-- checkins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_from_meeting_point DOUBLE PRECISION,
  method checkin_method NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(event_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_checkins_event ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_member ON checkins(member_id);
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Checkins viewable by self and admins" ON checkins;
CREATE POLICY "Checkins viewable by self and admins" ON checkins FOR SELECT USING (
  auth.uid() = member_id OR
  EXISTS (SELECT 1 FROM events e JOIN club_members cm ON e.club_id = cm.club_id WHERE e.id = checkins.event_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);
DROP POLICY IF EXISTS "Users can check themselves in" ON checkins;
CREATE POLICY "Users can check themselves in" ON checkins FOR INSERT WITH CHECK (auth.uid() = member_id);

-- ice_contacts
CREATE TABLE IF NOT EXISTS ice_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  blood_type TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  medications TEXT,
  is_complete BOOLEAN GENERATED ALWAYS AS (
    emergency_contact_name IS NOT NULL AND
    emergency_contact_phone IS NOT NULL AND
    emergency_contact_relation IS NOT NULL
  ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ice_member ON ice_contacts(member_id);
ALTER TABLE ice_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own ICE info" ON ice_contacts;
CREATE POLICY "Users manage own ICE info" ON ice_contacts FOR ALL USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Admins can view ICE info" ON ice_contacts;
CREATE POLICY "Admins can view ICE info" ON ice_contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    JOIN club_members cm ON e.club_id = cm.club_id
    WHERE er.member_id = ice_contacts.member_id
    AND cm.member_id = auth.uid()
    AND cm.role IN ('admin', 'co_organizer')
    AND e.event_date >= NOW() - INTERVAL '1 day'
  )
);

-- waivers
CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  waiver_version TEXT NOT NULL DEFAULT '1.0',
  signature_hash TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(club_id, member_id, waiver_version)
);
CREATE INDEX IF NOT EXISTS idx_waivers_member_club ON waivers(member_id, club_id);
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own waivers" ON waivers;
CREATE POLICY "View own waivers" ON waivers FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Insert own waivers" ON waivers;
CREATE POLICY "Insert own waivers" ON waivers FOR INSERT WITH CHECK (auth.uid() = member_id);
DROP POLICY IF EXISTS "Admins view club waivers" ON waivers;
CREATE POLICY "Admins view club waivers" ON waivers FOR SELECT USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = waivers.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);

-- spots (ancien système CAPTEN Spots — conservé pour compat code existant)
CREATE TABLE IF NOT EXISTS spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  commission_rate DECIMAL(4,3) NOT NULL DEFAULT 0.10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Spots viewable by public" ON spots;
CREATE POLICY "Spots viewable by public" ON spots FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Club admins manage spots" ON spots;
CREATE POLICY "Club admins manage spots" ON spots FOR ALL USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = spots.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);

-- spot_transactions
CREATE TABLE IF NOT EXISTS spot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status spot_tx_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_spot_tx_spot ON spot_transactions(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_tx_club ON spot_transactions(club_id);
ALTER TABLE spot_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Club admins view transactions" ON spot_transactions;
CREATE POLICY "Club admins view transactions" ON spot_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = spot_transactions.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);
DROP POLICY IF EXISTS "Club admins insert transactions" ON spot_transactions;
CREATE POLICY "Club admins insert transactions" ON spot_transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = spot_transactions.club_id AND cm.member_id = auth.uid() AND cm.role IN ('admin', 'co_organizer'))
);

-- badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  category badge_category NOT NULL,
  threshold INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Badges are public" ON badges;
CREATE POLICY "Badges are public" ON badges FOR SELECT USING (is_active = true);

-- member_badges
CREATE TABLE IF NOT EXISTS member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  UNIQUE(member_id, badge_id, club_id)
);
CREATE INDEX IF NOT EXISTS idx_mb_member ON member_badges(member_id);
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Member badges are public" ON member_badges;
CREATE POLICY "Member badges are public" ON member_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert member badges" ON member_badges;
CREATE POLICY "Insert member badges" ON member_badges FOR INSERT WITH CHECK (true);

-- member_tokens (accès micro-page)
CREATE TABLE IF NOT EXISTS member_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_member_tokens_token ON member_tokens(token);
ALTER TABLE member_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own tokens" ON member_tokens;
CREATE POLICY "View own tokens" ON member_tokens FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Public can read tokens for micro-page" ON member_tokens;
CREATE POLICY "Public can read tokens for micro-page" ON member_tokens FOR SELECT USING (is_active = true);


-- ─────────────────────────────────────────────
-- 3. Fonctions / Triggers / Vue / Seed
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
DECLARE
  x FLOAT = 69.1 * (lat2 - lat1);
  y FLOAT = 69.1 * (lon2 - lon1) * cos(lat1 / 57.3);
BEGIN
  RETURN sqrt(x * x + y * y) * 1609.344;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_checkin()
RETURNS TRIGGER AS $$
DECLARE
  target_lat FLOAT;
  target_lng FLOAT;
  radius INT;
  dist FLOAT;
BEGIN
  IF NEW.method = 'gps' THEN
    SELECT meeting_point_lat, meeting_point_lng, checkin_radius_meters
    INTO target_lat, target_lng, radius
    FROM events WHERE id = NEW.event_id;
    IF target_lat IS NOT NULL AND target_lng IS NOT NULL AND NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
      dist := calculate_distance(target_lat, target_lng, NEW.latitude, NEW.longitude);
      NEW.distance_from_meeting_point := dist;
      NEW.is_valid := dist <= radius;
    ELSE
      NEW.is_valid := false;
    END IF;
  ELSIF NEW.method = 'qr_code' THEN
    NEW.is_valid := true;
  ELSIF NEW.method = 'manual' THEN
    NEW.is_valid := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_checkin ON checkins;
CREATE TRIGGER trg_validate_checkin BEFORE INSERT ON checkins FOR EACH ROW EXECUTE FUNCTION validate_checkin();

CREATE OR REPLACE FUNCTION award_first_run_badge()
RETURNS TRIGGER AS $$
DECLARE
  badge_uuid UUID;
BEGIN
  IF NEW.is_valid = true THEN
    SELECT id INTO badge_uuid FROM badges WHERE slug = 'first_run' AND is_active = true;
    IF badge_uuid IS NOT NULL THEN
      INSERT INTO member_badges (member_id, badge_id) VALUES (NEW.member_id, badge_uuid) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_award_first_run ON checkins;
CREATE TRIGGER trg_award_first_run AFTER INSERT ON checkins FOR EACH ROW EXECUTE FUNCTION award_first_run_badge();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::profile_role, 'member')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION create_member_token()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO member_tokens (member_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_member_token ON profiles;
CREATE TRIGGER trg_create_member_token AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_member_token();

CREATE OR REPLACE VIEW club_stats AS
SELECT
  c.id as club_id,
  c.name as club_name,
  COUNT(DISTINCT cm.member_id) as total_members,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT ch.id) as total_checkins,
  COALESCE(SUM(st.commission_amount), 0) as total_spot_revenue
FROM clubs c
LEFT JOIN club_members cm ON c.id = cm.club_id AND cm.is_active = true
LEFT JOIN events e ON c.id = e.club_id
LEFT JOIN checkins ch ON e.id = ch.event_id AND ch.is_valid = true
LEFT JOIN spot_transactions st ON c.id = st.club_id AND st.status = 'paid_out'
GROUP BY c.id, c.name;

INSERT INTO badges (slug, name, description, emoji, category, threshold) VALUES
('first_run', 'Premier Run', 'A participé à son premier événement avec succès.', '🥉', 'participation', 1),
('regular_runner', 'Régulier', 'A participé à 10 événements.', '🔥', 'participation', 10),
('legend', 'Légende', 'A participé à 100 événements.', '🏆', 'participation', 100),
('explorer', 'Explorateur', 'A participé dans 5 lieux différents.', '🌍', 'discovery', 5),
('ambassador', 'Ambassadeur', 'A parrainé 5 nouveaux membres.', '🤝', 'community', 5),
('early_member', 'Early Member', 'A rejoint le club dans son premier mois.', '⭐', 'loyalty', 1)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- 4. AUTH MEMBRE — Nom + Date de naissance + PIN 4 chiffres (hash scrypt)
-- ============================================================================

CREATE TABLE IF NOT EXISTS membre_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone         TEXT,
  email         TEXT,
  pin_hash      TEXT NOT NULL,
  pin_salt      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_membre_name_dob ON membre_profiles (lower(last_name), lower(first_name), date_of_birth);
CREATE INDEX IF NOT EXISTS idx_membre_email ON membre_profiles (lower(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS membre_club (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID NOT NULL REFERENCES membre_profiles(id) ON DELETE CASCADE,
  club_id   UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(membre_id, club_id)
);
CREATE INDEX IF NOT EXISTS idx_membre_club_membre ON membre_club(membre_id);
CREATE INDEX IF NOT EXISTS idx_membre_club_club   ON membre_club(club_id);

CREATE TABLE IF NOT EXISTS membre_ice (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id     UUID NOT NULL UNIQUE REFERENCES membre_profiles(id) ON DELETE CASCADE,
  contact_name  TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship  TEXT,
  blood_type    TEXT,
  allergies     TEXT,
  medical_notes TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membre_waivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id       UUID NOT NULL REFERENCES membre_profiles(id) ON DELETE CASCADE,
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  signed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_hash  TEXT NOT NULL,
  ip_address      TEXT,
  waiver_version  TEXT NOT NULL DEFAULT 'v1',
  UNIQUE(membre_id, club_id)
);
CREATE INDEX IF NOT EXISTS idx_waiver_membre ON membre_waivers(membre_id);
CREATE INDEX IF NOT EXISTS idx_waiver_club   ON membre_waivers(club_id);

CREATE TABLE IF NOT EXISTS membre_checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id     UUID NOT NULL REFERENCES membre_profiles(id) ON DELETE CASCADE,
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method        checkin_method NOT NULL DEFAULT 'qr_code',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  is_valid      BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(membre_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_membre_checkin_membre ON membre_checkins(membre_id);
CREATE INDEX IF NOT EXISTS idx_membre_checkin_event  ON membre_checkins(event_id);

CREATE TABLE IF NOT EXISTS membre_pin_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id  UUID NOT NULL REFERENCES membre_profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pin_reset_token  ON membre_pin_resets(token);
CREATE INDEX IF NOT EXISTS idx_pin_reset_membre ON membre_pin_resets(membre_id);

ALTER TABLE membre_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_club       ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_ice        ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_waivers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_checkins   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_pin_resets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read membre_checkins" ON membre_checkins;
CREATE POLICY "Anon read membre_checkins" ON membre_checkins FOR SELECT USING (true);


-- ============================================================================
-- 5. LES SPOTS DU CREW (zéro finance — affichage d'informations uniquement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_spots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id          UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  nom              TEXT NOT NULL,
  categorie        TEXT NOT NULL DEFAULT 'autre'
                     CHECK (categorie IN ('cafe','shop','kine','osteo','autre')),
  adresse          TEXT,
  lien_maps        TEXT,
  mot_du_fondateur TEXT,
  avantage         TEXT,
  ordre            INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, nom)
);
CREATE INDEX IF NOT EXISTS idx_crew_spots_club  ON crew_spots(club_id);
CREATE INDEX IF NOT EXISTS idx_crew_spots_ordre ON crew_spots(club_id, ordre);

ALTER TABLE crew_spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lecture publique des spots crew" ON crew_spots;
CREATE POLICY "lecture publique des spots crew" ON crew_spots FOR SELECT USING (true);
DROP POLICY IF EXISTS "fondateur gere les spots de son crew" ON crew_spots;
CREATE POLICY "fondateur gere les spots de son crew" ON crew_spots FOR ALL
  USING  (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()))
  WITH CHECK (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));


-- ============================================================================
-- FIN. Vérification (doit renvoyer 4 noms de table, aucun NULL) :
--   SELECT to_regclass('public.events')          AS events,
--          to_regclass('public.checkins')        AS checkins,
--          to_regclass('public.membre_profiles') AS membre_profiles,
--          to_regclass('public.crew_spots')      AS crew_spots;
-- ============================================================================
