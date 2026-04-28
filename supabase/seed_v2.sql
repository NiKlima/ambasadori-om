-- v2 сид-данные. Запускать после schema.sql + 002_v2.sql.
-- Безопасно перезапускать: использует on conflict / where not exists.

-- Челленджи v2 (без обложек — добавь через админку)
insert into challenges (title, description, points, kind, ai_prompt, ai_check, requires_moderation)
select * from (values
  ('Фото с OM в зале', 'Сфотографируй бутылку OM на тренировке — баллы за правильное фото приходят сразу.', 10, 'photo_ai'::challenge_kind,
   'на фото должна быть бутылка или упаковка OM на переднем плане, фон — спортзал, студия или открытая тренировка. Текст/логотип OM должен быть различим.', true, true),
  ('Сториз с тегом @om.water', 'Скрин Instagram-сториз с упоминанием @om.water и фрагментом тренировки.', 5, 'photo_ai'::challenge_kind,
   'на скрине Instagram-сториз должна быть упомянута @om.water (в виде тега или текста), и присутствовать фото или видео тренировки.', true, true),
  ('30 отжиманий одним дублем', 'Запиши видео 30 отжиманий без склеек.', 15, 'video_ai'::challenge_kind,
   'на видео человек выполняет отжимания на полу. Должно быть видно минимум 20 повторений в одном ракурсе, без видимых монтажных склеек.', true, true),
  ('Опрос подопечного «Как ты пьёшь воду»', 'Подопечный отвечает на 3 вопроса о привычках гидратации. Ссылку отправь сам.', 10, 'survey_trainee'::challenge_kind,
   null, false, false),
  ('Участие в забеге Кишинёва 10К', 'Прислал стартовый номер или фото с финиша.', 50, 'manual'::challenge_kind,
   null, false, true),
  ('Прямой эфир «Утренняя гидратация»', 'Эфир в Instagram/TG с упоминанием программы OM.', 20, 'manual'::challenge_kind,
   null, false, true)
) as v(title, description, points, kind, ai_prompt, ai_check, requires_moderation)
where not exists (select 1 from challenges c where c.title = v.title);

-- Вопросы для опроса
insert into survey_questions (challenge_id, position, text, options)
select c.id, 1, 'Сколько воды ты пьёшь в день?',
  '[{"label":"Меньше 1 литра"},{"label":"1–2 литра"},{"label":"Больше 2 литров"}]'::jsonb
from challenges c
where c.kind = 'survey_trainee' and c.title = 'Опрос подопечного «Как ты пьёшь воду»'
  and not exists (
    select 1 from survey_questions q where q.challenge_id = c.id and q.position = 1
  );

insert into survey_questions (challenge_id, position, text, options)
select c.id, 2, 'Какую воду ты обычно покупаешь?',
  '[{"label":"OM"},{"label":"Другую минеральную"},{"label":"Из-под крана / фильтр"}]'::jsonb
from challenges c
where c.kind = 'survey_trainee' and c.title = 'Опрос подопечного «Как ты пьёшь воду»'
  and not exists (
    select 1 from survey_questions q where q.challenge_id = c.id and q.position = 2
  );

insert into survey_questions (challenge_id, position, text, options)
select c.id, 3, 'Готов ли ты попробовать программу OM?',
  '[{"label":"Да, давай"},{"label":"Может быть"},{"label":"Пока нет"}]'::jsonb
from challenges c
where c.kind = 'survey_trainee' and c.title = 'Опрос подопечного «Как ты пьёшь воду»'
  and not exists (
    select 1 from survey_questions q where q.challenge_id = c.id and q.position = 3
  );

-- Продукты для шопа
insert into products (title, description, kind, price_points, stock)
select * from (values
  ('Бесплатная тренировка с топовым тренером Кишинёва', 'Часовая сессия с одним из ведущих тренеров клуба-партнёра OM.', 'service'::product_kind, 50, 5),
  ('Шопер OM', 'Брендированный плотный шопер для зала и на каждый день.', 'merch'::product_kind, 25, 30),
  ('Бутылка OM 0.75 л', 'Многоразовая бутылка с логотипом OM.', 'merch'::product_kind, 30, 30),
  ('Скидка 50% на следующий заказ воды OM', 'Промокод на одну доставку. Действует 30 дней.', 'digital'::product_kind, 40, null),
  ('Кроссовки Nike Pegasus', 'Беговые кроссовки. Размер уточняем после заказа.', 'gear'::product_kind, 800, 3),
  ('Часы Garmin Forerunner 165', 'GPS-часы для тренировок и забегов.', 'gear'::product_kind, 1500, 1),
  ('Месячный абонемент в зал-партнёр', 'Безлимитный доступ на 30 дней в один из залов сети партнёров OM.', 'service'::product_kind, 600, 5)
) as v(title, description, kind, price_points, stock)
where not exists (select 1 from products p where p.title = v.title);
