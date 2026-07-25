-- CAPTEN — Migration SQL : Extension aux communautés sportives locales
-- Ajout des types de communautés (Run Club, Walk Club, Trail & Rando, Autre)

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS community_type TEXT NOT NULL DEFAULT 'run_club';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS community_type_custom TEXT;

-- Index pour les statistiques d'administration et filtres
CREATE INDEX IF NOT EXISTS idx_clubs_community_type ON clubs (community_type);
