import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrainersGrid } from "@/components/TrainersGrid";
import { LeaderboardList } from "@/components/LeaderboardList";
import { PrizesShowcase } from "@/components/PrizesShowcase";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, LeaderboardRow } from "@/lib/types";

const FALLBACK_CHALLENGES: Partial<Challenge>[] = [
  { title: "Фото с OM на тренировке", description: "Сфотографируй OM на тренировке и выложи в stories с тегом @om", points: 5 },
  { title: "Подопечный купил OM по промокоду", description: "Каждая покупка OM по твоему промокоду — это твои баллы", points: 10 },
  { title: "Публикация в stories", description: "Пост или stories с OM и отметкой бренда", points: 3 },
  { title: "Регистрация на активность OM", description: "Твой ученик зарегистрировался на забег или фестиваль ОМ", points: 10 },
];

const STORYTELLING_DEFAULTS = { quote: null, story: null, intro_video_url: null, gallery: [] as string[] };
const FALLBACK_LEADERBOARD: LeaderboardRow[] = ([
  {
    id: "1", full_name: "Алина Руссу", club: "Bigsport", sport: "Бег",
    photo_url: null, total_points: 145, birthdate: "1992-04-12",
    bio: "Беговой тренер и амбассадор активного образа жизни. Готовлю к 10К, полу- и марафонам.",
    socials: { instagram: "alina.runs", telegram: "alinaruns" },
    achievements: ["Финишер Berlin Marathon 2024", "Тренер года Bigsport 2023", "Сертификат IAAF Coaching Level 2"],
  },
  {
    id: "2", full_name: "Михаил Чобану", club: "Martz Fitness", sport: "Кроссфит",
    photo_url: null, total_points: 128, birthdate: "1988-09-03",
    bio: "10 лет в кроссфите. Работаю с любителями и подготовкой к Open.",
    socials: { instagram: "mihai.crossfit" }, achievements: ["CrossFit Level 2 Trainer", "Top-100 CrossFit Open Europe 2022"],
  },
  {
    id: "3", full_name: "Ирина Балан", club: "Jiva Yoga", sport: "Йога",
    photo_url: null, total_points: 110, birthdate: "1990-07-20",
    bio: "Хатха и виньяса. Веду групповые и индивидуальные классы.",
    socials: { instagram: "irina.yoga", tiktok: "irina.yoga" },
    achievements: ["RYT-500 Yoga Alliance", "10 лет практики"],
  },
  {
    id: "4", full_name: "Виктор Морару", club: "Premier Fitness", sport: "Силовой",
    photo_url: null, total_points: 92, birthdate: "1985-02-14",
    bio: "Пауэрлифтинг, гипертрофия, реабилитация после травм.",
    socials: { instagram: "viktor.lift" }, achievements: ["КМС по пауэрлифтингу", "12 лет тренерского стажа"],
  },
  {
    id: "5", full_name: "Оксана Лупу", club: "Alexia", sport: "Пилатес",
    photo_url: null, total_points: 84, birthdate: "1993-11-05",
    bio: "Пилатес-реформер, работа с осанкой и беременными.",
    socials: { instagram: "oxana.pilates" }, achievements: ["Polestar Pilates Comprehensive"],
  },
  {
    id: "6", full_name: "Андрей Попеску", club: "Aquaterra", sport: "Триатлон",
    photo_url: null, total_points: 71, birthdate: "1986-06-18",
    bio: "Триатлон, плавание, велоподготовка.",
    socials: { instagram: "andrei.tri" }, achievements: ["Финишер IRONMAN 70.3", "Тренер плавания FINA Level 1"],
  },
  {
    id: "7", full_name: "Наталья Гынку", club: "Bigsport", sport: "Функциональный",
    photo_url: null, total_points: 60, birthdate: "1991-03-09",
    bio: "Функциональные тренировки и работа с собственным весом.",
    socials: {}, achievements: [],
  },
  {
    id: "8", full_name: "Дмитрий Унгуряну", club: "Martz Fitness", sport: "Бокс",
    photo_url: null, total_points: 48, birthdate: "1989-08-25",
    bio: "Бокс и боевая подготовка для любителей.",
    socials: { instagram: "dim.box" }, achievements: ["МС по боксу"],
  },
  {
    id: "9", full_name: "Елена Цуркан", club: "Jiva Yoga", sport: "Йога",
    photo_url: null, total_points: 35, birthdate: "1995-12-30",
    bio: "Йога-нидра и медитация.", socials: {}, achievements: [],
  },
  {
    id: "10", full_name: "Сергей Врабие", club: "Pilates Club", sport: "Пилатес",
    photo_url: null, total_points: 22, birthdate: "1994-01-15",
    bio: "Мужской пилатес и работа с поясницей.", socials: {}, achievements: [],
  },
] as Omit<LeaderboardRow, keyof typeof STORYTELLING_DEFAULTS>[]).map((r) => ({ ...r, ...STORYTELLING_DEFAULTS }));

