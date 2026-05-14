-- Ambasadori OM v5.1 — реалистичные истории молдавских тренеров
-- Перезаписывает контент из 006_trainer_seed.sql на правдоподобные истории
-- (молдавские реалии: Valea Morilor, Codrii, Hâncu, Chișinău Marathon, IRONMAN, Aquaterra etc).
-- Photo_url выставляются из /brand/imagery/ по виду спорта — админ потом
-- меняет на реальные через /admin.

-- 1. ALINA — Bigsport · бег
update profiles set
  bio = E'тренер по бегу в Bigsport. готовлю к Chișinău Marathon и трейлам Кодр.',
  quote = E'бег — это разговор с самим собой. и вода — его язык.',
  story = E'## первый круг\n\nя начала бегать в 26, после третьей неудачной диеты. первые 2 километра по парку Valea Morilor показались марафоном — дыхание сбивалось, ноги дрожали, я останавливалась у каждого фонаря. но не сдалась.\n\n## первый старт\n\nчерез год — Maraton Internațional Chișinău, полумарафон. финишировала 2:14 и плакала на финише под фонтанами. в тот день я поняла: бег это не про дистанцию, бег это про честный разговор с телом. ты спрашиваешь — оно отвечает.\n\n## сейчас\n\nя тренирую 35 бегунов в Bigsport, от новичков до финишёров Berlin Marathon. мой метод: маленькие честные недели вместо героических месяцев. и вода — всегда вода — потому что тело на обезвоживании теряет любой разговор с собой.',
  achievements = to_jsonb(array[
    'Berlin Marathon 2024 — finisher 3:42',
    'Maraton Internațional Chișinău 2023 — top 8 women, half',
    'Codrii Trail 21K 2022 — bronze',
    'Coach of the Year — Bigsport 2023',
    'IAAF Coaching Level 2'
  ]),
  birthdate = '1992-04-12',
  photo_url = '/brand/imagery/runner-asphalt-line.jpg',
  socials = '{"instagram":"alina.runs.md","telegram":"alinaruns","tiktok":"alina.runs"}'::jsonb,
  club_id = (select id from clubs where slug = 'bigsport'),
  sport = 'бег',
  sort_order = 100
where promo_code = 'ALINA';

-- 2. MIHAI — Martz Fitness · кроссфит
update profiles set
  bio = E'главный тренер CrossFit Martz. десять лет штанг, бёрпи и честных WOD.',
  quote = E'сила — это просто постоянство в тяжёлой куртке.',
  story = E'## от футбола к боксу\n\nя играл полу-профессионально за «Зимбру» до 28, пока травма колена не закрыла дверь. кроссфит нашёл случайно — друг затащил на open WOD в Martz, я не выдержал даже разминку. в тот день я решил начать заново.\n\n## зал\n\nчерез два года я уже коучил. через пять — вёл свою программу Martz Performance. кроссфит дал мне то, что футбол не мог: спорт, который масштабируется под возраст, настроение и вчерашний сон.\n\n## философия\n\nя не верю в героев. я верю в атлетов, которые приходят в зал в плохие дни. между интервалами я пью OM — тело не поднимет вес, если не дышит, а оно не дышит без воды.',
  achievements = to_jsonb(array[
    'CrossFit Level 2 Trainer',
    'CrossFit Open 2024 — Quarterfinalist (East Europe)',
    'Eastern European Throwdown 2023 — top 20 Rx',
    'Coach since 2018 · 200+ athletes trained',
    'Boxing Federation certified — amateur level'
  ]),
  birthdate = '1988-09-03',
  photo_url = '/brand/imagery/runner-overhead.jpg',
  socials = '{"instagram":"mihai.crossfit","telegram":"mihailifts","youtube":"@mihaitrains"}'::jsonb,
  club_id = (select id from clubs where slug = 'martz-fitness'),
  sport = 'кроссфит',
  sort_order = 95
where promo_code = 'MIHAI';

