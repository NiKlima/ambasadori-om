-- Ambasadori OM v3 — публичные профили амбассадоров (попап на лендинге)
-- Накатывать после schema.sql + 002_v2.sql.

-- 1. Дополнительные поля профиля
alter table profiles
  add column birthdate date,
  add column achievements jsonb not null default '[]'::jsonb;

-- 2. Расширяем view лидерборда: bio, socials, achievements, birthdate
drop view if exists leaderboard;
create view leaderboard as
  select
    p.id,
    p.full_name,
    p.club,
    p.sport,
    p.photo_url,
    p.bio,
    p.socials,
    p.achievements,
    p.birthdate,
    coalesce(sum(t.amount), 0)::int as total_points
  from profiles p
  left join point_transactions t on t.trainer_id = p.id
  where p.role = 'trainer' and p.is_active
  group by p.id
  order by total_points desc;
