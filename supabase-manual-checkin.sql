-- ============================================================
-- CAPTEN — Migration SQL : Support du Master Pass & Liste d'attente
-- ============================================================

-- 1. Suppression de l'ancienne contrainte de statut pour registrations
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;

-- 2. Recréation de la contrainte avec les statuts requis (dont 'waitlisted')
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'checked_in', 'cancelled', 'waitlisted'));

-- 3. Ajout de la colonne check_in_method pour distinguer GPS / Manuel
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS check_in_method TEXT DEFAULT 'gps';
