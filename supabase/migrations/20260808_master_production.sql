-- ============================================================================
-- CAPTEN V1 — Script SQL de Déploiement Complet PRODUCTION (Idempotent)
-- ============================================================================
-- Ce script crée l'INTEGRALITÉ de la base de données CAPTEN dans le bon ordre :
--   1. Extensions & Enums
--   2. Tables de base (profiles, clubs, events, event_registrations)
--   3. Auth Membre (membre_profiles, membre_club, membre_ice, membre_waivers, membre_checkins, membre_pin_resets)
--   4. Les Spots du Crew (crew_spots — ZERO finance, ZERO commission, ZERO Stripe)
--   5. Polices de sécurité RLS & Indexes
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. Extensions & Enums
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE profile_role AS ENUM ('organizer', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sport_type AS ENUM ('run', 'walk', 'trail', 'rando', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE club_role AS ENUM ('member', 'co_organizer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('registered', 'cancelled', 'waitlisted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE checkin_method AS ENUM ('gps', 'qr_code', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────
-- 2. Tables de Base (Organisateur & Events)
-- ─────────────────────────────────────────────

-- profiles (organisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT UNIQUE,
  avatar_url  TEXT,
  role        profile_role NOT NULL DEFAULT 'organizer',
  date_of_birth DATE,
  pin_hash    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- clubs
CREATE TABLE IF NOT EXISTS clubs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  instagram_url TEXT,
  whatsapp_link TEXT,
  city          TEXT,
  sport_type    sport_type NOT NULL DEFAULT 'run',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  max_members   INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clubs_owner ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);

-- events (sorties/runs)
CREATE TABLE IF NOT EXISTS events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id               UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  created_by            UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title                 TEXT NOT NULL,
  description           TEXT,
  event_date            TIMESTAMPTZ NOT NULL,
  meeting_point_lat     DOUBLE PRECISION,
  meeting_point_lng     DOUBLE PRECISION,
  meeting_point_address TEXT,
  max_participants      INTEGER,
  is_recurring          BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule       TEXT,
  status                event_status NOT NULL DEFAULT 'draft',
  checkin_radius_meters INTEGER NOT NULL DEFAULT 200,
  photos_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        registration_status NOT NULL DEFAULT 'registered',
  UNIQUE(event_id, member_id)
);


-- ─────────────────────────────────────────────
-- 3. Espace Membre (Nom + DDN + PIN 4 chiffres)
-- ─────────────────────────────────────────────

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
CREATE INDEX IF NOT EXISTS idx_membre_club_club ON membre_club(club_id);

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
CREATE INDEX IF NOT EXISTS idx_waiver_club ON membre_waivers(club_id);

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
CREATE INDEX IF NOT EXISTS idx_membre_checkin_event ON membre_checkins(event_id);

CREATE TABLE IF NOT EXISTS membre_pin_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id  UUID NOT NULL REFERENCES membre_profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pin_reset_token ON membre_pin_resets(token);
CREATE INDEX IF NOT EXISTS idx_pin_reset_membre ON membre_pin_resets(membre_id);


-- ─────────────────────────────────────────────
-- 4. Les Spots du Crew (ZERO finance)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crew_spots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id          UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  nom              TEXT NOT NULL,
  categorie        TEXT NOT NULL DEFAULT 'autre' CHECK (categorie IN ('cafe','shop','kine','osteo','autre')),
  adresse          TEXT,
  lien_maps        TEXT,
  mot_du_fondateur TEXT,
  avantage         TEXT,
  ordre            INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, nom)
);
CREATE INDEX IF NOT EXISTS idx_crew_spots_club ON crew_spots(club_id);
CREATE INDEX IF NOT EXISTS idx_crew_spots_ordre ON crew_spots(club_id, ordre);


-- ─────────────────────────────────────────────
-- 5. Row Level Security (RLS) & Policies
-- ─────────────────────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_club       ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_ice        ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_waivers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_checkins   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_pin_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_spots        ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles viewable') THEN
    CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clubs' AND policyname = 'Public clubs viewable') THEN
    CREATE POLICY "Public clubs viewable" ON clubs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Public events viewable') THEN
    CREATE POLICY "Public events viewable" ON events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membre_checkins' AND policyname = 'Anon read membre_checkins') THEN
    CREATE POLICY "Anon read membre_checkins" ON membre_checkins FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crew_spots' AND policyname = 'lecture publique des spots crew') THEN
    CREATE POLICY "lecture publique des spots crew" ON crew_spots FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crew_spots' AND policyname = 'fondateur gere les spots de son crew') THEN
    CREATE POLICY "fondateur gere les spots de son crew" ON crew_spots FOR ALL
      USING  (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()))
      WITH CHECK (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
  END IF;
END $$;
