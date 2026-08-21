-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — Signalements & retours des coureurs (sécurité + avis)
--  À exécuter UNE FOIS dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.membre_signalements (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null,
  membre_id    uuid,                                  -- NULL si le coureur a choisi l'anonymat
  is_anonymous boolean not null default false,
  type         text not null default 'autre',         -- securite | organisation | avis | autre
  message      text not null,
  event_id     uuid,                                   -- run concerné (optionnel)
  status       text not null default 'new',            -- new | done
  created_at   timestamptz not null default now()
);

create index if not exists idx_signalements_club
  on public.membre_signalements (club_id, status, created_at desc);

-- Sécurité : accès UNIQUEMENT via les server actions (clé service).
-- RLS activé sans policy => aucun accès anonyme/public direct.
alter table public.membre_signalements enable row level security;
