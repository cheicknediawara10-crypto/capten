-- ============================================
-- CAPTEN — Schéma SQL de la Table `runs`
-- Base de données : Supabase (PostgreSQL)
-- ============================================

-- Table principale des Runs
CREATE TABLE runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    captain_id UUID DEFAULT gen_random_uuid() NOT NULL,
    
    -- Infos du Run
    title TEXT NOT NULL,
    description TEXT,
    date_start TIMESTAMP WITH TIME ZONE NOT NULL,
    location_start TEXT NOT NULL,
    gpx_route_url TEXT,
    
    -- Logique de l'Offre (Gratuit vs Payant)
    is_paid BOOLEAN DEFAULT FALSE NOT NULL,
    price_cents INTEGER DEFAULT 0,
    stripe_product_id TEXT,
    
    -- Gestion des places
    max_slots INTEGER DEFAULT NULL,
    slots_taken INTEGER DEFAULT 0,
    
    -- Métadonnées de style
    vibe TEXT DEFAULT 'Social & Chill',
    coach TEXT DEFAULT 'Alex Rivière',
    
    -- Statut du run
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')) NOT NULL
);

-- Index pour doper les performances sur Vercel
CREATE INDEX idx_runs_date_start ON runs(date_start);
CREATE INDEX idx_runs_captain_id ON runs(captain_id);

-- ============================================
-- SEED DATA (Données de démonstration)
-- ============================================

INSERT INTO runs (title, description, date_start, location_start, is_paid, price_cents, max_slots, slots_taken, vibe, coach, status) VALUES
  ('MORNING VIBES', 'Run social le long du canal avec arrêt café au Social Spot. Idéal pour les débutants.', NOW() + INTERVAL '2 hours', 'Social Spot → Canal St Martin', FALSE, 0, NULL, 47, 'Social & Chill', 'Alex Rivière', 'scheduled'),
  ('TEMPO THURSDAY', 'Séance de fractionné au Trocadéro. 4x1000m avec récupération active.', NOW() + INTERVAL '3 days', 'Trocadéro → Bois de Boulogne', FALSE, 0, NULL, 32, 'Performance', 'Chloé Simon', 'scheduled'),
  ('SATURDAY CREW', 'Le run signature du samedi matin. Brunch offert au Social Spot après la session.', NOW() + INTERVAL '5 days', 'Social Spot → Parc des Buttes-Chaumont', FALSE, 0, NULL, 58, 'Social & Chill', 'Alex Rivière', 'scheduled'),
  ('BERLIN SQUAD TRAINING', 'Entraînement spécial Marathon de Berlin. Séance exclusive réservée aux membres qualifiés.', NOW() + INTERVAL '7 days', 'Stade Charléty → Piste d''athlétisme', TRUE, 1500, 40, 12, 'Performance', 'Chloé Simon', 'scheduled'),
  ('SUNSET SPRINT', 'Sprint final le long du canal avec le coucher de soleil.', NOW() - INTERVAL '5 days', 'Canal St Martin → Bastille', FALSE, 0, NULL, 42, 'Performance', 'Chloé Simon', 'completed'),
  ('RECOVERY LOOP', 'Session douce pour les membres en récupération. Stretching collectif.', NOW() - INTERVAL '8 days', 'Parc Monceau', FALSE, 0, NULL, 28, 'Récupération', 'Alex Rivière', 'completed');
