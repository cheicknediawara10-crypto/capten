-- ========================================================
-- CAPTEN — MIGRATION DE TARIFICATION (GRATUIT / CAPTEN)
-- ========================================================

-- 1. Supprimer l'ancienne contrainte CHECK si elle existe
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_stripe_plan_check;

-- 2. Changer la valeur par défaut pour stripe_plan vers 'GRATUIT'
ALTER TABLE clubs ALTER COLUMN stripe_plan SET DEFAULT 'GRATUIT';

-- 3. Ajouter la nouvelle contrainte CHECK pour restreindre aux plans 'GRATUIT' et 'CAPTEN'
ALTER TABLE clubs ADD CONSTRAINT clubs_stripe_plan_check CHECK (stripe_plan IN ('GRATUIT', 'CAPTEN'));

-- 4. Migrer les statuts d'abonnement existants
-- Les abonnés actifs ou en essai (trialing) passent au plan CAPTEN
UPDATE clubs 
SET stripe_plan = 'CAPTEN' 
WHERE stripe_subscription_status IN ('active', 'trialing');

-- Les abonnés inactifs ou résiliés passent au plan GRATUIT
UPDATE clubs 
SET stripe_plan = 'GRATUIT' 
WHERE stripe_subscription_status NOT IN ('active', 'trialing') 
   OR stripe_subscription_status IS NULL;

-- 5. Mettre à jour la table des profils utilisateur par cohérence
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_stripe_subscription_status_check;
-- (Note: profiles.stripe_subscription_status stocke généralement le statut brut de Stripe comme 'active', 'trialing', 'canceled', etc.)
