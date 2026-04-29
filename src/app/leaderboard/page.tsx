import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

const STORYTELLING_DEFAULTS = { quote: null, story: null, intro_video_url: null, gallery: [] };

const FALLBACK: LeaderboardRow[] = [
  { id: "1", full_name: "Alina Russu", club: "Bigsport", sport: "running", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 145, birthdate: "1992-04-12", bio: "running coach.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "2", full_name: "Mihai Ciobanu", club: "Martz Fitness", sport: "crossfit", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 128, birthdate: "1988-09-03", bio: "10 years in crossfit.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "3", full_name: "Irina Balan", club: "Jiva Yoga", sport: "yoga", photo_url: "/brand/imagery/yoga-rooftop.jpg", total_points: 110, birthdate: "1990-07-20", bio: "hatha & vinyasa.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "4", full_name: "Victor Moraru", club: "Premier Fitness", sport: "strength", photo_url: "/brand/imagery/runner-forest.jpg", total_points: 92, birthdate: "1985-02-14", bio: "powerlifting.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "5", full_name: "Oxana Lupu", club: "Alexia", sport: "pilates", photo_url: "/brand/imagery/golf-sunset.jpg", total_points: 84, birthdate: "1993-11-05", bio: "pilates reformer.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "6", full_name: "Andrei Popescu", club: "Aquaterra", sport: "triathlon", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 71, birthdate: "1986-06-18", bio: "triathlon.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "7", full_name: "Natalia Gincu", club: "Bigsport", sport: "functional", photo_url: "/brand/imagery/park-crowd.jpg", total_points: 60, birthdate: "1991-03-09", bio: "functional training.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
  { id: "8", full_name: "Dmitrii Unguryanu", club: "Martz Fitness", sport: "boxing", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 48, birthdate: "1989-08-25", bio: "boxing.", socials: {}, achievements: [], ...STORYTELLING_DEFAULTS },
];

export default async function LeaderboardPage() {
  let rows: LeaderboardRow[] = FALLBACK;
  let clubNames: string[] = [];
  try {
    const supabase = await createClient();
    const [rowsRes, clubsRes] = await Promise.all([
      supabase.from("leaderboard").select("*"),
      supabase
        .from("clubs")
        .select("name")
        .eq("active", true)
        .order("sort_order", { ascending: false }),
    ]);
    if (rowsRes.data && rowsRes.data.length > 0) rows = rowsRes.data as LeaderboardRow[];
    if (clubsRes.data) clubNames = clubsRes.data.map((c) => c.name as string);
  } catch {}
  const clubsCount = clubNames.length || 8;

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
          <div className="eyebrow eyebrow-w">leaderboard · season 2026</div>
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
            every ambassador.
            <br />
            every point.
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
            <span>{rows.length} active coaches</span>
            <span>· {clubsCount} partner clubs</span>
            <span>· updated in real time</span>
          </div>
        </div>
      </section>

      <LeaderboardClient rows={rows} clubsFromDb={clubNames} />

      <SiteFooter />
    </>
  );
}
