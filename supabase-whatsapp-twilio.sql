-- ============================================================
-- CAPTEN — Migration SQL : Moteur WhatsApp Twilio & Comptabilité Meta
-- ============================================================

-- 1. Création de la table `clubs` (Settings, WhatsApp Display Name et Solde Crédit)
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    whatsapp_display_name TEXT NOT NULL,
    twilio_messaging_service_sid TEXT,
    credit_balance_euros NUMERIC(10, 2) DEFAULT 15.00 NOT NULL
);

-- Index pour accélérer les jointures avec clubs
CREATE INDEX IF NOT EXISTS idx_clubs_id ON clubs(id);

-- Activer la RLS sur la table `clubs`
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `clubs`
CREATE POLICY "Lecture publique des clubs" 
ON clubs FOR SELECT 
USING (true);

CREATE POLICY "Gestion complète de son club par le fondateur" 
ON clubs FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Ajout de whatsapp_session_opened_at à la table `run_participants`
ALTER TABLE run_participants 
ADD COLUMN IF NOT EXISTS whatsapp_session_opened_at TIMESTAMP WITH TIME ZONE;
