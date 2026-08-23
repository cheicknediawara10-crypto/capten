-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — VERROUILLAGE des colonnes sensibles de `clubs`
--  À exécuter dans Supabase → SQL Editor → Run.
--
--  PROBLÈME : la clé publique (anon), embarquée dans le navigateur, pouvait
--  lire les 39 colonnes de `clubs`, dont `cagnotte_data` (soldes + noms +
--  montants des contributeurs), `stripe_customer_id`, `stripe_connect_id`,
--  `owner_id`, `whatsapp_link`, `credit_balance_euros`, `twilio_*`…
--
--  FIX : on retire l'accès total d'anon, puis on ne ré-accorde QUE les
--  colonnes publiques (celles dont les pages /join et /event ont besoin).
--  Le fondateur, lui, lit son club en entier via les server actions (clé
--  service) → non affecté. Aucune donnée sensible ne fuit plus.
-- ════════════════════════════════════════════════════════════════════════

revoke select on public.clubs from anon;

grant select (
  id,
  name,
  slug,
  description,
  logo_url,
  city,
  website_url,
  instagram_url,
  community_type,
  community_type_custom,
  sport_type,
  created_at,
  is_active,
  plan,
  stripe_plan,
  stripe_subscription_status,
  trial_ends_at,
  first_run_created_at,
  signup_variant,
  spot_name,
  branding
) on public.clubs to anon;

-- Après exécution, un `select *` en anon échouera (privilège manquant sur
-- les colonnes sensibles), tandis que /join (`select id,name,logo_url,city,
-- description,website_url`) continuera de fonctionner.
