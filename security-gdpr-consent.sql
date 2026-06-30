-- =======================================================
-- CAPTEN — GDPR Consent Tracking Schema
-- =======================================================

CREATE TABLE IF NOT EXISTS public.consentements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coureur_id UUID NOT NULL REFERENCES public.runners(id) ON DELETE CASCADE,
    finalite TEXT NOT NULL, -- e.g., 'waiver_terms', 'photo_consent', 'marketing_sms'
    accorde BOOLEAN NOT NULL DEFAULT FALSE,
    version_politique TEXT NOT NULL DEFAULT '1.5',
    ip_address TEXT,
    user_agent TEXT,
    recueilli_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    retire_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_runner_finalite UNIQUE (coureur_id, finalite)
);

-- Enable RLS
ALTER TABLE public.consentements ENABLE ROW LEVEL SECURITY;

-- Captains can select consent tracking data for their club members
DROP POLICY IF EXISTS "Captains view consentements" ON public.consentements;
CREATE POLICY "Captains view consentements" ON public.consentements
    FOR SELECT TO authenticated
    USING (coureur_id IN (SELECT id FROM public.runners WHERE club_id = auth.uid()));

-- Allow service_role to bypass and manage all consent data (direct client insert denied)
DROP POLICY IF EXISTS "Deny public access" ON public.consentements;
CREATE POLICY "Deny public access" ON public.consentements FOR ALL USING (false);
