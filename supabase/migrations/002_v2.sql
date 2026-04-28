-- Ambasadori OM v2 — типизированные челленджи + AI + шоп + публичные опросы
-- Накатывать в Supabase SQL Editor поверх schema.sql.

-- 1. Расширяем challenges

create type challenge_kind as enum ('photo_ai', 'video_ai', 'survey_trainee', 'manual');

alter table challenges
  add column kind challenge_kind not null default 'manual',
  add column cover_url text,
  add column ai_prompt text,
  add column ai_check boolean not null default false;

-- 2. Расширяем submissions: видео + AI-вердикт

alter table submissions
  add column video_url text,
  add column ai_verdict jsonb;

-- 3. Шоп

create type product_kind as enum ('merch', 'gear', 'service', 'digital', 'perk');
create type order_status as enum ('pending', 'approved', 'fulfilled', 'cancelled');

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  kind product_kind not null default 'merch',
  price_points int not null check (price_points > 0),
  stock int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  price_points int not null,
  status order_status not null default 'pending',
  trainer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create index idx_orders_trainer on orders(trainer_id);
create index idx_orders_status on orders(status);

-- Атомарный заказ: проверка баланса + списание + создание заказа
create or replace function create_order(p_product_id uuid, p_note text default null)
returns uuid language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_price int;
  v_stock int;
  v_balance int;
  v_order_id uuid;
begin
  if v_uid is null then raise exception 'Не авторизован'; end if;

  select price_points, stock into v_price, v_stock
    from products where id = p_product_id and active = true for update;
  if v_price is null then raise exception 'Товар недоступен'; end if;
  if v_stock is not null and v_stock <= 0 then raise exception 'Закончилось'; end if;

  select coalesce(sum(amount), 0) into v_balance
    from point_transactions where trainer_id = v_uid;
  if v_balance < v_price then raise exception 'Недостаточно баллов'; end if;

  insert into orders (trainer_id, product_id, price_points, trainer_note)
    values (v_uid, p_product_id, v_price, p_note)
    returning id into v_order_id;

  insert into point_transactions (trainer_id, amount, reason, created_by)
    values (v_uid, -v_price, 'Заказ в шопе', v_uid);

  if v_stock is not null then
    update products set stock = stock - 1 where id = p_product_id;
  end if;

  return v_order_id;
end;
$$;

-- Возврат баллов при отмене заказа
create or replace function refund_on_cancel()
returns trigger language plpgsql as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    insert into point_transactions (trainer_id, amount, reason, created_by)
      values (new.trainer_id, new.price_points, 'Возврат: отмена заказа', auth.uid());
    update products set stock = coalesce(stock, 0) + 1 where id = new.product_id and stock is not null;
  end if;
  return new;
end;
$$;

create trigger orders_refund_on_cancel
  after update on orders
  for each row execute function refund_on_cancel();

-- 4. Опросы (без auth: публичная ссылка с реф-кодом тренера)

create table survey_questions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  position int not null,
  text text not null,
  options jsonb not null default '[]'::jsonb
);

create index idx_survey_q_challenge on survey_questions(challenge_id, position);

create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  trainee_email text not null,
  trainee_name text,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (trainee_email, challenge_id, trainer_id)
);

create index idx_survey_r_trainer on survey_responses(trainer_id);
create index idx_survey_r_challenge on survey_responses(challenge_id);

-- При завершении опроса — автоматически approved submission на тренера + начисление
create or replace function on_survey_response()
returns trigger language plpgsql security definer as $$
declare
  v_challenge_points int;
  v_challenge_title text;
  v_submission_id uuid;
begin
  select points, title into v_challenge_points, v_challenge_title
    from challenges where id = new.challenge_id;

  insert into submissions (trainer_id, challenge_id, note, status, moderated_at)
    values (new.trainer_id, new.challenge_id,
            'Опрос: ' || new.trainee_email, 'approved', now())
    returning id into v_submission_id;

  insert into point_transactions (trainer_id, amount, reason, submission_id)
    values (new.trainer_id, coalesce(v_challenge_points, 0),
            'Опрос пройден: ' || coalesce(v_challenge_title, ''), v_submission_id);

  return new;
end;
$$;

create trigger surveys_award_trainer
  after insert on survey_responses
  for each row execute function on_survey_response();

-- 5. RLS для новых таблиц

alter table products enable row level security;
alter table orders enable row level security;
alter table survey_questions enable row level security;
alter table survey_responses enable row level security;

-- products
create policy products_auth_read on products
  for select using (auth.role() = 'authenticated' and active);
create policy products_admin_all on products
  for all using (is_admin()) with check (is_admin());

-- orders
create policy orders_self_read on orders
  for select using (trainer_id = auth.uid());
create policy orders_admin_all on orders
  for all using (is_admin()) with check (is_admin());

-- survey_questions: публичное чтение для рендера /survey/[id]
create policy survey_q_public_read on survey_questions
  for select using (true);
create policy survey_q_admin_write on survey_questions
  for all using (is_admin()) with check (is_admin());

-- survey_responses: insert идёт через server action под service_role.
-- Чтение: тренер видит свои, админ — все.
create policy survey_r_trainer_read on survey_responses
  for select using (trainer_id = auth.uid());
create policy survey_r_admin_read on survey_responses
  for select using (is_admin());

-- 6. Storage bucket для обложек (challenges + products)

insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
  on conflict (id) do nothing;

create policy "covers_admin_write"
  on storage.objects for insert
  with check (
    bucket_id = 'covers'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "covers_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'covers'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "covers_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'covers'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "covers_public_read"
  on storage.objects for select using (bucket_id = 'covers');
