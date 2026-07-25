-- ====================================================================
-- CAPTEN SECURITY & RLS POLICIES MIGRATION
-- PRODUCTION-READY ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- ====================================================================

-- 1. TABLE : CLUBS
alter table public.clubs enable row level security;

drop policy if exists "clubs_owner_select" on public.clubs;
drop policy if exists "clubs_owner_update" on public.clubs;
drop policy if exists "clubs_owner_insert" on public.clubs;

create policy "clubs_owner_select" on public.clubs
  for select using (auth.uid() = owner_id);

create policy "clubs_owner_update" on public.clubs
  for update using (auth.uid() = owner_id);

create policy "clubs_owner_insert" on public.clubs
  for insert with check (auth.uid() = owner_id);


-- 2. TABLE : MEMBERS
alter table public.members enable row level security;

drop policy if exists "members_own_club" on public.members;

create policy "members_own_club" on public.members
  for all using (
    club_id in (
      select id from public.clubs where owner_id = auth.uid()
    )
  );


-- 3. TABLE : RUNS / SESSIONS
alter table public.runs enable row level security;

drop policy if exists "runs_own_club" on public.runs;

create policy "runs_own_club" on public.runs
  for all using (
    club_id in (
      select id from public.clubs where owner_id = auth.uid()
    )
  );


-- 4. TABLE : SPOT_EVENTS
alter table public.spot_events enable row level security;

drop policy if exists "spot_events_own_club" on public.spot_events;

create policy "spot_events_own_club" on public.spot_events
  for all using (
    club_id in (
      select id from public.clubs where owner_id = auth.uid()
    )
  );


-- 5. TABLE : SPOT_TICKETS
alter table public.spot_tickets enable row level security;

drop policy if exists "tickets_own_club" on public.spot_tickets;

create policy "tickets_own_club" on public.spot_tickets
  for select using (
    spot_event_id in (
      select id from public.spot_events where club_id in (
        select id from public.clubs where owner_id = auth.uid()
      )
    )
  );

-- Contrainte UNIQUE sur stripe_payment_intent_id pour idempotence ultime
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'unique_payment_intent'
  ) then
    alter table public.spot_tickets
      add constraint unique_payment_intent
      unique (stripe_payment_intent_id);
  end if;
end $$;


-- 6. TABLE : SPOTS (COMMERCES)
alter table public.spots enable row level security;

drop policy if exists "spots_active_read" on public.spots;
drop policy if exists "spots_admin_write" on public.spots;

create policy "spots_active_read" on public.spots
  for select using (status = 'active');

create policy "spots_admin_write" on public.spots
  for all using (auth.uid() in (
    select id from auth.users where email = 'admin@capten.app'
  ));


-- 7. TABLE : RUNNER_VISITS (PROTECTION DES VISITES)
alter table public.runner_visits enable row level security;

drop policy if exists "runner_visits_service_only" on public.runner_visits;

create policy "runner_visits_service_only" on public.runner_visits
  for all using (false); -- Seule la service_role key peut lire/écrire


-- 8. TABLE : INCIDENTS / SIGNALEMENTS
alter table public.incidents enable row level security;

drop policy if exists "incidents_own_club" on public.incidents;

create policy "incidents_own_club" on public.incidents
  for select using (
    club_id in (
      select id from public.clubs where owner_id = auth.uid()
    )
  );
