-- =======================================================
-- CAPTEN — Critical Security Fixes (High Severity)
-- =======================================================

-- 1. Lock down registrations RLS policies (delete public open access)
DROP POLICY IF EXISTS "Accès public en lecture des registrations" ON public.registrations;
DROP POLICY IF EXISTS "Accès public en écriture des registrations" ON public.registrations;
DROP POLICY IF EXISTS "Accès public en mise à jour des registrations" ON public.registrations;

-- Create secure scoped policies for captains
CREATE POLICY "Captains read registrations" ON public.registrations 
    FOR SELECT TO authenticated 
    USING (run_id IN (SELECT id FROM public.runs WHERE club_id = auth.uid() OR captain_id = auth.uid()));

CREATE POLICY "Captains insert registrations" ON public.registrations 
    FOR INSERT TO authenticated 
    WITH CHECK (run_id IN (SELECT id FROM public.runs WHERE club_id = auth.uid() OR captain_id = auth.uid()));

CREATE POLICY "Captains update registrations" ON public.registrations 
    FOR UPDATE TO authenticated 
    USING (run_id IN (SELECT id FROM public.runs WHERE club_id = auth.uid() OR captain_id = auth.uid()))
    WITH CHECK (run_id IN (SELECT id FROM public.runs WHERE club_id = auth.uid() OR captain_id = auth.uid()));

CREATE POLICY "Captains delete registrations" ON public.registrations 
    FOR DELETE TO authenticated 
    USING (run_id IN (SELECT id FROM public.runs WHERE club_id = auth.uid() OR captain_id = auth.uid()));

-- 2. Lock down whatsapp_notification_queue
ALTER TABLE public.whatsapp_notification_queue ENABLE ROW LEVEL SECURITY;

-- 3. Verify all other tables have RLS enabled
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_series ENABLE ROW LEVEL SECURITY;
