-- ============================================================
-- CAPTEN — Schéma SQL : Identification Anonyme V1
-- ============================================================

-- 1. Table des Runners (humains du club)
CREATE TABLE IF NOT EXISTS runners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    
    -- Signature de la décharge légale
    signed_waiver BOOLEAN DEFAULT FALSE NOT NULL,
    waiver_date TIMESTAMP WITH TIME ZONE,
    waiver_ip TEXT,
    waiver_token TEXT,
    
    -- Statistiques d'assiduité
    streak_count INTEGER DEFAULT 0 NOT NULL
);

-- Index sur le téléphone pour une recherche instantanée
CREATE INDEX IF NOT EXISTS idx_runners_phone ON runners(phone);

-- 2. Table des Registrations (Lien entre runners et runs)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE NOT NULL,
    runner_id UUID REFERENCES runners(id) ON DELETE CASCADE NOT NULL,
    
    -- Statut du check-in
    status TEXT DEFAULT 'checked_in' CHECK (status IN ('registered', 'checked_in', 'cancelled')) NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Données de pointage GPS
    verified_latitude DOUBLE PRECISION,
    verified_longitude DOUBLE PRECISION,
    
    -- Un runner s'inscrit au maximum une fois par run
    CONSTRAINT unique_run_runner UNIQUE (run_id, runner_id)
);

-- Index pour accélérer le tri et le calcul des streaks/présences
CREATE INDEX IF NOT EXISTS idx_registrations_run_runner ON registrations(run_id, runner_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- 3. Activation de la RLS pour accès client anonyme
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (Accès public anonyme requis pour WhatsApp)
CREATE POLICY "Accès public en lecture des runners" ON runners FOR SELECT USING (true);
CREATE POLICY "Accès public en écriture des runners" ON runners FOR INSERT WITH CHECK (true);
CREATE POLICY "Accès public en mise à jour des runners" ON runners FOR UPDATE USING (true);

CREATE POLICY "Accès public en lecture des registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Accès public en écriture des registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Accès public en mise à jour des registrations" ON registrations FOR UPDATE USING (true);
