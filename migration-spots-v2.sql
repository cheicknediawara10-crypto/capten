-- ============================================================
-- CAPTEN SPOTS V2 — MIGRATION INCRÉMENTALE
-- Alignement sur le brief technique final (commission 85/10/5)
-- ============================================================
-- ⚠️ Ce script est INCRÉMENTAL : il ne casse pas les données existantes.
-- À exécuter dans Supabase SQL Editor après migration-spots.sql

-- 1. Nouvelles colonnes sur spot_tickets (logique première visite)
ALTER TABLE public.spot_tickets
  ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.spot_tickets
  ADD COLUMN IF NOT EXISTS commission_applied BOOLEAN NOT NULL DEFAULT false;

-- 2. Correction des taux par défaut sur spot_events
-- Ancien modèle : merchant 75% / club 12.5% / capten 12.5%
-- Nouveau modèle : merchant 85% / club 10% / capten 5%
ALTER TABLE public.spot_events ALTER COLUMN club_rate SET DEFAULT 0.10;
ALTER TABLE public.spot_events ALTER COLUMN platform_rate SET DEFAULT 0.05;

-- Supprimer merchant_rate default (le merchant reçoit 1 - club - platform)
-- On garde la colonne pour compatibilité mais on la met à jour
ALTER TABLE public.spot_events ALTER COLUMN merchant_rate SET DEFAULT 0.85;

-- 3. Nouvelle table runner_visits (détection première visite)
-- Clé composite : un coureur (email) × un commerce (spot_id)
CREATE TABLE IF NOT EXISTS public.runner_visits (
  runner_email TEXT NOT NULL,
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (runner_email, spot_id)
);

ALTER TABLE public.runner_visits ENABLE ROW LEVEL SECURITY;

-- Les capitaines peuvent voir les visites liées à leurs événements
DROP POLICY IF EXISTS "Captains can view runner visits" ON public.runner_visits;
CREATE POLICY "Captains can view runner visits" ON public.runner_visits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.spot_events e
      WHERE e.spot_id = runner_visits.spot_id
      AND e.club_id = auth.uid()
    )
  );

-- Le service_role peut insérer (via webhook)
DROP POLICY IF EXISTS "Service can insert runner visits" ON public.runner_visits;
CREATE POLICY "Service can insert runner visits" ON public.runner_visits
  FOR INSERT WITH CHECK (true);

-- 4. Table spot_suggestions (état vide — acquisition commerces)
CREATE TABLE IF NOT EXISTS public.spot_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  suggested_name TEXT NOT NULL,
  suggested_contact TEXT,
  suggested_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.spot_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Captains can manage their suggestions" ON public.spot_suggestions;
CREATE POLICY "Captains can manage their suggestions" ON public.spot_suggestions
  FOR ALL TO authenticated
  USING (club_id = auth.uid())
  WITH CHECK (club_id = auth.uid());

-- 5. Colonne stripe_connect_id sur clubs (pour futur payout cagnotte)
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;

-- 6. Index sur runner_visits pour performance
CREATE INDEX IF NOT EXISTS idx_runner_visits_email_spot
  ON public.runner_visits (runner_email, spot_id);

-- ============================================================
-- FIN DE LA MIGRATION V2
-- ============================================================
