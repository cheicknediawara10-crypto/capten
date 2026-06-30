-- =======================================================
-- CAPTEN — RLS Hardening & Audit Script
-- =======================================================

-- 1. Enable RLS on all tables in public schema
ALTER TABLE IF EXISTS public.incidents ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.run_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.broadcast_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.run_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_notification_queue ENABLE ROW LEVEL SECURITY;

-- 2. Scoped policies for clubs (crews)
DROP POLICY IF EXISTS "Gestion complète de son club par le fondateur" ON public.clubs;
CREATE POLICY "Founder full access to own club" ON public.clubs 
    FOR ALL TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- 3. Scoped policies for child tables passing through club parent
-- Runs
DROP POLICY IF EXISTS "Modification des runs par leur Captain" ON public.runs;
CREATE POLICY "Captain modify runs" ON public.runs 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = club_id OR auth.uid() = captain_id) 
    WITH CHECK (auth.uid() = club_id OR auth.uid() = captain_id);

DROP POLICY IF EXISTS "Suppression des runs par leur Captain" ON public.runs;
CREATE POLICY "Captain delete runs" ON public.runs 
    FOR DELETE TO authenticated 
    USING (auth.uid() = club_id OR auth.uid() = captain_id);

-- Memberships
DROP POLICY IF EXISTS "Gestion des memberships par le fondateur du club" ON public.memberships;
CREATE POLICY "Founder manage memberships" ON public.memberships 
    FOR ALL TO authenticated 
    USING (auth.uid() = club_id) 
    WITH CHECK (auth.uid() = club_id);

-- Run Series
DROP POLICY IF EXISTS "Modification des series par leur fondateur" ON public.run_series;
CREATE POLICY "Founder modify run_series" ON public.run_series 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = club_id) 
    WITH CHECK (auth.uid() = club_id);

DROP POLICY IF EXISTS "Suppression des series par leur fondateur" ON public.run_series;
CREATE POLICY "Founder delete run_series" ON public.run_series 
    FOR DELETE TO authenticated 
    USING (auth.uid() = club_id);

-- Incidents
DROP POLICY IF EXISTS "Accès restreint en modification aux Captains authentifiés" ON public.incidents;
CREATE POLICY "Captain update incidents" ON public.incidents 
    FOR UPDATE TO authenticated 
    USING (club_id = auth.uid()) 
    WITH CHECK (club_id = auth.uid());

DROP POLICY IF EXISTS "Accès restreint en suppression aux Captains authentifiés" ON public.incidents;
CREATE POLICY "Captain delete incidents" ON public.incidents 
    FOR DELETE TO authenticated 
    USING (club_id = auth.uid());

-- 4. Audit query to ensure all public tables have RLS enabled
-- Run this in your Supabase SQL Editor:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;
