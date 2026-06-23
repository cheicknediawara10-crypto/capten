-- ============================================================
-- CAPTEN — Durcissement RLS et Sécurisation RGPD (Production)
-- Base de données : Supabase (PostgreSQL)
-- ============================================================

-- 1. Révoquer les politiques SELECT et UPDATE publiques trop permissives de la table runners
DROP POLICY IF EXISTS "Accès public en lecture des runners" ON runners;
DROP POLICY IF EXISTS "Accès public en mise à jour des runners" ON runners;

-- 2. Créer de nouvelles politiques restrictives pour la table runners
-- Seule l'insertion publique est conservée pour permettre aux nouveaux coureurs de s'enregistrer
CREATE POLICY "Accès public en écriture des runners" 
ON runners FOR INSERT 
WITH CHECK (true);

-- La lecture et mise à jour de la table runners est uniquement permise pour les Captains connectés (authenticated)
-- Le serveur Next.js bypassera ces restrictions via le rôle service_role (clé getSupabaseAdmin)
CREATE POLICY "Accès restreint aux Captains pour la lecture des runners" 
ON runners FOR SELECT 
TO authenticated 
USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);

CREATE POLICY "Accès restreint aux Captains pour la mise à jour des runners" 
ON runners FOR UPDATE 
TO authenticated 
USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
) WITH CHECK (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);

CREATE POLICY "Accès restreint aux Captains pour la suppression des runners" 
ON runners FOR DELETE 
TO authenticated 
USING (
    id IN (
        SELECT runner_id FROM public.registrations r
        JOIN public.runs runs ON r.run_id = runs.id
        WHERE runs.club_id = auth.uid()
    )
);


-- 3. Révoquer et durcir l'accès à la table incidents (Signalements)
-- L'insertion publique reste active pour permettre aux runners d'émettre un ticket anonyme ou nommé
DROP POLICY IF EXISTS "Accès public en insertion pour les incidents" ON incidents;
CREATE POLICY "Accès public en insertion pour les incidents" 
ON incidents FOR INSERT 
WITH CHECK (true);

-- Lecture, modification et suppression des tickets limités aux Captains authentifiés
DROP POLICY IF EXISTS "Accès restreint en lecture aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en lecture aux Captains authentifiés" 
ON incidents FOR SELECT 
TO authenticated 
USING (club_id = auth.uid());

DROP POLICY IF EXISTS "Accès restreint en modification aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en modification aux Captains authentifiés" 
ON incidents FOR UPDATE 
TO authenticated 
USING (club_id = auth.uid()) WITH CHECK (club_id = auth.uid());

DROP POLICY IF EXISTS "Accès restreint en suppression aux Captains authentifiés" ON incidents;
CREATE POLICY "Accès restreint en suppression aux Captains authentifiés" 
ON incidents FOR DELETE 
TO authenticated 
USING (club_id = auth.uid());
