-- Ambasadori OM v6 — events workflow + registrations
-- ASCII-only (no Cyrillic) to avoid clipboard mojibake. Comments stay English.

-- 1. Status enum (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type event_status as enum ('draft', 'pending', 'approved', 'rejected');
  end if;
end$$;

-- 2. Extend events table
alter table events
  add column if not exists status event_status not null default 'pending',
  add column if not exists created_by uuid references profiles(id) on delete set null,
  add column if not exists moderator_note text,
  add column if not exists moderated_by uuid references profiles(id) on delete set null,
  add column if not exists moderated_at timestamptz,
  add column if not exists host_trainer_id uuid references profiles(id) on delete set null,
  add column if not exists host_club_id uuid references clubs(id) on delete set null,
  add column if not exists registration_enabled boolean not null default false,
  add column if not exists max_participants int;

-- Backfill: existing events were created by admin -> approved
update events set status = 'approved' where status = 'pending';

create index if not exists events_status_idx on events(status, created_at desc);
create index if not exists events_host_trainer_idx on events(host_trainer_id);
create index if not exists events_host_club_idx on events(host_club_id);

-- 3. event_registrations table
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  note text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists event_registrations_event_idx on event_registrations(event_id);
create unique index if not exists event_registrations_unique on event_registrations(event_id, lower(email));

alter table event_registrations enable row level security;

drop policy if exists "regs_public_insert" on event_registrations;
create policy "regs_public_insert" on event_registrations
  for insert with check (true);

drop policy if exists "regs_admin_select" on event_registrations;
create policy "regs_admin_select" on event_registrations
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "regs_self_select" on event_registrations;
create policy "regs_self_select" on event_registrations
  for select using (auth.uid() = user_id);

drop policy if exists "regs_admin_delete" on event_registrations;
create policy "regs_admin_delete" on event_registrations
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 4. RLS updates on events
drop policy if exists events_public_read on events;
create policy events_public_read on events
  for select using (active and status = 'approved');

drop policy if exists events_owner_read on events;
create policy events_owner_read on events
  for select using (auth.uid() = created_by);

drop policy if exists events_owner_insert on events;
create policy events_owner_insert on events
  for insert with check (
    auth.uid() = created_by
    and status in ('pending', 'draft')
  );

drop policy if exists events_owner_update on events;
create policy events_owner_update on events
  for update
    using (auth.uid() = created_by and status in ('pending', 'draft', 'rejected'))
    with check (auth.uid() = created_by and status in ('pending', 'draft'));

-- events_admin_all policy is from migration 004 and stays as is.
