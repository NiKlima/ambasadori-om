import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

const STORYTELLING_DEFAULTS = { quote: null, story: null, intro_video_url: null, gallery: [] };

const FALLBACK: LeaderboardRow[] = [
  { id: "1", full_name: "Алина Руссу", club: "Bigsport", sport: "бег", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 145, birthdate: "1992-04-12", bio: "беговой тренер.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "2", full_name: "Михаил Чобану", club: "Martz Fitness", sport: "кроссфит", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 128, birthdate: "1988-09-03", bio: "10 лет в кроссфите.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "3", full_name: "Ирина Балан", club: "Jiva Yoga", sport: "йога", photo_url: "/brand/imagery/yoga-rooftop.jpg", total_points: 110, birthdate: "1990-07-20", bio: "хатха и виньяса.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "4", full_name: "Виктор Морару", club: "Premier Fitness", sport: "силовой", photo_url: "/brand/imagery/runner-forest.jpg", total_points: 92, birthdate: "1985-02-14", bio: "пауэрлифтинг.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "5", full_name: "Оксана Лупу", club: "Alexia", sport: "пилатес", photo_url: "/brand/imagery/golf-sunset.jpg", total_points: 84, birthdate: "1993-11-05", bio: "пилатес-реформер.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "6", full_name: "Андрей Попеску", club: "Aquaterra", sport: "триатлон", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 71, birthdate: "1986-06-18", bio: "триатлон.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "7", full_name: "Наталья Гынку", club: "Bigsport", sport: "функциональный", photo_url: "/brand/imagery/park-crowd.jpg", total_points: 60, birthdate: "1991-03-09", bio: "функциональные тренировки.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "8", full_name: "Дмитрий Унгуряну", club: "Martz Fitness", sport: "бокс", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 48, birthdate: "1989-08-25", bio: "бокс.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
];

export default async function LeaderboardPage() {
  let rows: LeaderboardRow[] = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("leaderboard").select("*");
    if (data && data.length > 0) rows = data as LeaderboardRow[];
  } catch {}

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section
        className="bg-[var(--om-blue)] text-white relative overflow-hidden"
        style={{ padding: "72px 0 56px" }}
      >
        <div
          className="om-stripes-band"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
        <div className="container-om relative">
          <div className="eyebrow eyebrow-w">лидерборд · сезон 2026</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(56px, 9vw, 128px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: "16px 0 0",
              maxWidth: 1100,
            }}
          >
            каждый амбассадор,
            <br />
            каждый балл.
          </h1>
          <div
            className="font-mono mt-8 flex flex-wrap gap-x-8 gap-y-2"
            style={{
              fontSize: 12,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>{rows.length} активных тренеров</span>
            <span>· 8 клубов-партнёров</span>
            <span>· обновляется в реальном времени</span>
          </div>
        </div>
      </section>

      <LeaderboardClient rows={rows} />

      <SiteFooter />
    </>
  );
}
