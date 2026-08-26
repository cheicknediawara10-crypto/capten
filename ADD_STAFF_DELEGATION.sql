-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — DÉLÉGATION STAFF & CO-CAPITAINE (CHECK-IN TERRAIN + ICE)
--  À exécuter dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.club_staff_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Staff Terrain',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_tokens_lookup ON public.club_staff_tokens(token, is_active);
CREATE INDEX IF NOT EXISTS idx_staff_tokens_club ON public.club_staff_tokens(club_id);
CREATE INDEX IF NOT EXISTS idx_staff_tokens_event ON public.club_staff_tokens(event_id);

ALTER TABLE public.club_staff_tokens ENABLE ROW LEVEL SECURITY;

-- Le fondateur gère les tokens de son crew
DROP POLICY IF EXISTS "Captains manage their staff tokens" ON public.club_staff_tokens;
CREATE POLICY "Captains manage their staff tokens" ON public.club_staff_tokens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs c 
      WHERE c.id = club_staff_tokens.club_id 
        AND (c.id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- Les co-capitaines peuvent valider leur token via anon
DROP POLICY IF EXISTS "Public can read active staff tokens" ON public.club_staff_tokens;
CREATE POLICY "Public can read active staff tokens" ON public.club_staff_tokens
  FOR SELECT TO anon
  USING (is_active = true);

GRANT ALL ON public.club_staff_tokens TO anon;
GRANT ALL ON public.club_staff_tokens TO authenticated;
GRANT ALL ON public.club_staff_tokens TO service_role;
