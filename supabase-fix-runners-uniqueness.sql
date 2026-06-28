-- =======================================================
-- CAPTEN — Fix Runners Uniqueness for Multi-Tenant Scaling
-- =======================================================

-- 1. Remove the global unique constraint on phone
ALTER TABLE public.runners DROP CONSTRAINT IF EXISTS runners_phone_key;
DROP INDEX IF EXISTS public.runners_phone_key;

-- 2. Add composite unique constraint (phone + club_id)
-- This allows a runner with the same phone to exist in multiple different clubs
-- without data conflicts or tenant leaks.
ALTER TABLE public.runners ADD CONSTRAINT unique_phone_club UNIQUE (phone, club_id);