-- 3. IRINA — Jiva Yoga · йога
update profiles set
  bio = E'преподаватель йоги в Jiva Yoga. хатха, виньяса и терпение, которое идёт с ними обеими.',
  quote = E'сильное тело — тихое. тихое тело — честное.',
  story = E'## первый коврик\n\nмама показала мне первое сурья намаскар в 14. я не относилась к этому всерьёз до университета — экзаменационный стресс, бессонница, паника перед сессией. в ту ночь я открыла книгу о пранаяме и больше её не закрыла.\n\n## Ришикеш\n\nв 2017 я провела шесть месяцев в Ришикеше у Свами Дживамукти. там я поняла, что йога — это не позы. позы — самая простая часть. йога — это оставаться с дискомфортом, пока он не превратится в информацию.\n\n## студия\n\nв Jiva я веду 5 классов в неделю — хатха утром, виньяса вечером. говорю своим студентам: если дыхание поверхностное, асана — это театр. пейте воду до практики — мягкие ткани слышат лучше.',
  achievements = to_jsonb(array[
    'RYT-500 certified · Sivananda Rishikesh',
    'Hatha & Vinyasa lead at Jiva Yoga since 2020',
    '8 years teaching · 1500+ classes delivered',
    'Pranayama specialist — Krishnamacharya tradition'
  ]),
  birthdate = '1990-07-20',
  photo_url = '/brand/imagery/yoga-rooftop.jpg',
  socials = '{"instagram":"irina.flows.md","telegram":"irinaflows"}'::jsonb,
  club_id = (select id from clubs where slug = 'jiva-yoga'),
  sport = 'йога',
  sort_order = 90
where promo_code = 'IRINA';

-- 4. VICTOR — Premier Fitness · силовой / пауэрлифтинг
update profiles set
  bio = E'тренер по пауэрлифтингу в Premier. сырая сила, классический метод.',
  quote = E'штанга говорит правду. она никогда не врёт и никогда не льстит.',
  story = E'## первая становая\n\nмне было 19. первая соревновательная тяга — 140 кг, и я думал, что я великан. сейчас смотрю на эту цифру и смеюсь. но тогда это была самая тяжёлая штанга, которую я когда-либо поднимал.\n\n## десять лет\n\nдесять лет я тренировался один. без тренера, без плана, только упрямство и YouTube. наделал всех ошибок — перетренированность, эго-тяги, пропущенные разминки. в 32 я сорвался, взял год паузы, вернулся с настоящим тренером и настоящим планом.\n\n## сейчас\n\nв Premier я тренирую сырых пауэрлифтеров. философия простая: малые веса, длинные циклы, идеальная техника. самые сильные атлеты, которых я знаю, — самые терпеливые.',
  achievements = to_jsonb(array[
    'IPF Open 2023 — silver, -93kg (Bucharest)',
    'Personal records: Squat 240kg · Bench 160kg · Deadlift 280kg',
    'Eastern European Powerlifting Federation member',
    'Coach since 2019 · 50+ competitive athletes',
    'IFBB Sports Nutrition certified'
  ]),
  birthdate = '1985-02-14',
  photo_url = '/brand/imagery/runner-forest.jpg',
  socials = '{"instagram":"victor.lifts.md","telegram":"vmoraru"}'::jsonb,
  club_id = (select id from clubs where slug = 'premier-fitness'),
  sport = 'силовой',
  sort_order = 85
where promo_code = 'VICTOR';

-- 5. OXANA — Alexia · пилатес
update profiles set
  bio = E'специалист по пилатесу-реформер в Alexia. ум, тело и сотня малых повторений.',
  quote = E'контроль до силы. точность до скорости. всегда.',
  story = E'## травма\n\nя была соревновательной пловчихой до 24, пока травма плеча не закончила сезон и почти карьеру. физиотерапевт отправил меня в пилатес-студию на реабилитацию. я пошла нехотя. осталась на десять лет.\n\n## метод\n\nпилатес не «починил» моё плечо — он научил использовать всё тело так, чтобы плечо не несло работу, которая не его. это и есть философия: каждое движение — это система, не часть.\n\n## студия\n\nв Alexia я веду малые реформер-группы, не больше 4 человек. между подходами пью воду — глубокие стабилизаторы не работают без гидратации. кто говорит, что пилатес «просто растяжка», — никогда не держал single-leg teaser десять дыханий.',
  achievements = to_jsonb(array[
    'Pilates Method Alliance (PMA) certified',
    'STOTT Pilates Reformer Level 2',
    'Reformer lead at Alexia · 6 years',
    'Former competitive swimmer — Moldova national team U23',
    'Pre/post-natal pilates qualification'
  ]),
  birthdate = '1993-11-05',
  photo_url = '/brand/imagery/golf-sunset.jpg',
  socials = '{"instagram":"oxana.pilates","telegram":"oxanalupu"}'::jsonb,
  club_id = (select id from clubs where slug = 'alexia'),
  sport = 'пилатес',
  sort_order = 80
