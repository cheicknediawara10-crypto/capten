-- ============================================================
-- CAPTEN — Migration SQL : Système Anti-Fantôme (No-Show Protection)
-- ============================================================

-- 1. Création de la table `memberships` (Relation Athlète <=> Club)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    no_show_streak INTEGER DEFAULT 0 NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE NOT NULL,
    blacklisted_until TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_club_member UNIQUE (club_id, member_id)
);

-- Index pour doper les performances RLS
CREATE INDEX IF NOT EXISTS idx_memberships_club_member ON memberships(club_id, member_id);

-- 2. Activation de la RLS sur `memberships`
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour `memberships`
CREATE POLICY "Lecture publique des memberships" 
ON memberships FOR SELECT 
USING (true);

CREATE POLICY "Gestion des memberships par le fondateur du club" 
ON memberships FOR ALL 
TO authenticated 
USING (auth.uid() = club_id)
WITH CHECK (auth.uid() = club_id);

-- 3. Mise à jour de la table `run_participants` (les inscriptions/registrations)
-- Suppression de l'ancienne contrainte de statut si elle existe
ALTER TABLE run_participants DROP CONSTRAINT IF EXISTS run_participants_status_check;

-- Ajout du nouveau statut 'no_show' et 'checked_in' à la contrainte
ALTER TABLE run_participants ADD CONSTRAINT run_participants_status_check 
CHECK (status IN ('registered', 'attended', 'checked_in', 'cancelled', 'no_show'));
