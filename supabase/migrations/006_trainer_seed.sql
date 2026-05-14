-- Ambasadori OM v5 — наполнение демо-тренеров
-- Накатывать после 005_cms.sql и после `node scripts/seed-users.mjs`
-- (миграция апдейтит profiles по promo_code, который уже выставлен сидом)

-- 1. ALINA — Bigsport · running
update profiles set
  bio = 'first running coach in Bigsport. 10 years on the road.',
  quote = 'running is a dialogue with yourself. and water is its language.',
  story = E'## start\n\ni started running at 26, after my third failed diet. my first 2K felt like a marathon — i couldn''t breathe, my legs trembled, i wanted to quit at every lamppost. but i didn''t.\n\n## turning point\n\nthree years in, i ran my first half marathon in Chișinău. that day i understood: running isn''t about distance, it''s about staying in conversation with your own body. you ask, it answers. you push, it adapts.\n\n## now\n\ni coach 30+ runners — beginners and Berlin Marathon finishers. my method: small honest weeks beat heroic months. and water — always water — because the body that runs on dehydration loses every conversation it tries to have.',
  achievements = to_jsonb(array['Berlin Marathon 2024 — finisher 3:42', 'Chișinău Half Marathon 2023 — top 10 women', 'Coach of the Year — Bigsport 2023', 'IAAF Coaching Level 2']),  birthdate = '1992-04-12',
  socials = '{"instagram":"alina.runs","telegram":"alinaruns","tiktok":"alina.runs"}'::jsonb,
  club_id = (select id from clubs where slug = 'bigsport'),
  sort_order = 100
where promo_code = 'ALINA';

-- 2. MIHAI — Martz Fitness · crossfit
update profiles set
  bio = 'crossfit head coach at Martz. ten years of barbells and burpees.',
  quote = 'strength is just consistency wearing a heavy jacket.',
  story = E'## from football to the box\n\ni played semi-pro football until 28, then a knee injury closed that door. i found crossfit by accident — a friend dragged me to a class, i couldn''t finish the warm-up. that was the day i decided to start over.\n\n## the box\n\ntwo years later i was coaching. five years later i was running my own program at Martz. crossfit gave me what football couldn''t: a sport that scales with your age, your mood, your last night''s sleep.\n\n## philosophy\n\ni don''t believe in heroes. i believe in athletes who show up on bad days. i drink OM between every interval — your body can''t lift if it can''t breathe, and it can''t breathe without water.',
  achievements = to_jsonb(array['CrossFit L2 trainer', 'Open 2024 — Quarterfinalist', 'Coach since 2018 · 200+ athletes trained', 'Boxing certified — Federation level']),  birthdate = '1988-09-03',
  socials = '{"instagram":"mihai.lifts","telegram":"mihailifts","youtube":"@mihaitrains"}'::jsonb,
  club_id = (select id from clubs where slug = 'martz-fitness'),
  sort_order = 95
where promo_code = 'MIHAI';

-- 3. IRINA — Jiva Yoga · yoga
update profiles set
  bio = 'yoga teacher at Jiva. hatha, vinyasa, and the patience that comes with both.',
  quote = 'a strong body is quiet. a quiet body is honest.',
  story = E'## first mat\n\nmy mother taught me my first sun salutation when i was 14. i didn''t take it seriously until university — exam stress, no sleep, a panic attack on the morning of an exam. i opened a book on pranayama that night and never closed it.\n\n## india\n\nin 2017 i spent six months in Rishikesh studying with my teacher. i learned that yoga isn''t poses — poses are the easiest part. yoga is staying with what''s uncomfortable until it becomes information.\n\n## studio\n\nat Jiva i teach 5 days a week. i tell my students: if your breath is shallow, your asana is theater. drink water before practice — your tissues need to be soft to listen.',
  achievements = to_jsonb(array['RYT-500 certified · Rishikesh', 'Hatha & Vinyasa lead at Jiva', '8 years teaching · 1000+ classes', 'Pranayama specialist']),  birthdate = '1990-07-20',
  socials = '{"instagram":"irina.flows","telegram":"irinaflows"}'::jsonb,
  club_id = (select id from clubs where slug = 'jiva-yoga'),
  sort_order = 90
where promo_code = 'IRINA';

-- 4. VICTOR — Premier Fitness · strength
update profiles set
  bio = 'powerlifting coach at Premier. raw strength, classical method.',
  quote = 'the bar tells you the truth. it never lies, never flatters.',
  story = E'## first squat\n\ni was 19. my first competition deadlift was 140kg, and i thought i was a giant. i look at that number now and laugh — but back then it was the heaviest thing i had ever pulled, and it taught me what real effort feels like.\n\n## ten years\n\nfor a decade i lifted alone. no coach, no plan, just stubbornness and YouTube. i made every mistake — overtraining, ego pulls, skipped warm-ups. i broke down at 32, took a year off, came back with a real coach and a real plan.\n\n## now\n\ni coach raw powerlifters at Premier. my philosophy: small loads, long timelines, perfect technique. the strongest athletes i know are the most patient ones.',
  achievements = to_jsonb(array['IPF Open 2023 — silver -93kg', 'Squat 240kg · Bench 160kg · Deadlift 280kg', 'Coach since 2019 · 50+ athletes', 'Sports Nutrition certified']),  birthdate = '1985-02-14',
  socials = '{"instagram":"victor.lifts","telegram":"vmoraru"}'::jsonb,
  club_id = (select id from clubs where slug = 'premier-fitness'),
  sort_order = 85
