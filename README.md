# Амбассадоры ОМ — MVP

Landing + ЛК тренера + админка для программы лояльности OM (питьевая вода, Молдова).

**Стек:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (Auth + Postgres + Storage) + Vercel.

**Дедлайн проекта:** 31.05.2026. Цель MVP — показать работающий прототип клиенту ~10–15 мая.

---

## Быстрый старт (локально)

```bash
# 1. зависимости
npm install

# 2. переменные окружения
cp .env.local.example .env.local
# заполни NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
# (опционально) добавь SUPABASE_SERVICE_ROLE_KEY для сида демо-юзеров

# 3. dev
npm run dev
# открой http://localhost:3000
```

---

## Настройка Supabase (первый раз)

1. Создай проект на [supabase.com](https://supabase.com) (free tier). Регион: Frankfurt (ближе к MD).
2. Settings → API → скопируй `Project URL` и `anon public` в `.env.local`.
3. SQL Editor → вставь и запусти `supabase/schema.sql` (таблицы, RLS, бакет для фото, триггер начисления баллов).
4. SQL Editor → `supabase/migrations/002_v2.sql` (v2: типизированные челленджи, шоп, опросы).
5. SQL Editor → `supabase/seed.sql` + `supabase/seed_v2.sql` (челленджи и товары).
5. Для демо-юзеров: Settings → API → скопируй `service_role` (секретный!) в `.env.local` как `SUPABASE_SERVICE_ROLE_KEY`, затем:
   ```bash
   node scripts/seed-users.mjs
   ```
   Создаст админа и 10 тренеров с тестовыми баллами.
6. Authentication → URL Configuration → добавь прод-URL (после первого деплоя).

---

## Деплой на Vercel

1. Пушни репо в GitHub (`git init && git add -A && git commit && git remote add origin ... && git push`).
2. [vercel.com/new](https://vercel.com/new) → Import репо.
3. Environment Variables → добавь `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.
5. В Supabase → Authentication → URL Configuration → добавь прод-URL в `Site URL` и `Redirect URLs`.

---

## Структура

```
src/
├── app/
│   ├── page.tsx                 # публичный лендинг
│   ├── leaderboard/             # расширенный лидерборд
│   ├── login/                   # вход
│   ├── auth/signout/            # route-handler для logout
│   ├── dashboard/               # ЛК тренера (middleware-защищён)
│   │   ├── page.tsx             #   дашборд: баллы, место, промокод
│   │   ├── challenges/          #   список + отправка подтверждений
│   │   ├── history/             #   история транзакций
│   │   └── profile/             #   редактирование профиля
│   └── admin/                   # админка OM (role=admin)
│       ├── page.tsx             #   список тренеров
│       ├── challenges/          #   управление челленджами
│       ├── moderation/          #   очередь подтверждений
│       └── points/              #   ручные начисления
├── components/                  # Avatar, SiteHeader, SiteFooter
├── lib/
│   ├── supabase/                # клиенты (server/client/middleware)
│   ├── types.ts                 # типы БД
│   └── utils.ts                 # initials, avatarColor, formatDate
└── middleware.ts                # защита /dashboard и /admin
supabase/
├── schema.sql                   # таблицы, RLS, триггеры, storage
└── seed.sql                     # стартовые челленджи
scripts/
└── seed-users.mjs               # создание демо-пользователей
```

---

## Демо-аккаунты (после seed-users)

| Роль | Email | Пароль |
|---|---|---|
| Админ OM | `admin@demo.om` | `demo-admin-2026` |
| Тренер | `alina@demo.om` | `demo-trainer-2026` |
| … ещё 9 тренеров | `<имя>@demo.om` | `demo-trainer-2026` |

---

## Как работает основной флоу

1. Админ OM создаёт тренера в Supabase Auth, потом в админке заполняет профиль (клуб, промокод).
2. Тренер логинится → видит дашборд с баллами, промокодом, местом в лидерборде.
3. Тренер открывает `/dashboard/challenges` → выбирает челлендж → загружает фото/ссылку.
4. Запись создаётся в `submissions` со статусом `pending`.
5. Админ открывает `/admin/moderation` → видит очередь → одобряет или отклоняет.
6. Триггер БД `award_points_on_approval` автоматически создаёт запись в `point_transactions` на `challenge.points` баллов.
7. Лидерборд (view) обновляется мгновенно → все видят новое место тренера.

---

## Roadmap v2

- Локализация RO.
- Публичные профили тренеров с соцсетями.
- Email-уведомления (Supabase Edge Functions + Resend).
- Интеграция с кассами залов / онлайн-доставкой OM.
- Система «печатей» как альтернатива промокодам.