where promo_code = 'OXANA';

-- 6. ANDREI — Aquaterra · триатлон
update profiles set
  bio = E'тренер по триатлону в Aquaterra. плавание-вело-бег, три спорта, одна одержимость.',
  quote = E'финишная линия — это запятая, никогда не точка.',
  story = E'## первый триатлон\n\nя сделал свой первый спринт-триатлон в 2014 — взял велосипед в аренду, без плана тренировок, финишировал в середине пелотона и стошнило на финише. зацепило. через три месяца записался на олимпийку.\n\n## Ironman\n\nв 2021 я финишировал первый полный Ironman в Цюрихе за 11:48. на беге, около 32 км, был так истощён, что галлюцинировал. та гонка научила меня всему, что я теперь преподаю: гидратация не опциональна, питание не обсуждаемо, бег выигрывается на велосипеде.\n\n## команда\n\nв Aquaterra я тренирую 15 триатлетов — от новичков до квалифицирующихся на Kona. наш девиз: «делай меньше, восстанавливайся больше». открытая вода — у нас бассейн и тренировки в Гидигиче летом.',
  achievements = to_jsonb(array[
    'IRONMAN Zurich 2021 — finisher 11:48',
    'IRONMAN 70.3 Bucharest 2024 — sub-5h',
    'Moldova Triathlon Federation certified coach',
    'Open Water Swim instructor — Lake Ghidighici program',
    'Eastern European Triathlon Camp lead 2022, 2023'
  ]),
  birthdate = '1986-06-18',
  photo_url = '/brand/imagery/water-bottle-pet.jpg',
  socials = '{"instagram":"andrei.tri.md","telegram":"andreitri","youtube":"@andreitriathlon"}'::jsonb,
  club_id = (select id from clubs where slug = 'aquaterra'),
  sport = 'триатлон',
  sort_order = 75
where promo_code = 'ANDREI';

-- 7. NATALIA — Bigsport · функциональный
update profiles set
  bio = E'lead по функциональным тренировкам в Bigsport. движения, которые ты будешь использовать всю жизнь.',
  quote = E'тренируй как живёшь. поднимай так, как будешь двигаться завтра.',
  story = E'## зал, потом улица\n\nя пришла в зал через классический бодибилдинг — split-схема, тренажёры, зеркала. десять лет красивая фигура и спина, которая болела каждый раз, когда я поднимала пакет из Linella. так я нашла функциональный тренинг.\n\n## заново\n\nв 30 я начала с нуля. училась приседать без штанги, носить, тянуть, бросать, лазить. фигура изменилась, но главное — тело перестало болеть в обычной жизни.\n\n## сейчас\n\nв Bigsport я веду функциональные группы для женщин 25-50. они приходят за фигурой — остаются, потому что их внуки больше не могут их свалить с ног.',
  achievements = to_jsonb(array[
    'NSCA-CFT certified',
    'Functional Movement Screen Level 2',
    'Pre/post-natal training certification',
    'TRX Group Suspension Training certified',
    '8 years coaching · 300+ clients'
  ]),
  birthdate = '1991-03-09',
  photo_url = '/brand/imagery/park-crowd.jpg',
  socials = '{"instagram":"natalia.moves","telegram":"nataliagincu"}'::jsonb,
  club_id = (select id from clubs where slug = 'bigsport'),
  sport = 'функциональный',
  sort_order = 70
where promo_code = 'NATALIA';

