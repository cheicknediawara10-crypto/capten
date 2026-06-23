-- ============================================================
-- CAPTEN — Migration SQL : Verrouillage Limite Plan Stripe
-- ============================================================

-- 1. Ajout de stripe_plan à la table `clubs` si ce n'est pas déjà fait
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS stripe_plan TEXT DEFAULT 'STARTER' CHECK (stripe_plan IN ('STARTER', 'PRO', 'LEGENDE')) NOT NULL;

-- 2. Fonction de trigger pour vérifier la limite selon le plan Stripe du club
CREATE OR REPLACE FUNCTION check_membership_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_plan TEXT;
    v_member_count INTEGER;
    v_max_members INTEGER;
BEGIN
    -- Récupérer le plan du club
    SELECT stripe_plan INTO v_plan 
    FROM clubs 
    WHERE id = NEW.club_id;
    
    -- Fallback si le club n'a pas de plan configuré
    IF v_plan IS NULL THEN
        v_plan := 'STARTER';
    END IF;

    -- Fixer les limites selon les règles du produit
    IF v_plan = 'STARTER' THEN
        v_max_members := 30;
    ELSIF v_plan = 'PRO' THEN
        v_max_members := 100;
    ELSE
        v_max_members := 999999; -- Plan LEGENDE ou illimité
    END IF;

    -- Compter le nombre de membres actuels du club
    SELECT COUNT(*) INTO v_member_count 
    FROM memberships 
    WHERE club_id = NEW.club_id;

    -- Si on atteint ou dépasse la limite, rejeter l'insertion
    IF v_member_count >= v_max_members THEN
        RAISE EXCEPTION 'Limite de membres atteinte pour le plan actuel du club.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attacher le trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_check_membership_limit ON memberships;

CREATE TRIGGER trigger_check_membership_limit
BEFORE INSERT ON memberships
FOR EACH ROW
EXECUTE FUNCTION check_membership_limit();
