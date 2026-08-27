-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — CONSENTEMENT DONNÉES DE SANTÉ (RGPD art. 9) sur les fiches ICE
--  À exécuter dans Supabase → SQL Editor → Run.
--
--  Les fiches ICE peuvent contenir des données de santé (groupe sanguin,
--  allergies, notes médicales) = catégorie spéciale (art. 9). On horodate le
--  consentement explicite du coureur + la version du texte accepté, pour la
--  traçabilité (base légale : art. 9§2a consentement + art. 9§2c intérêt vital).
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.membre_ice
  ADD COLUMN IF NOT EXISTS consent_sante_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_sante_version TEXT;
