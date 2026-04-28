import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

const STORYTELLING_DEFAULTS = { quote: null, story: null, intro_video_url: null, gallery: [] };

const FALLBACK: LeaderboardRow[] = [
  { id: "1", full_name: "Алина Руссу", club: "Bigsport", sport: "Бег", photo_url: null, total_points: 145, birthdate: "1992-04-12", bio: "Беговой тренер. Готовлю к 10К, полу- и марафонам.", socials: { instagram: "alina.runs", telegram: "alinaruns" }, achievements: ["Berlin Marathon 2024", "Тренер года Bigsport 2023"], ...STORYTELLING_DEFAULTS },
  { id: "2", full_name: "Михаил Чобану", club: "Martz Fitness", sport: "Кроссфит", photo_url: null, total_points: 128, birthdate: "1988-09-03", bio: "10 лет в кроссфите.", socials: { instagram: "mihai.crossfit" }, achievements: ["CrossFit Level 2 Trainer"], ...STORYTELLING_DEFAULTS },
  { id: "3", full_name: "Ирина Балан", club: "Jiva Yoga", sport: "Йога", photo_url: null, total_points: 110, birthdate: "1990-07-20", bio: "Хатха и виньяса.", socials: { instagram: "irina.yoga" }, achievements: ["RYT-500 Yoga Alliance"], ...STORYTELLING_DEFAULTS },
  { id: "4", full_name: "Виктор Морару", club: "Premier Fitness", sport: "Силовой", photo_url: null, total_points: 92, birthdate: "1985-02-14", bio: "Пауэрлифтинг, гипертрофия.", socials: { instagram: "viktor.lift" }, achievements: ["КМС по пауэрлифтингу"], ...STORYTELLING_DEFAULTS },
  { id: "5", full_name: "Оксана Лупу", club: "Alexia", sport: "Пилатес", photo_url: null, total_points: 84, birthdate: "1993-11-05", bio: "Пилатес-реформер.", socials: { instagram: "oxana.pilates" }, achievements: ["Polestar Pilates Comprehensive"], ...STORYTELLING_DEFAULTS },
  { id: "6", full_name: "Андрей Попеску", club: "Aquaterra", sport: "Триатлон", photo_url: null, total_points: 71, birthdate: "1986-06-18", bio: "Триатлон и плавание.", socials: { instagram: "andrei.tri" }, achievements: ["IRONMAN 70.3 finisher"], ...STORYTELLING_DEFAULTS },
  { id: "7", full_name: "Наталья Гынку", club: "Bigsport", sport: "Функциональный", photo_url: null, total_points: 60, birthdate: "1991-03-09", bio: "Функциональные тренировки.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "8", full_name: "Дмитрий Унгуряну", club: "Martz Fitness", sport: "Бокс", photo_url: null, total_points: 48, birthdate: "1989-08-25", bio: "Бокс для любителей.", socials: { instagram: "dim.box" }, achievements: ["МС по боксу"], ...STORYTELLING_DEFAULTS },
  { id: "9", full_name: "Елена Цуркан", club: "Jiva Yoga", sport: "Йога", photo_url: null, total_points: 35, birthdate: "1995-12-30", bio: "Йога-нидра.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "10", full_name: "Сергей Врабие", club: "Pilates Club", sport: "Пилатес", photo_url: null, total_points: 22, birthdate: "1994-01-15", bio: "Мужской пилатес.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
];

type SearchParams = Promise<{ sport?: string }>;

export default async function LeaderboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { sport } = await searchParams;
  let rows: LeaderboardRow[] = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("leaderboard").select("*");
    if (data && data.length > 0) rows = data as LeaderboardRow[];
  } catch {}

  const sports = Array.from(new Set(rows.map((r) => r.sport).filter(Boolean))) as string[];
  const filtered = sport ? rows.filter((r) => r.sport === sport) : rows;

  return (
    <>
      <SiteHeader />
      <section className="container-xl pt-16 pb-24">
        <div className="max-w-3xl mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
            Лидерборд сезона · 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Каждый амбассадор — твой путь к сообществу.
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/leaderboard"
            className={`rounded-full px-4 py-2 text-sm transition ${
              !sport ? "bg-om-ink text-om-cream" : "bg-white border border-black/10 text-om-muted hover:text-om-ink"
            }`}
          >
            Все виды
          </a>
          {sports.map((s) => (
            <a
              key={s}
              href={`/leaderboard?sport=${encodeURIComponent(s)}`}
              className={`rounded-full px-4 py-2 text-sm transition ${
                sport === s
                  ? "bg-om-ink text-om-cream"
                  : "bg-white border border-black/10 text-om-muted hover:text-om-ink"
              }`}
            >
              {s}
            </a>
          ))}
        </div>

        <LeaderboardClient rows={filtered} />
      </section>
      <SiteFooter />
    </>
  );
}
