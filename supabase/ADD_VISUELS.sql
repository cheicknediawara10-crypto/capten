-- ═══════════════════════════════════════════════════════════════════════════
-- VISUELS DU CREW — champ distance + suivi des téléchargements
-- À exécuter dans le SQL Editor de Supabase (prod). Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- Distance du run (km), optionnelle
ALTER TABLE events ADD COLUMN IF NOT EXISTS distance_km NUMERIC(5,2);

-- Suivi : le visuel a-t-il déjà été téléchargé ? (sert au futur Copilote)
ALTER TABLE events ADD COLUMN IF NOT EXISTS affiche_telechargee BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS story_telechargee   BOOLEAN NOT NULL DEFAULT false;
