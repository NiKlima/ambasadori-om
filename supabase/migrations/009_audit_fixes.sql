-- Ambasadori OM v7.1 — audit fixes
-- Addresses 4 issues found during full role audit:
--   D  : anon could not read challenges/products/trainer-profiles -> public pages fell back to static demo data
--   B6 : event_registrations had open INSERT policy that let anon bypass enabled/capacity/duplicate checks
--   B5 : submissions storage bucket let any authenticated user write into any namespace
--   B1 : (handled in app code) trainer cover upload silent-failed against admin-only covers bucket

-- ============================================================
-- D. Public-read RLS for content tables anon must see
-- ============================================================

-- challenges: anyone can read the active ones
drop policy if exists challenges_public_read on challenges;
create policy challenges_public_read on challenges
  for select using (active = true);

-- products: anyone can read the active ones (shop landing + featured)
drop policy if exists products_public_read on products;
create policy products_public_read on products
  for select using (active = true);

-- profiles: anyone can read active trainers (host trainer cards, public trainer pages)
-- self-read and admin-read policies remain unchanged from schema.sql
drop policy if exists profiles_public_trainer_read on profiles;
create policy profiles_public_trainer_read on profiles
  for select using (role = 'trainer' and is_active = true);

-- ============================================================
-- B6. event_registrations — remove the wide-open public INSERT
-- The server action (registerForEvent) uses service_role, so this
-- change does not break it. Direct REST inserts from anon are
-- now blocked.
-- ============================================================

drop policy if exists "regs_public_insert" on event_registrations;
-- intentionally no replacement: only service_role / admin context inserts

-- ============================================================
-- B5. submissions storage bucket — folder-scoped writes only
-- ============================================================

drop policy if exists "submissions_insert_authenticated" on storage.objects;
create policy "submissions_insert_self" on storage.objects
  for insert
  with check (
    bucket_id = 'submissions'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- also allow self-update and self-delete on own submissions (in case UI replaces a file)
drop policy if exists "submissions_update_self" on storage.objects;
create policy "submissions_update_self" on storage.objects
  for update
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "submissions_delete_self" on storage.objects;
create policy "submissions_delete_self" on storage.objects
  for delete
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- public read on submissions stays as defined in schema.sql
