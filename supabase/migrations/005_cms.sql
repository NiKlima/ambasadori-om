-- Ambasadori OM v5 — CMS: sort_order на сущностях + featured products + clubs entity
-- Накатывать после schema.sql + 002_v2.sql + 003_trainer_public.sql + 004_features.sql

-- 1. sort_order для управления очерёдностью отображения на главной
alter table challenges add column if not exists sort_order int not null default 0;
alter table products   add column if not exists sort_order int not null default 0;
alter table events     add column if not exists sort_order int not null default 0;
alter table profiles   add column if not exists sort_order int not null default 0;

-- 2. featured products — флаг показа в "Prizes" блоке на главной
alter table products add column if not exists featured boolean not null default false;

-- 3. Индексы на sort_order для запросов на главной
create index if not exists challenges_sort_idx on challenges (active, sort_order desc, created_at desc);
create index if not exists products_sort_idx   on products   (active, sort_order desc, created_at desc);
create index if not exists events_sort_idx     on events     (active, sort_order desc, starts_at);
create index if not exists products_featured_idx on products (active, featured, sort_order desc);

-- 4. Clubs — отдельная сущность для "8 partner clubs"
create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  description text,
  sport_focus text,
  city text default 'Chișinău',
  website text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists clubs_sort_idx on clubs (active, sort_order desc, created_at desc);

-- 5. profile.club_id → FK на clubs (свободный текст profile.club остаётся для legacy/fallback)
alter table profiles add column if not exists club_id uuid references clubs(id) on delete set null;

-- 6. RLS для clubs
alter table clubs enable row level security;
drop policy if exists "clubs_public_read" on clubs;
drop policy if exists "clubs_admin_all" on clubs;
create policy "clubs_public_read" on clubs for select using (active = true);
create policy "clubs_admin_all" on clubs for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 7. Сидим 8 клубов (idempotent через slug)
insert into clubs (name, slug, sport_focus, sort_order, description) values
  ('Bigsport',        'bigsport',        'running, functional',     100, 'крупнейший беговой клуб Кишинёва. групповые забеги по выходным, тренеры мирового уровня.'),
  ('Martz Fitness',   'martz-fitness',   'crossfit, boxing',         90, 'кроссфит-сообщество и боксёрский ринг. сильные тренеры, прозрачный прогресс.'),
  ('Jiva Yoga',       'jiva-yoga',       'yoga',                     80, 'йога-студия в центре. хатха, виньяса, восстановительные практики.'),
  ('Premier Fitness', 'premier-fitness', 'strength, powerlifting',   70, 'силовой зал с олимпийским оборудованием. пауэрлифтинг и функциональная сила.'),
  ('Alexia',          'alexia',          'pilates',                  60, 'пилатес-студия с реформерами. малые группы, индивидуальный подход.'),
  ('Aquaterra',       'aquaterra',       'triathlon, swimming',      50, 'триатлон и плавание. собственный бассейн + беговая программа.'),
  ('Pilates Club',    'pilates-club',    'pilates',                  40, 'пилатес-клуб для всех уровней. групповые и персональные занятия.'),
  ('OM Studio',       'om-studio',       'multi-sport',              30, 'мультиспортивная студия партнёров OM. бег, йога, силовые в одном месте.')
on conflict (slug) do nothing;

-- 8. Best-effort миграция: profile.club (text) → club_id (uuid) по совпадению name
update profiles p set club_id = c.id
  from clubs c
  where p.club_id is null
    and p.club is not null
    and lower(p.club) = lower(c.name);
