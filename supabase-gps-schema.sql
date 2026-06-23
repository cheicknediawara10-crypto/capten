-- ============================================================
-- CAPTEN — Migration SQL : Système de Géofencing GPS
-- ============================================================

-- 1. Ajout des coordonnées GPS de départ pour les Runs
ALTER TABLE runs 
ADD COLUMN IF NOT EXISTS start_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS start_longitude DOUBLE PRECISION;

-- 2. Ajout des données d'audit de check-in pour les participants
ALTER TABLE run_participants
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS verified_longitude DOUBLE PRECISION;

-- 3. Ajout d'index pour optimiser les requêtes de check-in et les statistiques
CREATE INDEX IF NOT EXISTS idx_run_participants_status ON run_participants(status);
CREATE INDEX IF NOT EXISTS idx_run_participants_run_id_member_id ON run_participants(run_id, member_id);

-- Mise à jour optionnelle : définir des coordonnées par défaut pour les anciens runs (ex: Paris centre)
-- UPDATE runs SET start_latitude = 48.8566, start_longitude = 2.3522 WHERE start_latitude IS NULL;
