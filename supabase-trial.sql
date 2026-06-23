-- ============================================================
-- CAPTEN — Migration SQL : Gestion du Trial & Statut d'Abonnement
-- ============================================================

-- 1. Ajout des colonnes de Trial et d'Abonnement à la table `clubs`
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days') NOT NULL,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT DEFAULT 'trialing' NOT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_messages_sent_this_month INTEGER DEFAULT 0 NOT NULL;

-- 2. Index de performance
CREATE INDEX IF NOT EXISTS idx_clubs_trial_status ON clubs(trial_ends_at, stripe_subscription_status);
