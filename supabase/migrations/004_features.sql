-- Ambasadori OM v3 — storytelling, события, ПДн, контакты
-- Накатывать после schema.sql + 002_v2.sql + 003_trainer_public.sql

-- 1. Storytelling в profiles
alter table profiles
  add column quote text,
  add column story text,
  add column intro_video_url text,
  add column gallery jsonb not null default '[]'::jsonb;

-- 2. Видео-инструкции в челленджах
alter table challenges
  add column intro_video_url text;

-- 3. События
create type event_kind as enum ('race', 'live', 'workshop', 'community');
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  kind event_kind not null default 'community',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  link text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_events_starts_at on events(starts_at);
alter table events enable row level security;
create policy events_public_read on events for select using (active);
create policy events_admin_all on events for all using (is_admin()) with check (is_admin());

-- 4. Сообщения через /contacts
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table contact_messages enable row level security;
create policy contact_public_insert on contact_messages for insert with check (true);
create policy contact_admin_read on contact_messages for select using (is_admin());
create policy contact_admin_update on contact_messages for update using (is_admin());

-- 5. Согласие на ПДн в опросе подопечного
alter table survey_responses
  add column consent_at timestamptz not null default now();

-- 6. Бакет аватаров (тренер пишет в свою папку avatars/<uid>/...)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true) on conflict (id) do nothing;

create policy avatars_self_write on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_self_update on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_self_delete on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_public_read on storage.objects for select using (bucket_id = 'avatars');

-- 7. Обновляем view: добавляем новые поля для попапа и публичного профиля
drop view if exists leaderboard;
create view leaderboard as
  select p.id, p.full_name, p.club, p.sport, p.photo_url,
    p.bio, p.socials, p.achievements, p.birthdate,
    p.quote, p.story, p.intro_video_url, p.gallery,
    coalesce(sum(t.amount), 0)::int as total_points
  from profiles p
  left join point_transactions t on t.trainer_id = p.id
  where p.role = 'trainer' and p.is_active
  group by p.id
  order by total_points desc;
