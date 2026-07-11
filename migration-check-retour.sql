-- ============================================================
-- CAPTEN — Migration SQL : Feature "BIEN RENTRÉ ?"
-- ============================================================

-- 1. Ensure the runners table has birth_date (mapped to date_naissance) of type DATE
-- If it was TEXT before, we keep compatibility or add it as DATE. Let's make sure it is DATE.
ALTER TABLE public.runners DROP COLUMN IF EXISTS birth_date;
ALTER TABLE public.runners ADD COLUMN birth_date DATE;

-- 2. Add columns to runs table
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS short_code VARCHAR(8) UNIQUE;

-- 3. Update the runs status constraint to support new statuses: planned, in_progress, ended
-- Remove the old check constraint
ALTER TABLE public.runs DROP CONSTRAINT IF EXISTS runs_status_check;

-- Add new flexible check constraint including both legacy (scheduled, completed) and new (planned, in_progress, ended) statuses
ALTER TABLE public.runs ADD CONSTRAINT runs_status_check 
  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'planned', 'in_progress', 'ended'));

-- Update default status constraint if necessary (by default it will remain 'scheduled' or 'planned')
ALTER TABLE public.runs ALTER COLUMN status SET DEFAULT 'planned';

-- 4. Create check_retour table
CREATE TABLE IF NOT EXISTS public.check_retour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  coureur_id UUID NOT NULL REFERENCES public.runners(id) ON DELETE CASCADE,
  crew_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  manual BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by UUID REFERENCES auth.users(id),
  ip_hash TEXT,
  UNIQUE (run_id, coureur_id)
);

-- 5. Enable Row Level Security
ALTER TABLE public.check_retour ENABLE ROW LEVEL SECURITY;

-- 6. Define RLS Policies
DROP POLICY IF EXISTS "fondateur lit le check_retour de son crew" ON public.check_retour;
CREATE POLICY "fondateur lit le check_retour de son crew"
  ON public.check_retour FOR SELECT
  TO authenticated
  USING (crew_id = auth.uid());

DROP POLICY IF EXISTS "confirmation manuelle par fondateur" ON public.check_retour;
CREATE POLICY "confirmation manuelle par fondateur"
  ON public.check_retour FOR INSERT
  TO authenticated
  WITH CHECK (
    crew_id = auth.uid()
    AND manual = TRUE
    AND confirmed_by = auth.uid()
  );
