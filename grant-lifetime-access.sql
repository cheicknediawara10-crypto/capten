-- =======================================================
-- CAPTEN — Grant Lifetime Free Access (VIP Account)
-- Account: cheicknediawara10@gmail.com
-- =======================================================

-- 1. Update public.clubs for the given email user ID
UPDATE public.clubs
SET 
    stripe_subscription_status = 'active',
    stripe_plan = 'PRO',
    trial_ends_at = '2099-12-31 23:59:59+00'
WHERE id IN (
    SELECT id FROM auth.users WHERE LOWER(email) = 'cheicknediawara10@gmail.com'
);

-- 2. Update public.profiles if exists
UPDATE public.profiles
SET 
    stripe_subscription_status = 'active',
    stripe_plan = 'PRO',
    subscription_ends_at = '2099-12-31 23:59:59+00'
WHERE id IN (
    SELECT id FROM auth.users WHERE LOWER(email) = 'cheicknediawara10@gmail.com'
);
