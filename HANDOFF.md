# HANDOFF — текущее состояние проекта

Документ для **новой Claude Code сессии в VS Code**. Прочти и
работай оттуда. Всё что ниже — фиксация состояния на конец v7
(коммит `28c1d14`).

---

## Что это за проект

**Ambasadori OM** — Next.js 16 + Supabase MVP. Программа лояльности
бренда OM (питьевая вода, Молдова) для фитнес-тренеров. Тренеры
выполняют челленджи → копят баллы → меняют на призы.

**Дедлайн:** показать стейкхолдерам ASAP на домене `omactiv.md`.

**Стек:**
- Next.js 16.2.4 App Router + Turbopack
- React 19, TypeScript 5
- Tailwind v4
- Supabase (Postgres + Auth + Storage + RLS)
- TT Firs Neue self-host
- Deploy: Vercel (Frankfurt region)

---

## Где что лежит

```
ambasadori-om/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (public)         # / · /login · /events · /clubs · /trainers · /challenges · /leaderboard · /contacts · /privacy · /survey · /trainers/[id]
│   │   ├── dashboard/       # ЛК тренера (защищено middleware)
│   │   └── admin/           # админка (role=admin only)
│   ├── components/          # SiteHeader/Footer, DashboardSubnav, AdminTopBar,
│   │                        # EventForm, RegistrationForm, ChallengesGrid, ShopGrid,
│   │                        # LeaderboardClient, TrainerProfileBody, и т.д.
│   ├── lib/
│   │   ├── supabase/        # server/client/admin (service_role)
│   │   ├── types.ts         # все TypeScript types (Event, Challenge, Profile, ...)
│   │   ├── upload.ts        # generic Supabase Storage uploader
│   │   ├── utils.ts         # formatDate, ageFromBirthdate, pluralRu, socialUrl
│   │   └── fallback-events.ts  # static FALLBACK events when DB empty
│   ├── middleware.ts        # Supabase Auth refresh + protect /admin /dashboard
│   └── app/globals.css      # tokens, primitives (.btn, .chip, .input, .av, .kpi, .lb-row)
├── supabase/
│   ├── schema.sql           # начальная схема v1
│   └── migrations/          # 002 v2, 003 trainer_public, 004 features, 005 cms, 006 trainer_seed, 008 events_workflow
├── scripts/
│   ├── seed-users.mjs       # node scripts/seed-users.mjs — создаёт admin + 10 demo trainers
│   ├── smoke.mjs            # npm run smoke — full e2e check (30 проверок)
│   └── scan-mojibake.mjs    # node scripts/scan-mojibake.mjs — диагностика битой кодировки
├── public/
│   ├── brand/imagery/       # 18 brand-фото (runner, yoga, golf, etc)
│   ├── brand/logo/          # om-logo-black/blue/white.png
│   └── fonts/               # TT Firs Neue self-host (16 weights × italics)
├── next.config.ts           # serverActions.allowedOrigins + Supabase image domain
├── vercel.json              # framework=nextjs, regions=fra1
├── DEPLOY.md                # пошаговая инструкция деплоя на omactiv.md
├── README.md                # quick start
├── CLAUDE.md / AGENTS.md    # инструкция для Claude Code (Next.js 16 warning)
└── HANDOFF.md               # этот файл
```

---

## Текущее состояние (v7)

**Все 37 routes билдятся:**
- Public: `/`, `/login`, `/leaderboard`, `/clubs`, `/events`,
  `/events/[id]`, `/events/[id]/register`, `/events/[id]/register/thanks`,
  `/contacts`, `/contacts/thanks`, `/privacy`, `/survey/[id]`,
  `/survey/thanks`, `/trainers`, `/trainers/[id]`, `/challenges`
- Dashboard (trainer): `/dashboard`, `/dashboard/{challenges,events,events/new,events/[id],shop,orders,history,profile,surveys}`
- Admin: `/admin`, `/admin/{clubs,moderation,challenges,products,events,events/[id]/registrations,orders,messages,surveys,points}`
- API: `/api/verify-submission`, `/auth/signout`

**`npm run smoke`** проходит 30/30 проверок (HTTP probe + DB sanity +
live events workflow + mojibake scan).

**DB:** Supabase project `ssnegtjbctywjjvjuwjo` (URL в `.env.local`).
- 8 партнёрских клубов
- 10 demo-тренеров (Alina, Mihai, Irina, Victor, Oxana, Andrei, Natalia,
  Dmitrii, Elena, Sergei) с bio/quote/story/achievements/photos из
  `/brand/imagery/`
- 1 admin (`admin@demo.om` / `demo-admin-2026`)
- 13 challenges
- 13 products (6 featured для landing prizes)
- Тренеры: пароль у всех `demo-trainer-2026`
- 0 events (FALLBACK подставляется автоматически)

---

## Что осталось сделать (TODO)

1. **`git push origin main`** — пользовательский шаг (политика блокирует
   мой direct push в main).
2. **Vercel deploy** — следовать `DEPLOY.md` (Vercel signup → import →
   env vars → DNS на omactiv.md → Supabase Auth URL config).