async function getData() {
  try {
    const supabase = await createClient();
    const [challengesRes, leaderboardRes] = await Promise.all([
      supabase.from("challenges").select("*").eq("active", true).order("points", { ascending: false }).limit(4),
      supabase.from("leaderboard").select("*").limit(10),
    ]);
    return {
      challenges: (challengesRes.data as Challenge[] | null) ?? null,
      leaderboard: (leaderboardRes.data as LeaderboardRow[] | null) ?? null,
    };
  } catch {
    return { challenges: null, leaderboard: null };
  }
}

type SportStat = { sport: string; count: number; points: number };
type ClubStat = { club: string; count: number; points: number; sports: string[] };

function buildBreakdowns(rows: LeaderboardRow[]) {
  const sportMap = new Map<string, SportStat>();
  const clubMap = new Map<string, ClubStat>();

  for (const r of rows) {
    if (r.sport) {
      const s = sportMap.get(r.sport) ?? { sport: r.sport, count: 0, points: 0 };
      s.count += 1;
      s.points += r.total_points;
      sportMap.set(r.sport, s);
    }
    if (r.club) {
      const c = clubMap.get(r.club) ?? { club: r.club, count: 0, points: 0, sports: [] };
      c.count += 1;
      c.points += r.total_points;
      if (r.sport && !c.sports.includes(r.sport)) c.sports.push(r.sport);
      clubMap.set(r.club, c);
    }
  }

  const sports = Array.from(sportMap.values()).sort((a, b) => b.points - a.points);
  const clubs = Array.from(clubMap.values()).sort((a, b) => b.points - a.points);
  return { sports, clubs };
}

