-- ============================================================
-- CAPTEN — Schéma SQL : Bouclier de Sécurité & Modération
-- Base de données : Supabase (PostgreSQL)
-- ============================================================

-- 1. Table des Incidents (Signalements)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
    runner_id UUID REFERENCES runners(id) ON DELETE SET NULL,
    
    type TEXT DEFAULT 'Comportement Toxique' NOT NULL,
    priority TEXT DEFAULT 'MOYENNE' CHECK (priority IN ('BASSE', 'MOYENNE', 'HAUTE')) NOT NULL,
    status TEXT DEFAULT 'NOUVEAU' CHECK (status IN ('NOUVEAU', 'RÉSOLU', 'IGNORÉ')) NOT NULL,
    
    anonymous BOOLEAN DEFAULT TRUE NOT NULL,
    reporter_name TEXT,
    reporter_phone TEXT,
    involved TEXT, -- Nom de la personne signalée (ex: "Noah Petit" ou "Julien")
    details TEXT NOT NULL
);

-- Index pour accélérer les tris et recherches
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_run_id ON incidents(run_id);

-- 2. Colonnes supplémentaires pour le Bannissement dans la table runners
-- Ajout sécurisé (seulement si n'existe pas déjà)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runners' AND column_name='is_blacklisted') THEN
        ALTER TABLE runners ADD COLUMN is_blacklisted BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runners' AND column_name='blacklisted_until') THEN
        ALTER TABLE runners ADD COLUMN blacklisted_until TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Activation de la RLS pour la table incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (Accès public pour INSERT, authentifié pour SELECT/UPDATE/DELETE)
CREATE POLICY "Accès public en insertion pour les incidents" 
ON incidents FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Accès restreint en lecture aux Captains authentifiés" 
ON incidents FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Accès restreint en modification aux Captains authentifiés" 
ON incidents FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Accès restreint en suppression aux Captains authentifiés" 
ON incidents FOR DELETE 
TO authenticated 
USING (true);
