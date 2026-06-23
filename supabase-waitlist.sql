-- ============================================================
-- CAPTEN — Migration SQL : Active Waitlist Automation
-- ============================================================

-- 1. Mise à jour de la contrainte de statut pour run_participants
ALTER TABLE run_participants DROP CONSTRAINT IF EXISTS run_participants_status_check;
ALTER TABLE run_participants ADD CONSTRAINT run_participants_status_check 
CHECK (status IN ('registered', 'attended', 'checked_in', 'cancelled', 'no_show', 'waitlisted'));

-- 2. Ajout des colonnes pour la file d'attente
ALTER TABLE run_participants 
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER,
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE;

-- 3. Indexation pour maximiser la vitesse des promotions chronologiques
CREATE INDEX IF NOT EXISTS idx_run_participants_waitlist_queue 
ON run_participants (run_id, status, waitlist_position) 
WHERE status = 'waitlisted';

CREATE INDEX IF NOT EXISTS idx_run_participants_run_status ON run_participants (run_id, status);
