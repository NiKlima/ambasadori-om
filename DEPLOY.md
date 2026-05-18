# Deploy guide — ambasadori-om → omactiv.md (Vercel)

Шаги для запуска MVP на проде. Всё проходится один раз; дальше Vercel
автодеплоит из git каждый push в `main`.

---

## 0. Перед стартом

- Аккаунт GitHub с правами push на `NiKlima/ambasadori-om`
- Доступ к панели регистратора `omactiv.md` (DNS-правки)
- Доступ к Supabase Dashboard проекта `ssnegtjbctywjjvjuwjo`
- Локально пройден `npm run build` (exit 0) и `npm run smoke` (всё ✓)

```bash
cd "/Users/etoklima/Cloude Code /ambasadori-om"
npm run build
npm run smoke
git status   # должно быть чисто
git push origin main
```

---

## 1. Vercel: импорт проекта

1. Открой <https://vercel.com> → **Sign up** → **Continue with GitHub**
2. **Authorize Vercel** к организации
3. **Add New → Project** → выбрать `NiKlima/ambasadori-om` → **Import**
4. Framework Preset = **Next.js** (определится автоматом)
5. Root Directory: оставить `./`
6. Build/Output/Install settings: **defaults** (из `package.json`)
7. **Environment Variables** — раздел ниже ↓
8. Кнопка **Deploy** → подождать ~3-5 мин → получишь URL
   `https://ambasadori-om.vercel.app`

---

## 2. Environment Variables

Vercel Project → Settings → **Environment Variables**. Значения берутся
из локального `.env.local`.

| Key | Environments | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production only** ⚠️ | `.env.local` |
| `OPENAI_API_KEY` | **Production only** (optional) | `.env.local` |

⚠️ **`SUPABASE_SERVICE_ROLE_KEY` НЕ давать Preview-окружениям** —
preview-деплои публично доступны (любой кто увидит preview-URL получит
полные права к БД).

После добавления переменных нажми **Redeploy** на последний deploy
(иначе env переменные не подхватятся).

---

## 3. Custom domain: omactiv.md

### 3.1 На Vercel

Project → Settings → **Domains** → Add:
- `omactiv.md` (apex)
- `www.omactiv.md`

Vercel покажет DNS-инструкцию — какие записи прописать.

### 3.2 В личном кабинете регистратора (Nic.MD / etc.)

Прописать:

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com.` | 3600 |

(точные значения Vercel покажет на странице Domains)

### 3.3 SSL

Vercel сам выпустит сертификат Let's Encrypt после пропагации DNS
(~5–30 минут). Проверка:

```bash
dig omactiv.md +short    # должен показать 76.76.21.21
curl -I https://omactiv.md   # 200 OK с https
```

---

## 4. Supabase: разрешить omactiv.md в Auth

Supabase Dashboard → проект → **Authentication** → **URL Configuration**:

- **Site URL:** `https://omactiv.md`
- **Redirect URLs** (добавить, не удаляя локальные):
  - `https://omactiv.md`
  - `https://omactiv.md/auth/callback`
  - `https://*.vercel.app`
  - `http://localhost:3000` (оставить для dev)

Без этого Supabase отклонит OAuth/magic-link редиректы и логин может не
работать в проде.

---

## 5. Финальный smoke на проде

```bash
SMOKE_HOST=https://omactiv.md npm run smoke
```

Должно показать `✓ всех проверок passed`. После — ручная проверка:

1. <https://omactiv.md/> → лендинг рендерится, hero photo на месте
2. <https://omactiv.md/login> → ввод `admin@demo.om` / `demo-admin-2026`
   → редирект на `/admin`
3. `/admin/events` → создать тестовый event как админ → автоматически
   approved → виден на <https://omactiv.md/events>
4. Logout → <https://omactiv.md/events> → клик на event → `/events/<id>`
   → `register` → форма → submit → thanks
5. Logout → <https://omactiv.md/clubs>, `/trainers`, `/leaderboard`,
   `/challenges` — все живые

---

## 6. Дальнейшие push'и

Любой `git push origin main` теперь автоматически деплоится:
- Preview build на каждый PR
- Production deploy на push в `main`

Логи и errors — Vercel Project → **Deployments** → выбрать → **Logs**.

---

## 7. Что мониторить в продакшене

- **Supabase Dashboard → Database → Tables** → `event_registrations` —
  кол-во заявок
- **Supabase → Auth → Users** — кол-во активных тренеров
- **Vercel → Analytics** (Free tier 2.5K events/мес) — посещаемость
- **Vercel → Functions logs** — ошибки server actions

---

## 8. Откатить деплой

Vercel → Deployments → найти предыдущий successful → **Promote to
Production**. Откат до 30 сек.

---

## 9. Что НЕ закрыто в этой версии

- **Email-уведомления** (registration → trainer email): нужен Resend +
  ENV `RESEND_API_KEY`. Отложено.
- **GA4 / Plausible** аналитика: добавится после фидбека стейкхолдеров.
- **PWA / offline mode**: не в скоупе MVP.
- **Платная регистрация / Stripe**: не нужно для MVP.
- **i18n (RO/RU)**: текст пока на английском, локализация — отдельный
  пакет.

---

## 10. Контакты на случай проблем

- Vercel build падает → Logs на Deployments, в 90% это env vars
- DNS не пропагнулся → подожди час, проверь `dig +short omactiv.md`
- Supabase 401/403 → проверь Site URL и Redirect URLs в Auth
- Server action error → Vercel Functions logs (фильтр по `/api`)
