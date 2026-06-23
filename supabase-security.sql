-- ============================================================
-- CAPTEN — Script de Sécurité : RLS & Politiques de Sécurité
-- Base de données : Supabase (PostgreSQL)
-- ============================================================

-- 1. ACTIVER LA SÉCURITÉ DE NIVEAU LIGNE (RLS)
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_queue ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR LA TABLE `runs`
-- Tout le monde (y compris les anonymes) peut voir les runs.
CREATE POLICY "Lecture publique des runs" 
ON runs FOR SELECT 
USING (true);

-- Seuls les Captains authentifiés peuvent créer des runs.
CREATE POLICY "Création de runs par les Captains authentifiés" 
ON runs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = captain_id);

-- Seuls les Captains créateurs peuvent modifier leurs runs.
CREATE POLICY "Modification des runs par leur Captain" 
ON runs FOR UPDATE 
TO authenticated 
USING (auth.uid() = captain_id)
WITH CHECK (auth.uid() = captain_id);

-- Seuls les Captains créateurs peuvent supprimer leurs runs.
CREATE POLICY "Suppression des runs par leur Captain" 
ON runs FOR DELETE 
TO authenticated 
USING (auth.uid() = captain_id);


-- 3. POLITIQUES POUR LA TABLE `run_participants`
-- Les athlètes authentifiés peuvent voir leurs propres inscriptions.
CREATE POLICY "Les athlètes voient leurs propres inscriptions" 
ON run_participants FOR SELECT 
TO authenticated 
USING (auth.uid() = member_id);

-- Les athlètes peuvent s'inscrire eux-mêmes à un run.
CREATE POLICY "Les athlètes peuvent s'inscrire" 
ON run_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = member_id);

-- Seul le membre lui-même peut valider son check-in GPS.
CREATE POLICY "L'athlète valide son propre check-in" 
ON run_participants FOR UPDATE 
TO authenticated 
USING (auth.uid() = member_id)
WITH CHECK (auth.uid() = member_id);


-- 4. POLITIQUES POUR LA TABLE `broadcast_queue`
-- Verrouillage total : aucun accès direct depuis le client REST Supabase.
-- Seul le serveur Next.js via le rôle de service (service_role bypassant RLS) peut gérer les SMS/WhatsApp.
CREATE POLICY "Aucun accès client à la queue de diffusion"
ON broadcast_queue
FOR ALL
TO service_role
USING (true);
