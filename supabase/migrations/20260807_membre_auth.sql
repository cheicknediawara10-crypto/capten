-- CAPTEN — Authentification membre sans Supabase Auth
-- Nom + Date de naissance + PIN 4 chiffres (hash scrypt)
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────────
-- 1. Table principale des membres (hors Supabase Auth)
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

CREATE INDEX IF NOT EXISTS idx_membre_name_dob
  ON membre_profiles (lower(last_name), lower(first_name), date_of_birth);

CREATE INDEX IF NOT EXISTS idx_membre_email
  ON membre_profiles (lower(email)) WHERE email IS NOT NULL;

-- ─────────────────────────────────────────────
-- 2. Lien membre ↔ club
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- 3. Fiches ICE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membre_ice (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id    UUID NOT NULL UNIQUE REFERENCES membre_profiles(id) ON DELETE CASCADE,
  contact_name  TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship  TEXT,
  blood_type    TEXT,
  allergies     TEXT,
  medical_notes TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. Décharges numériques
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- 5. Check-ins membres
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- 6. Reset PIN (Email + Magic Link)
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- 7. RLS — service role uniquement (auth via cookie session)
-- ─────────────────────────────────────────────
ALTER TABLE membre_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_club       ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_ice        ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_waivers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_checkins   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membre_pin_resets ENABLE ROW LEVEL SECURITY;

-- Anon peut lire les check-ins d'un event (pour le registre live)
CREATE POLICY "Anon read membre_checkins" ON membre_checkins
  FOR SELECT USING (true);

-- Service role has full access (used from Server Actions)
-- No other policies needed — all writes go through service role key
