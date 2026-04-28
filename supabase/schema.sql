-- Ambasadori OM — схема БД, RLS и плейсхолдеры
-- Накатывать в Supabase SQL Editor после создания проекта.

-- 1. Схема

create type user_role as enum ('trainer', 'admin');
create type submission_status as enum ('pending', 'approved', 'rejected');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'trainer',
  full_name text not null,
  club text,
  sport text,
  promo_code text unique,
  photo_url text,
  bio text,
  socials jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points int not null default 0,
  requires_moderation boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  photo_url text,
  link text,
  note text,
  status submission_status not null default 'pending',
  moderator_comment text,
  moderated_by uuid references profiles(id),
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);

create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  amount int not null,
  reason text not null,
  submission_id uuid references submissions(id) on delete set null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_transactions_trainer on point_transactions(trainer_id);
create index idx_submissions_trainer on submissions(trainer_id);
create index idx_submissions_status on submissions(status);

-- 2. Публичная view лидерборда

create or replace view leaderboard as
  select
    p.id,
    p.full_name,
    p.club,
    p.sport,
    p.photo_url,
    coalesce(sum(t.amount), 0)::int as total_points
  from profiles p
  left join point_transactions t on t.trainer_id = p.id
  where p.role = 'trainer' and p.is_active
  group by p.id
  order by total_points desc;

-- 3. RLS

alter table profiles enable row level security;
alter table challenges enable row level security;
alter table submissions enable row level security;
alter table point_transactions enable row level security;

-- helper: is_admin
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy profiles_self_read on profiles
  for select using (auth.uid() = id);
create policy profiles_admin_read on profiles
  for select using (is_admin());
create policy profiles_self_update on profiles
  for update using (auth.uid() = id);
create policy profiles_admin_all on profiles
  for all using (is_admin()) with check (is_admin());

-- challenges
create policy challenges_auth_read on challenges
  for select using (auth.role() = 'authenticated');
create policy challenges_admin_write on challenges
  for all using (is_admin()) with check (is_admin());

-- submissions
create policy submissions_self_read on submissions
  for select using (trainer_id = auth.uid());
create policy submissions_self_insert on submissions
  for insert with check (trainer_id = auth.uid());
create policy submissions_admin_all on submissions
  for all using (is_admin()) with check (is_admin());

-- point_transactions
create policy transactions_self_read on point_transactions
  for select using (trainer_id = auth.uid());
create policy transactions_admin_all on point_transactions
  for all using (is_admin()) with check (is_admin());

-- 4. Storage bucket для фото-подтверждений

insert into storage.buckets (id, name, public)
  values ('submissions', 'submissions', true)
  on conflict (id) do nothing;

create policy "submissions_insert_authenticated"
  on storage.objects for insert
  with check (bucket_id = 'submissions' and auth.role() = 'authenticated');

create policy "submissions_select_public"
  on storage.objects for select
  using (bucket_id = 'submissions');

-- 5. Триггер: при одобрении submission — создать транзакцию баллов

create or replace function award_points_on_approval()
returns trigger language plpgsql as $$
declare
  challenge_points int;
  challenge_title text;
begin
  if new.status = 'approved' and (old.status is null or old.status <> 'approved') then
    select points, title into challenge_points, challenge_title
      from challenges where id = new.challenge_id;
    insert into point_transactions (trainer_id, amount, reason, submission_id, created_by)
      values (new.trainer_id, challenge_points, 'Челлендж: ' || challenge_title, new.id, new.moderated_by);
  end if;
  return new;
end;
$$;

create trigger submissions_awards_points
  after update on submissions
  for each row execute function award_points_on_approval();