-- 8. DMITRII — Martz Fitness · бокс
update profiles set
  bio = E'тренер по боксу в Martz. бывший любитель-чемпион, нынешний учитель.',
  quote = E'удар — это просто баланс с намерением.',
  story = E'## зал в 12\n\nмой дядя держал боксёрский зал на Ботанике. два года я подметал полы, прежде чем он позволил ударить мешок. это научило меня главному уроку бокса: ты не зарабатываешь право быть агрессивным — ты зарабатываешь право быть спокойным.\n\n## любительский путь\n\nя боксировал до 26 — выиграл регион, проиграл национальные финалы дважды. до профи не дошёл. но каждый проигранный бой научил больше, чем любая победа.\n\n## сейчас\n\nв Martz я тренирую детей и взрослых. бокс — это не про насилие. это про дисциплину, замаскированную под спорт. и дисциплина начинается с очевидного: вода у ринга, каждый раунд.',
  achievements = to_jsonb(array[
    'Moldova Regional Amateur Champion 2014',
    'AIBA Level 1 certified coach',
    '30+ amateur fighters trained',
    'Boxing-conditioning specialist · Eastern Europe Camp 2022',
    'Sparring & cornerman experience · 50+ amateur bouts'
  ]),
  birthdate = '1989-08-25',
  photo_url = '/brand/imagery/stadium-seats.jpg',
  socials = '{"instagram":"dmitrii.boxing","telegram":"dmitriibx"}'::jsonb,
  club_id = (select id from clubs where slug = 'martz-fitness'),
  sport = 'бокс',
  sort_order = 65
where promo_code = 'DMITRII';

-- 9. ELENA — Jiva Yoga · йога (yin / restorative)
update profiles set
  bio = E'преподаватель йоги в Jiva. yin, restorative и медленная честная практика.',
  quote = E'поза, которую ты держишь десять дыханий, — та, что меняет тебя.',
  story = E'## выгорание\n\nя была корпоративным юристом до 31. 70-часовые недели в офисе на Штефана, тревожные приступы по утрам, сон, который перестал работать. я уволилась во вторник и записалась на 200-часовой курс инструктора йоги в пятницу.\n\n## yin\n\nменя потянуло к yin и restorative — медленные практики, длинные удержания. они были противоположностью моей прежней жизни: нечего доказывать, нет таймера, нет победителей. там я начала восстанавливаться.\n\n## обучение\n\nв Jiva я веду 4 yin-класса в неделю. мои студенты — уставшие профессионалы. я знаю их усталость, потому что она была моей. пейте воду до и после, не разговаривайте во время класса. тишина — это практика.',
  achievements = to_jsonb(array[
    'Yin Yoga 100h · Yoga Alliance',
    'Restorative Yoga certified · Judith Hanson Lasater method',
    'Yoga Nidra specialist',
    'Trauma-informed teaching · ongoing study',
    'Former corporate lawyer · 7 years before yoga'
  ]),
  birthdate = '1987-12-02',
  photo_url = '/brand/imagery/yoga-rooftop.jpg',
  socials = '{"instagram":"elena.yin.md","telegram":"elenaturcan"}'::jsonb,
  club_id = (select id from clubs where slug = 'jiva-yoga'),
  sport = 'йога',
  sort_order = 60
where promo_code = 'ELENA';

-- 10. SERGEI — Pilates Club · пилатес (бывший танцор)
update profiles set
  bio = E'преподаватель пилатеса в Pilates Club. бывший танцор современного танца.',
  quote = E'каждое тело — это вопрос. пилатес — это как слушать ответ.',
  story = E'## сцена\n\nя был танцовщиком современного танца до 28 — труппа Бухарестского оперного, выступления в Кишинёве, Бухаресте, Праге. танец дал мне всё: дисциплину, осознанность тела, чувство времени. он же дал хроническую боль в бедре и грыжу диска к 30.\n\n## студия\n\nпилатес был сначала реабилитацией, потом профессией. я закончил comprehensive-программу STOTT в 2019, открыл свою студию в 2021. танцую до сих пор, но только для себя.\n\n## ученики\n\nмои клиенты — от 18-летних гимнасток до 75-летних пенсионеров. через несколько месяцев все говорят одно: «я не знал, что моё тело так умеет». в этом радость пилатеса — ты становишься переводчиком между человеком и его телом.',
  achievements = to_jsonb(array[
    'STOTT Pilates Comprehensive · 600h',
    'Former contemporary dancer · Opera București 2014-2018',
    'Mat & Reformer Pilates certified',
    'Studio owner since 2021',
    'Post-rehab Pilates specialist'
  ]),
  birthdate = '1990-05-17',
  photo_url = '/brand/imagery/runner-overhead.jpg',
  socials = '{"instagram":"sergei.pilates","telegram":"sergeivrabie"}'::jsonb,
  club_id = (select id from clubs where slug = 'pilates-club'),
  sport = 'пилатес',
  sort_order = 55,
  is_active = true
where promo_code = 'SERGEI';
