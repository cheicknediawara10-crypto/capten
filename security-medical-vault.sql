-- =======================================================
-- CAPTEN — Medical Encryption & Audit Logging Schema
-- =======================================================

-- 1. Enable pgcrypto extension for symetric PGP encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create audit_logs table (append-only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    club_id UUID,
    ip_address INET,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create fiches_urgence table with bytea encrypted columns
CREATE TABLE IF NOT EXISTS public.fiches_urgence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runner_id UUID NOT NULL REFERENCES public.runners(id) ON DELETE CASCADE UNIQUE,
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    blood_type_enc BYTEA,
    allergies_enc BYTEA,
    health_issues_enc BYTEA,
    emergency_name_enc BYTEA,
    emergency_phone_enc BYTEA,
    emergency_relation_enc BYTEA,
    address_enc BYTEA,
    birth_date_enc BYTEA,
    insurance_enc BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on fiches_urgence
ALTER TABLE public.fiches_urgence ENABLE ROW LEVEL SECURITY;

-- Deny all direct client-side reads/writes
DROP POLICY IF EXISTS "no direct read" ON public.fiches_urgence;
CREATE POLICY "no direct read" ON public.fiches_urgence FOR SELECT USING (false);

DROP POLICY IF EXISTS "no direct write" ON public.fiches_urgence;
CREATE POLICY "no direct write" ON public.fiches_urgence FOR ALL USING (false);

-- 4. SECURITY DEFINER function to encrypt and write medical data
CREATE OR REPLACE FUNCTION public.fiche_urgence_set(
    p_runner_id UUID,
    p_club_id UUID,
    p_blood_type TEXT,
    p_allergies TEXT,
    p_health_issues TEXT,
    p_emergency_name TEXT,
    p_emergency_phone TEXT,
    p_emergency_relation TEXT,
    p_address TEXT,
    p_birth_date TEXT,
    p_insurance TEXT
) RETURNS VOID AS $$
DECLARE
    v_key TEXT := 'capten-medical-passphrase-2026';
BEGIN
    INSERT INTO public.fiches_urgence (
        runner_id,
        club_id,
        blood_type_enc,
        allergies_enc,
        health_issues_enc,
        emergency_name_enc,
        emergency_phone_enc,
        emergency_relation_enc,
        address_enc,
        birth_date_enc,
        insurance_enc
    )
    VALUES (
        p_runner_id,
        p_club_id,
        CASE WHEN p_blood_type IS NOT NULL AND p_blood_type <> '' THEN pgp_sym_encrypt(p_blood_type, v_key) ELSE NULL END,
        CASE WHEN p_allergies IS NOT NULL AND p_allergies <> '' THEN pgp_sym_encrypt(p_allergies, v_key) ELSE NULL END,
        CASE WHEN p_health_issues IS NOT NULL AND p_health_issues <> '' THEN pgp_sym_encrypt(p_health_issues, v_key) ELSE NULL END,
        CASE WHEN p_emergency_name IS NOT NULL AND p_emergency_name <> '' THEN pgp_sym_encrypt(p_emergency_name, v_key) ELSE NULL END,
        CASE WHEN p_emergency_phone IS NOT NULL AND p_emergency_phone <> '' THEN pgp_sym_encrypt(p_emergency_phone, v_key) ELSE NULL END,
        CASE WHEN p_emergency_relation IS NOT NULL AND p_emergency_relation <> '' THEN pgp_sym_encrypt(p_emergency_relation, v_key) ELSE NULL END,
        CASE WHEN p_address IS NOT NULL AND p_address <> '' THEN pgp_sym_encrypt(p_address, v_key) ELSE NULL END,
        CASE WHEN p_birth_date IS NOT NULL AND p_birth_date <> '' THEN pgp_sym_encrypt(p_birth_date, v_key) ELSE NULL END,
        CASE WHEN p_insurance IS NOT NULL AND p_insurance <> '' THEN pgp_sym_encrypt(p_insurance, v_key) ELSE NULL END
    )
    ON CONFLICT (runner_id) DO UPDATE SET
        blood_type_enc = CASE WHEN p_blood_type IS NOT NULL AND p_blood_type <> '' THEN pgp_sym_encrypt(p_blood_type, v_key) ELSE fiches_urgence.blood_type_enc END,
        allergies_enc = CASE WHEN p_allergies IS NOT NULL AND p_allergies <> '' THEN pgp_sym_encrypt(p_allergies, v_key) ELSE fiches_urgence.allergies_enc END,
        health_issues_enc = CASE WHEN p_health_issues IS NOT NULL AND p_health_issues <> '' THEN pgp_sym_encrypt(p_health_issues, v_key) ELSE fiches_urgence.health_issues_enc END,
        emergency_name_enc = CASE WHEN p_emergency_name IS NOT NULL AND p_emergency_name <> '' THEN pgp_sym_encrypt(p_emergency_name, v_key) ELSE fiches_urgence.emergency_name_enc END,
        emergency_phone_enc = CASE WHEN p_emergency_phone IS NOT NULL AND p_emergency_phone <> '' THEN pgp_sym_encrypt(p_emergency_phone, v_key) ELSE fiches_urgence.emergency_phone_enc END,
        emergency_relation_enc = CASE WHEN p_emergency_relation IS NOT NULL AND p_emergency_relation <> '' THEN pgp_sym_encrypt(p_emergency_relation, v_key) ELSE fiches_urgence.emergency_relation_enc END,
        address_enc = CASE WHEN p_address IS NOT NULL AND p_address <> '' THEN pgp_sym_encrypt(p_address, v_key) ELSE fiches_urgence.address_enc END,
        birth_date_enc = CASE WHEN p_birth_date IS NOT NULL AND p_birth_date <> '' THEN pgp_sym_encrypt(p_birth_date, v_key) ELSE fiches_urgence.birth_date_enc END,
        insurance_enc = CASE WHEN p_insurance IS NOT NULL AND p_insurance <> '' THEN pgp_sym_encrypt(p_insurance, v_key) ELSE fiches_urgence.insurance_enc END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SECURITY DEFINER function to decrypt, log access, and return medical data
CREATE OR REPLACE FUNCTION public.fiche_urgence_get(
    p_runner_id UUID
) RETURNS TABLE (
    runner_id UUID,
    club_id UUID,
    blood_type TEXT,
    allergies TEXT,
    health_issues TEXT,
    emergency_name TEXT,
    emergency_phone TEXT,
    emergency_relation TEXT,
    address TEXT,
    birth_date TEXT,
    insurance TEXT
) AS $$
DECLARE
    v_key TEXT := 'capten-medical-passphrase-2026';
    v_club_id UUID;
    v_caller_id UUID := auth.uid();
BEGIN
    -- Check permissions: caller must be the captain of the club associated with the runner
    SELECT f.club_id INTO v_club_id
    FROM public.fiches_urgence f
    WHERE f.runner_id = p_runner_id;

    -- If no record found in fiches_urgence, try checking runners table
    IF v_club_id IS NULL THEN
        SELECT r.club_id INTO v_club_id
        FROM public.runners r
        WHERE r.id = p_runner_id;
    END IF;

    -- If not the authorized captain, raise exception
    IF v_caller_id IS DISTINCT FROM v_club_id AND v_caller_id IS NOT NULL THEN
        RAISE EXCEPTION 'access denied';
    END IF;

    -- Log access in audit_logs before returning
    INSERT INTO public.audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        club_id
    )
    VALUES (
        v_caller_id,
        'captain',
        'read_medical',
        'fiche_urgence',
        p_runner_id,
        v_club_id
    );

    RETURN QUERY
    SELECT
        f.runner_id,
        f.club_id,
        CASE WHEN f.blood_type_enc IS NOT NULL THEN pgp_sym_decrypt(f.blood_type_enc, v_key) ELSE NULL END,
        CASE WHEN f.allergies_enc IS NOT NULL THEN pgp_sym_decrypt(f.allergies_enc, v_key) ELSE NULL END,
        CASE WHEN f.health_issues_enc IS NOT NULL THEN pgp_sym_decrypt(f.health_issues_enc, v_key) ELSE NULL END,
        CASE WHEN f.emergency_name_enc IS NOT NULL THEN pgp_sym_decrypt(f.emergency_name_enc, v_key) ELSE NULL END,
        CASE WHEN f.emergency_phone_enc IS NOT NULL THEN pgp_sym_decrypt(f.emergency_phone_enc, v_key) ELSE NULL END,
        CASE WHEN f.emergency_relation_enc IS NOT NULL THEN pgp_sym_decrypt(f.emergency_relation_enc, v_key) ELSE NULL END,
        CASE WHEN f.address_enc IS NOT NULL THEN pgp_sym_decrypt(f.address_enc, v_key) ELSE NULL END,
        CASE WHEN f.birth_date_enc IS NOT NULL THEN pgp_sym_decrypt(f.birth_date_enc, v_key) ELSE NULL END,
        CASE WHEN f.insurance_enc IS NOT NULL THEN pgp_sym_decrypt(f.insurance_enc, v_key) ELSE NULL END
    FROM public.fiches_urgence f
    WHERE f.runner_id = p_runner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