3. **Реальные фото тренеров** — сейчас брендовые stock-фото из
   `/brand/imagery/`. Заменять через `/admin` → клик на тренера → photo
   upload (через `service_role`, bypass'ит RLS).
4. **Реальные events в БД** — пока показываются FALLBACK. Создать пару
   как admin через `/admin/events` → status=approved автоматически.
5. **Email-уведомления** (Resend) — отложено.
6. **i18n RO/RU** — отложено.
7. **AI-генерация фото тренеров** — отвергнуто пользователем.

---

## Демо-доступы

```
АДМИН:
  Email:    admin@demo.om
  Password: demo-admin-2026
  → /admin

ТРЕНЕРЫ (10 шт, пароль у всех одинаковый):
  alina@demo.om      Алина Руссу         Bigsport · бег
  mihai@demo.om      Михаил Чобану       Martz Fitness · кроссфит
  irina@demo.om      Ирина Балан         Jiva Yoga · йога
  victor@demo.om     Виктор Морару       Premier Fitness · силовой
  oxana@demo.om      Оксана Лупу         Alexia · пилатес
  andrei@demo.om     Андрей Попеску      Aquaterra · триатлон
  natalia@demo.om    Наталья Гынку       Bigsport · функциональный
  dmitrii@demo.om    Дмитрий Унгуряну    Martz Fitness · бокс
  elena@demo.om      Елена Цуркан        Jiva Yoga · йога
  sergei@demo.om     Сергей Врабие       Pilates Club · пилатес
  password: demo-trainer-2026
  → /dashboard
```

---

## Полезные команды

```bash
# зависимости
npm install

# dev (порт 3000)
npm run dev

# production build
npm run build && npm start

# полный smoke (требует dev-сервер на :3000)
npm run smoke

# создать/обновить юзеров в Supabase Auth (нужен SUPABASE_SERVICE_ROLE_KEY)
npm run seed   # = node scripts/seed-users.mjs

# проверить mojibake в БД
node scripts/scan-mojibake.mjs

# smoke против прода
SMOKE_HOST=https://omactiv.md npm run smoke
```

---

## Известные грабли

1. **Mojibake при копи-пасте миграций.** SQL-миграции с кириллицей
   могут поломаться при clipboard→Supabase SQL Editor (двойная UTF-8
   кодировка). **Решение:** для кириллицы используй **прямой REST**
   через `supabase-js` в node-script (см. `scripts/seed-users.mjs` как
   пример). SQL-файлы держи ASCII-only (комментарии на English).
2. **Vercel free tier**: 100 GB bandwidth, 1M edge requests. Для MVP
   хватит.
3. **TT Firs Neue лицензия** — handoff design предупреждал «confirm
   licence covers production domain». Юридически серая зона на продакшене
   до подтверждения от клиента. Fallback (Inter) можно включить.
4. **Папка проекта с пробелом** в пути: `/Users/etoklima/Cloude Code /ambasadori-om/`
   (с пробелом перед `/ambasadori-om`). Это иногда ломает скрипты —
   всегда оборачивай путь в кавычки.
5. **Next.js 16 + React 19** новые. Особые правила:
   - Server actions не принимают `encType="multipart/form-data"` — multi-part
     детектится автоматически по File input.
   - Вложенные `<form>` запрещены.
   - Динамические params: `params: Promise<{ id: string }>` — нужно
     `await params`.

---

## Архитектурные решения

- **Auth:** Supabase Auth (`@supabase/ssr` middleware refresh).
  `middleware.ts` защищает `/admin/*` и `/dashboard/*`.
- **RLS:** Row Level Security в Postgres. Public read через anon key,
  admin actions через `createAdminClient()` с `service_role_key`.
- **File uploads:** Supabase Storage buckets `avatars` (трейнерские
  photo + gallery) и `covers` (challenge/event/product/club covers).
  Generic helper в `src/lib/upload.ts`.
- **Server actions:** все mutations через `"use server"` функции,
  не через API routes.
- **i18n:** не использую `next-intl` — текст hardcoded на английском в
  brand-voice (lowercase для hero, eyebrow caps).

---

## Где брать дизайн / brand assets

- Hi-fi design handoff: `/tmp/om-design/` или `/tmp/om-design-v2/` —
  artboards JSX, CSS-tokens, brand fonts/logo/imagery.
- В проекте уже скопированы:
  - `public/fonts/` — TT Firs Neue
  - `public/brand/logo/` — 3 варианта лого (black/blue/white)
  - `public/brand/imagery/` — 18 stock-фото
- `src/app/globals.css` — все brand tokens (`--om-blue`, `--om-ink-900`,
  и т.д.) + primitive classes.

---

## История версий

- **v1-v3:** базовый stack + storytelling features (V3 завершён)
- **v4:** полный порт hi-fi редизайна от Claude Design (брендбук OM)
- **v5:** admin CMS, sort_order на сущностях, новая `clubs` table
- **v5.1:** реальные истории молдавских тренеров, podium fix, header
  active state, /clubs страница, фикс mojibake
- **v6:** events workflow (trainer→admin→public + registration)
- **v7:** events 404 fix, /challenges + /trainers публичные страницы,
  Vercel deploy prep, smoke check