export default async function Home() {
  const { challenges, leaderboard } = await getData();
  const chs = challenges && challenges.length > 0 ? challenges : (FALLBACK_CHALLENGES as Challenge[]);
  const lb = leaderboard && leaderboard.length > 0 ? leaderboard : FALLBACK_LEADERBOARD;
  const { sports, clubs } = buildBreakdowns(lb);
  const trainers = lb.slice(0, 12);

  return (
    <>
      <SiteHeader />

      <section className="container-xl pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-6">
            Лига амбассадоров · 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Ты тренируешь людей.<br />
            <span className="text-om-blue-dark">А мы тренируем тебя.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-om-muted max-w-xl">
            Программа поддержки тренеров от OM — это экосистема, в которой твой труд наставника превращается в реальные призы: экипировку, курсы, девайсы и участие в событиях.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="rounded-full bg-om-ink text-om-cream px-8 py-4 text-center font-medium hover:bg-om-blue-dark transition"
            >
              Стать амбассадором
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border border-om-ink/20 px-8 py-4 text-center font-medium hover:border-om-ink transition"
            >
              Смотреть лидерборд
            </Link>
          </div>
        </div>
      </section>

      <section id="how" className="bg-om-blue-soft py-20 md:py-28">
        <div className="container-xl">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Как это работает
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              Четыре шага от первого челленджа до награды.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Вступаешь", d: "Получаешь доступ к личному кабинету и свой промокод." },
              { n: "02", t: "Выполняешь", d: "Делаешь челленджи — снимаешь сторис, вовлекаешь команду." },
              { n: "03", t: "Копишь баллы", d: "Каждая активность приносит баллы. Всё прозрачно в кабинете." },
              { n: "04", t: "Забираешь приз", d: "Гаджеты, экипировка, курсы, слоты на события OM." },
            ].map((step) => (
              <div key={step.n} className="bg-white rounded-3xl p-8">
                <div className="text-om-muted font-mono text-sm mb-6">{step.n}</div>
                <div className="text-xl font-semibold mb-2">{step.t}</div>
                <div className="text-om-muted text-sm leading-relaxed">{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="challenges" className="py-20 md:py-28">
        <div className="container-xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
                Челленджи
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold max-w-xl">
                Простые активности, реальные баллы.
              </h2>
            </div>
            <p className="text-om-muted max-w-md">
              Челленджи обновляются каждый месяц. Баллы видны в кабинете сразу после одобрения.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {chs.slice(0, 4).map((ch, i) => (
              <div
                key={ch.id ?? i}
                className="rounded-3xl bg-white border border-black/5 p-8 flex items-start justify-between gap-6"
              >
                <div>
                  <div className="text-xl font-semibold mb-2">{ch.title}</div>
                  <div className="text-om-muted text-sm leading-relaxed">{ch.description}</div>
                </div>
                <div className="shrink-0 rounded-full bg-om-blue-soft text-om-blue-dark font-semibold px-4 py-2 text-sm">
                  +{ch.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="clubs" className="py-20 md:py-28">
        <div className="container-xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
                Спортивные клубы
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold max-w-xl">
                Залы и студии партнёров OM.
              </h2>
            </div>
            <p className="text-om-muted max-w-md">
              Площадки, где работают амбассадоры программы. Найди свой клуб — попроси у тренера промокод.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clubs.map((c) => (
              <div key={c.club} className="rounded-3xl bg-white border border-black/5 p-6">
                <div className="text-xs uppercase tracking-wider text-om-muted">Клуб</div>
                <div className="text-xl font-semibold mt-1">{c.club}</div>
                <div className="text-om-muted text-sm mt-3">
                  {c.count} {c.count === 1 ? "тренер" : "тренеров"}
                </div>
                {c.sports.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {c.sports.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {clubs.length === 0 && (
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 rounded-3xl bg-white p-8 text-om-muted">
                Скоро здесь появятся клубы партнёров.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="sports" className="bg-om-blue-soft py-20 md:py-28">
        <div className="container-xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
                Виды спорта
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold max-w-xl">
                От бега до йоги — у каждого направления свой амбассадор.
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="text-om-blue-dark font-medium hover:text-om-ink"
            >
              Лидерборд по видам →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sports.map((s) => (
              <Link
                key={s.sport}
                href={`/leaderboard?sport=${encodeURIComponent(s.sport)}`}
                className="group rounded-3xl bg-white p-6 hover:bg-om-ink hover:text-om-cream transition"
              >
                <div className="text-xs uppercase tracking-wider text-om-muted group-hover:text-om-cream/60">
                  Направление
                </div>
                <div className="text-2xl font-semibold mt-1">{s.sport}</div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold tabular-nums">{s.count}</div>
                    <div className="text-xs text-om-muted group-hover:text-om-cream/60">тренеров</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold tabular-nums">{s.points}</div>
                    <div className="text-xs text-om-muted group-hover:text-om-cream/60">баллов</div>
                  </div>
                </div>
              </Link>
            ))}
            {sports.length === 0 && (
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 rounded-3xl bg-white p-8 text-om-muted">
                Скоро здесь появятся виды спорта.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="trainers" className="py-20 md:py-28">
        <div className="container-xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
                Амбассадоры
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold max-w-xl">
                Тренеры программы OM.
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="text-om-blue-dark font-medium hover:text-om-ink"
            >
              Полный список →
            </Link>
          </div>
          <TrainersGrid trainers={trainers} />
        </div>
      </section>

      <section className="bg-om-sand/60 py-20 md:py-28">
        <div className="container-xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
                Лидерборд
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold">
                Топ-10 амбассадоров сезона.
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="text-om-blue-dark font-medium hover:text-om-ink"
            >
              Вся таблица →
            </Link>
          </div>
          <LeaderboardList rows={lb.slice(0, 10)} variant="compact" />
        </div>
      </section>

      <PrizesShowcase />

      <section id="faq" className="py-20 md:py-28">
        <div className="container-xl max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
            FAQ
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold mb-12">Часто спрашивают.</h2>
          <div className="space-y-3">
            {[
              { q: "Кто может стать амбассадором?", a: "Программа закрытая. Участников отбирает команда OM по активности, вовлечённости аудитории и совпадению с ценностями бренда — движение, забота о себе, честность." },
              { q: "Как я получаю баллы?", a: "За челленджи, за регистрации твоих подопечных на активности OM, за покупки OM по твоему промокоду. Всё видно в личном кабинете." },
              { q: "На что меняются баллы?", a: "Спортивная экипировка, гаджеты (часы, пульсометры), курсы повышения квалификации, слоты на события OM, медийная поддержка — фото- и видеосъёмка." },
              { q: "Когда обновляется лидерборд?", a: "Мгновенно — как только админ OM одобряет твою заявку по челленджу или регистрации. Никаких недельных задержек." },
              { q: "Это соревнование?", a: "Это твой путь. Лидерборд показывает прогресс и вклад, но призы получают не только топ-1. Каждый уровень — реальная награда." },
            ].map((f) => (
              <details
                key={f.q}
                className="group bg-white rounded-2xl border border-black/5 p-6 open:bg-om-blue-soft transition"
              >
                <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-om-blue-dark text-2xl leading-none group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-4 text-om-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-xl">
          <div className="rounded-3xl bg-om-ink text-om-cream p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold max-w-2xl mx-auto leading-tight">
              Движение приносит радость, когда ты слышишь своё тело.
            </h2>
            <p className="mt-6 text-om-cream/70 max-w-xl mx-auto">
              Присоединяйся к Лиге амбассадоров OM. Твой вклад в активное сообщество — в реальных наградах.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-block rounded-full bg-om-cream text-om-ink px-8 py-4 font-medium hover:bg-white transition"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
