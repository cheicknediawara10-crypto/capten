-- ============================================================
-- CAPTEN — Migration SQL : Onboarding Filter & A/B Testing
-- ============================================================

-- 1. Ajouter les colonnes SaaS et A/B test à la table clubs
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'trial', 'paid'));
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS first_run_created_at TIMESTAMPTZ;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS stripe_onboarding_status TEXT DEFAULT 'none';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS signup_variant TEXT CHECK (signup_variant IN ('A', 'B'));

-- 2. Créer la table analytique de tracking des pages vues du test A/B
CREATE TABLE IF NOT EXISTS public.ab_test_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  page TEXT NOT NULL CHECK (page IN ('pricing', 'signup'))
);

-- 3. Activer la sécurité RLS sur la table ab_test_views
ALTER TABLE public.ab_test_views ENABLE ROW LEVEL SECURITY;

-- 4. Définir les politiques RLS pour ab_test_views
DROP POLICY IF EXISTS "Insert views publicly" ON public.ab_test_views;
CREATE POLICY "Insert views publicly" ON public.ab_test_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Select views authenticated" ON public.ab_test_views;
CREATE POLICY "Select views authenticated" ON public.ab_test_views FOR SELECT TO authenticated USING (true);

-- 5. Mettre à jour le trigger de création de clubs pour supporter l'onboarding et test A/B
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_plan TEXT;
    v_variant TEXT;
    v_stripe_plan TEXT;
    v_sub_status TEXT;
BEGIN
    v_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'free');
    v_variant := NEW.raw_user_meta_data->>'signup_variant';
    
    IF v_plan = 'trial' THEN
        v_stripe_plan := 'CAPTEN';
        v_sub_status := 'trialing';
    ELSE
        v_stripe_plan := 'GRATUIT';
        v_sub_status := 'inactive';
    END IF;

    -- Création du profil membre
    INSERT INTO public.members (id, firstname, lastname, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstname', NEW.raw_user_meta_data->>'name', 'Coureur'),
        NEW.raw_user_meta_data->>'lastname',
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Création du club associé si c'est un capitaine qui s'inscrit
    INSERT INTO public.clubs (id, whatsapp_display_name, plan, signup_variant, stripe_plan, stripe_subscription_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'club_name', 'MON RUN CLUB'),
        v_plan,
        v_variant,
        v_stripe_plan,
        v_sub_status
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
