-- ============================================
-- CAPTEN — Agnostic Ravito & Profiles Schema Update
-- ============================================

-- 1. Table Profiles (SaaS Subscription for Captains)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    stripe_customer_id TEXT,
    stripe_subscription_status TEXT DEFAULT 'trialing' NOT NULL,
    subscription_ends_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Captains update their own profile" ON public.profiles;
CREATE POLICY "Captains update their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Alter Clubs Table (Add cagnotte_url for Captain's public Lydia/Revolut/PayPal link)
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS cagnotte_url TEXT;

-- 2.5. Alter Runners and Incidents Tables for ICE, health, and multi-tenant security
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS emergency_name TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS emergency_relation TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS health_issues TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS insurance TEXT;
ALTER TABLE public.runners ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Table Attendance (Declarative checkin status and Ravito contribution follow-up)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES public.runs(id) ON DELETE CASCADE NOT NULL,
    runner_id UUID REFERENCES public.runners(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cagnotte_status TEXT DEFAULT 'none' CHECK (cagnotte_status IN ('none', 'declared', 'verified')) NOT NULL,
    CONSTRAINT unique_attendance_run_runner UNIQUE (run_id, runner_id),
    CONSTRAINT unique_attendance_run_member UNIQUE (run_id, member_id)
);

-- Enable RLS on Attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance Policies
DROP POLICY IF EXISTS "Public read access to attendance" ON public.attendance;
CREATE POLICY "Public read access to attendance" ON public.attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write and update access to attendance" ON public.attendance;
CREATE POLICY "Public write and update access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
