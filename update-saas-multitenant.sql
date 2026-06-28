-- ============================================
-- CAPTEN — SaaS Multi-Tenant Configuration Schema
-- Base de données : Supabase (PostgreSQL)
-- ============================================

-- 1. Alter clubs table to support rich B2B JSONB metadata
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS coaches JSONB DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS message_templates JSONB DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS cagnotte_data JSONB DEFAULT '{"balance": 0, "transactions": [], "contributors": []}'::jsonb NOT NULL;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS spot_name TEXT;

-- 1.5. Alter runners table to scope runners to a club
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Membre' NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS reliability INTEGER DEFAULT 90 NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS pace TEXT DEFAULT '5:00/K' NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS total_km NUMERIC(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS last_run TEXT DEFAULT 'Jamais' NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS runs_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS join_date TEXT;


-- 2. Alter runners table to support scoping by club/captain if needed
-- Note: A runner profile is globally identified by phone, but memberships table links them to clubs.
-- To allow captains to view and manage their runner listings efficiently, we ensure indexes are set up.
CREATE INDEX IF NOT EXISTS idx_memberships_club_id ON public.memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON public.memberships(member_id);

-- 3. Verify RLS Policies on clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique des clubs" ON public.clubs;
CREATE POLICY "Lecture publique des clubs" ON public.clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion complète de son club par le fondateur" ON public.clubs;
CREATE POLICY "Gestion complète de son club par le fondateur" ON public.clubs FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Verify RLS Policies on runs (restricted to the owner captain)
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique des runs" ON public.runs;
CREATE POLICY "Lecture publique des runs" ON public.runs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Création de runs par les Captains authentifiés" ON public.runs;
CREATE POLICY "Création de runs par les Captains authentifiés" ON public.runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);

DROP POLICY IF EXISTS "Modification des runs par leur Captain" ON public.runs;
CREATE POLICY "Modification des runs par leur Captain" ON public.runs FOR UPDATE TO authenticated USING (auth.uid() = captain_id OR auth.uid() = club_id) WITH CHECK (auth.uid() = captain_id OR auth.uid() = club_id);

DROP POLICY IF EXISTS "Suppression des runs par leur Captain" ON public.runs;
CREATE POLICY "Suppression des runs par leur Captain" ON public.runs FOR DELETE TO authenticated USING (auth.uid() = captain_id OR auth.uid() = club_id);

-- 5. Verify RLS Policies on runners (restricted to the owner captain)
ALTER TABLE public.runners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Accès public en écriture des runners" ON public.runners;
CREATE POLICY "Accès public en écriture des runners" ON public.runners FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Accès restreint aux Captains pour la lecture des runners" ON public.runners;
CREATE POLICY "Accès restreint aux Captains pour la lecture des runners" ON public.runners FOR SELECT TO authenticated USING (auth.uid() = club_id OR club_id IS NULL);

DROP POLICY IF EXISTS "Accès restreint aux Captains pour la mise à jour des runners" ON public.runners;
CREATE POLICY "Accès restreint aux Captains pour la mise à jour des runners" ON public.runners FOR UPDATE TO authenticated USING (auth.uid() = club_id) WITH CHECK (auth.uid() = club_id);

DROP POLICY IF EXISTS "Accès restreint aux Captains pour la suppression des runners" ON public.runners;
CREATE POLICY "Accès restreint aux Captains pour la suppression des runners" ON public.runners FOR DELETE TO authenticated USING (auth.uid() = club_id);