where promo_code = 'VICTOR';

-- 5. OXANA — Alexia · pilates
update profiles set
  bio = 'pilates reformer specialist at Alexia. mind, body, and a hundred small repetitions.',
  quote = 'control before strength. precision before speed. always.',
  story = E'## injury\n\ni was a competitive swimmer until 24, when a shoulder injury ended my season and almost my career. my physio sent me to a pilates studio for rehab. i went grudgingly. i stayed for ten years.\n\n## the method\n\npilates didn''t fix my shoulder — it taught me how to use my whole body so my shoulder didn''t carry weight that wasn''t its job. that''s the philosophy: every movement is a system, not a part.\n\n## studio\n\nat Alexia i run small reformer groups — never more than 4 people. i drink water between every set; the deep stabilizer muscles need hydration to fire correctly. tell anyone who says pilates is "just stretching" they''ve never held a single-leg teaser for 10 breaths.',
  achievements = to_jsonb(array['Pilates Method Alliance certified', 'Reformer specialist · 6 years at Alexia', 'Former competitive swimmer · regional medalist', 'Pre/post-natal pilates qualified']),  birthdate = '1993-11-05',
  socials = '{"instagram":"oxana.pilates","telegram":"oxanalupu"}'::jsonb,
  club_id = (select id from clubs where slug = 'alexia'),
  sort_order = 80
where promo_code = 'OXANA';

-- 6. ANDREI — Aquaterra · triathlon
update profiles set
  bio = 'triathlon coach at Aquaterra. swim-bike-run, three sports, one obsession.',
  quote = 'the finish line is a comma, never a period.',
  story = E'## first triathlon\n\ni did my first sprint triathlon in 2014 — borrowed bike, no training plan, finished mid-pack and threw up at the finish. i was hooked. three months later i signed up for an Olympic distance.\n\n## ironman\n\nin 2021 i finished my first full Ironman in 11:48. on the run leg, around km 32, i was so depleted i was hallucinating. that race taught me everything i now teach: hydration is not optional, fuel is not negotiable, and the run is won on the bike.\n\n## team\n\nat Aquaterra i coach 15 triathletes — from beginners to Kona-qualifiers. our team motto: "do less, recover more."',
  achievements = to_jsonb(array['Ironman 70.3 sub-5h · 2024', 'Full Ironman finisher · 2021', 'Triathlon Federation certified coach', 'Open water swim instructor']),  birthdate = '1986-06-18',
  socials = '{"instagram":"andrei.tri","telegram":"andreitri","youtube":"@andreitriathlon"}'::jsonb,
  club_id = (select id from clubs where slug = 'aquaterra'),
  sort_order = 75
where promo_code = 'ANDREI';

-- 7. NATALIA — Bigsport · functional
update profiles set
  bio = 'functional training lead at Bigsport. moves you''ll use for the rest of your life.',
  quote = 'train how you live. lift how you''ll move tomorrow.',
  story = E'## the gym, then the field\n\ni came up through traditional bodybuilding — split routines, machines, mirrors. for ten years i had a beautiful physique and a back that hurt every time i picked up groceries. that''s when i found functional training.\n\n## relearning\n\nat 30 i started over. learned to squat without a bar. learned to carry, drag, throw, climb. my body changed shape, but more importantly — it stopped hurting in real life.\n\n## now\n\nat Bigsport i run functional classes for women 25-50. they come for the body, they stay because their grandkids can''t pull them down anymore.',
  achievements = to_jsonb(array['NSCA-CFT certified', 'Functional Movement Screen Level 2', 'Pre/post-natal training certified', '8 years coaching · 300+ clients']),  birthdate = '1991-03-09',
  socials = '{"instagram":"natalia.moves","telegram":"nataliagincu"}'::jsonb,
  club_id = (select id from clubs where slug = 'bigsport'),
  sort_order = 70
where promo_code = 'NATALIA';

