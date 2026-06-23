-- ============================================================
-- CAPTEN — Migration SQL : Améliorations SMS Reddit-Approved
-- ============================================================

-- 1. Ajout de reminder_offset_minutes à la table `run_series`
ALTER TABLE run_series 
ADD COLUMN IF NOT EXISTS reminder_offset_minutes INTEGER DEFAULT 30;

-- 2. Ajout de reminder_offset_minutes à la table `runs`
ALTER TABLE runs 
ADD COLUMN IF NOT EXISTS reminder_offset_minutes INTEGER DEFAULT 30;

-- 3. Ajout du token d'annulation unique court à la table `run_participants`
ALTER TABLE run_participants 
ADD COLUMN IF NOT EXISTS cancel_token TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 12);

-- 4. Index pour accélérer la recherche de token lors des annulations
CREATE INDEX IF NOT EXISTS idx_run_participants_cancel_token ON run_participants(cancel_token);
