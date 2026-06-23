-- ============================================================
-- CAPTEN — Migration SQL : Runs Récurrents "Set & Forget"
-- ============================================================

-- 1. Création de la table `run_series`
CREATE TABLE IF NOT EXISTS run_series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    start_time TIME NOT NULL, -- Format 'HH:MM:SS'
    max_radius_meters INTEGER DEFAULT 50 NOT NULL,
    location_gps POINT NOT NULL -- Stockage des coordonnées géographiques (X=longitude, Y=latitude ou inversement)
);

-- 2. Ajout des colonnes de récurrence et SMS à la table `runs`
ALTER TABLE runs 
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES run_series(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT false NOT NULL;

-- 3. Migration des données existantes pour rétrocompatibilité
UPDATE runs SET scheduled_at = date_start WHERE scheduled_at IS NULL;
UPDATE runs SET club_id = captain_id WHERE club_id IS NULL;

-- 4. Indexation pour maximiser la vitesse des requêtes Cron
CREATE INDEX IF NOT EXISTS idx_runs_scheduled_at_sms_sent ON runs(scheduled_at, sms_sent);
CREATE INDEX IF NOT EXISTS idx_runs_series_id ON runs(series_id);
CREATE INDEX IF NOT EXISTS idx_runs_club_id ON runs(club_id);
CREATE INDEX IF NOT EXISTS idx_run_series_club_id ON run_series(club_id);

-- 5. Activation des politiques de sécurité (Row Level Security - RLS)
ALTER TABLE run_series ENABLE ROW LEVEL SECURITY;

-- Politiques pour `run_series`
CREATE POLICY "Lecture publique des series" 
ON run_series FOR SELECT 
USING (true);

CREATE POLICY "Création de series par les fondateurs" 
ON run_series FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = club_id);

CREATE POLICY "Modification des series par leur fondateur" 
ON run_series FOR UPDATE 
TO authenticated 
USING (auth.uid() = club_id)
WITH CHECK (auth.uid() = club_id);

CREATE POLICY "Suppression des series par leur fondateur" 
ON run_series FOR DELETE 
TO authenticated 
USING (auth.uid() = club_id);

-- Mise à jour des politiques de `runs` pour supporter `club_id` en plus de `captain_id`
DROP POLICY IF EXISTS "Création de runs par les Captains authentifiés" ON runs;
CREATE POLICY "Création de runs par les Captains authentifiés" 
ON runs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);

DROP POLICY IF EXISTS "Modification des runs par leur Captain" ON runs;
CREATE POLICY "Modification des runs par leur Captain" 
ON runs FOR UPDATE 
TO authenticated 
USING (auth.uid() = captain_id OR auth.uid() = club_id)
WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);

DROP POLICY IF EXISTS "Suppression des runs par leur Captain" ON runs;
CREATE POLICY "Suppression des runs par leur Captain" 
ON runs FOR DELETE 
TO authenticated 
USING (auth.uid() = captain_id OR auth.uid() = club_id);
