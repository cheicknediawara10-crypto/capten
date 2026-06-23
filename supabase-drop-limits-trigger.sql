-- ============================================================
-- CAPTEN — Suppression des limites de plan (Modèle Premium Unique)
-- ============================================================

-- Suppression du trigger de blocage de memberships
DROP TRIGGER IF EXISTS trigger_check_membership_limit ON memberships;
DROP FUNCTION IF EXISTS check_membership_limit();

-- Mise à jour de la table `clubs` pour simplifier les plans
-- On peut garder stripe_plan mais le défaut devient 'PRO' et on supprime la contrainte CHECK d'origine
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_stripe_plan_check;
ALTER TABLE clubs ALTER COLUMN stripe_plan SET DEFAULT 'PRO';

-- Mettre tous les clubs existants sur le plan PRO
UPDATE clubs SET stripe_plan = 'PRO' WHERE stripe_plan != 'PRO';

-- Ajout des colonnes de signature de décharge à la table memberships
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS user_signed_waiver BOOLEAN DEFAULT FALSE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS waiver_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS waiver_ip TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS waiver_token TEXT;
