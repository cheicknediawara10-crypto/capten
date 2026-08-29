-- Migration: Ajouter la colonne pace_group à event_inscriptions
-- Permet aux coureurs de choisir leur sas d'allure à l'inscription
-- Valeurs typiques : 🟢 Cool (6:00 - 6:30/km), 🟡 Rythmé (5:15 - 5:45/km), 🔴 Fast (sub-5:00/km), 🚶 Run & Walk (Tous niveaux)

ALTER TABLE public.event_inscriptions
ADD COLUMN IF NOT EXISTS pace_group TEXT;

COMMENT ON COLUMN public.event_inscriptions.pace_group IS 'Sas d''allure choisi par le coureur à l''inscription (ex: 🟢 Cool, 🟡 Rythmé, 🔴 Fast, 🚶 Run & Walk)';