-- 8. DMITRII — Martz Fitness · boxing
update profiles set
  bio = 'boxing coach at Martz. amateur champion, professional teacher.',
  quote = 'a punch is just balance with intent.',
  story = E'## the gym at 12\n\nmy uncle ran a boxing gym in Chișinău. i swept the floor for two years before he let me hit a bag. that taught me the most important lesson in boxing: you don''t earn the right to be aggressive — you earn the right to be calm.\n\n## amateur years\n\ni boxed amateur until 26 — won a regional title, lost the national finals twice. i didn''t make it pro. but every fight i lost taught me more than any win could have.\n\n## now\n\nat Martz i coach kids and adults. boxing isn''t about violence — it''s about discipline disguised as a sport. and discipline starts with the obvious: water on the side of the ring, every round.',
  achievements = to_jsonb(array['Regional amateur champion 2014', 'AIBA Level 1 coach', '30+ amateur fighters trained', 'Boxing-conditioning specialist']),  birthdate = '1989-08-25',
  socials = '{"instagram":"dmitrii.boxing","telegram":"dmitriibx"}'::jsonb,
  club_id = (select id from clubs where slug = 'martz-fitness'),
  sort_order = 65
where promo_code = 'DMITRII';

-- 9. ELENA — Jiva Yoga · yoga
update profiles set
  bio = 'yoga teacher at Jiva. yin, restorative, and the slow honest practice.',
  quote = 'the pose you can hold for ten breaths is the one that''s changing you.',
  story = E'## burnout\n\ni was a corporate lawyer until 31. 70-hour weeks, anxiety attacks, sleep that stopped working. i quit on a tuesday and signed up for a 200-hour yoga teacher training on friday.\n\n## yin\n\ni gravitated to yin and restorative — the slow practices, the long holds. they were the opposite of my old life: nothing to prove, no clock, no winners. that''s where i started to recover.\n\n## teaching\n\nat Jiva i teach 4 yin classes a week. my students are tired professionals — i know their tired because it used to be mine. drink water before, after, and don''t talk during class. silence is the practice.',
  achievements = to_jsonb(array['Yin Yoga 100h · Yoga Alliance', 'Restorative Yoga certified', 'Yoga Nidra specialist', 'Trauma-informed teaching · ongoing']),  birthdate = '1987-12-02',
  socials = '{"instagram":"elena.yin","telegram":"elenaturcan"}'::jsonb,
  club_id = (select id from clubs where slug = 'jiva-yoga'),
  sort_order = 60
where promo_code = 'ELENA';

-- 10. SERGEI — Pilates Club · pilates
update profiles set
  bio = 'pilates teacher at Pilates Club. former dancer, current obsessive.',
  quote = 'every body is a question. pilates is how you listen for the answer.',
  story = E'## the stage\n\ni was a contemporary dancer until 28. dance gave me everything — discipline, body awareness, a sense of time. it also gave me chronic hip pain and a herniated disc by the time i was 30.\n\n## the studio\n\npilates was my rehab and then my profession. i did the comprehensive program in 2019, opened my own studio in 2021. i still dance, but only for myself.\n\n## students\n\nmy clients range from 18-year-old gymnasts to 75-year-old retirees. they all tell me the same thing after a few months: "i didn''t know my body could do this." that''s the joy of teaching pilates — you become a translator for someone''s own body.',
  achievements = to_jsonb(array['Comprehensive Pilates · 600h', 'Former contemporary dancer', 'Mat & Reformer certified', 'Studio owner since 2021']),  birthdate = '1990-05-17',
  socials = '{"instagram":"sergei.pilates","telegram":"sergeivrabie"}'::jsonb,
  club_id = (select id from clubs where slug = 'pilates-club'),
  sort_order = 55
where promo_code = 'SERGEI';

-- сидим несколько featured продуктов для landing prizes-блока
-- (если их ещё нет — добавляем; если есть — апдейтим featured/sort_order)

insert into products (title, description, kind, price_points, stock, featured, sort_order, active)
values
  ('Garmin Forerunner 165', 'GPS watch for runners and triathletes. perfect for tracking pace, heart rate, and recovery.', 'gear', 1200, 2, true, 100, true),
  ('Bigsport monthly pass', 'all clubs in the Bigsport network, 30 days unlimited.', 'perk', 600, 8, true, 90, true),
  ('OM ''26 capsule tee', 'limited edition tee + thermo bottle. season''s capsule drop.', 'merch', 250, 24, true, 80, true),
  ('Marathon start slot', 'reserved spot at Chișinău Marathon — main race of the year.', 'perk', 400, 30, true, 70, true),
  ('Session with top PT', 'one hour with a leading network coach. personal program included.', 'service', 350, 4, true, 60, true),
  ('OM ambassador jacket', 'exclusive merch for ambassadors. limited to programme members.', 'merch', 800, 12, true, 50, true)
on conflict do nothing;

-- сидим challenges sort_order чтобы порядок был осмысленным
update challenges set sort_order = 100 where title ilike '%photo with OM%';
update challenges set sort_order = 90 where title ilike '%client buys OM%';
update challenges set sort_order = 80 where title ilike '%client survey%' or title ilike '%pulse%';
update challenges set sort_order = 70 where title ilike '%registration%' or title ilike '%event%';
update challenges set sort_order = 60 where title ilike '%video reel%';
update challenges set sort_order = 50 where title ilike '%ambassador of the month%';
