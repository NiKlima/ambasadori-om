import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
// Service-role bypass: profiles/leaderboard hidden from anon by RLS until migration 009.
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardRow } from "@/lib/types";

export const metadata = {
  title: "trainers · OM Ambasadori",
  description: "meet the OM ambassadors — coaches across Moldova who train the trainers.",
};

const FALLBACK: LeaderboardRow[] = [
  { id: "t1", full_name: "Alina Russu", club: "Bigsport", sport: "running", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 145, birthdate: "1992-04-12", bio: "running coach.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "t2", full_name: "Mihai Ciobanu", club: "Martz Fitness", sport: "crossfit", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 128, birthdate: "1988-09-03", bio: "10 years in crossfit.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "t3", full_name: "Irina Balan", club: "Jiva Yoga", sport: "yoga", photo_url: "/brand/imagery/yoga-rooftop.jpg", total_points: 110, birthdate: "1990-07-20", bio: "hatha & vinyasa.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "t4", full_name: "Victor Moraru", club: "Premier Fitness", sport: "strength", photo_url: "/brand/imagery/runner-forest.jpg", total_points: 92, birthdate: "1985-02-14", bio: "powerlifting.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "t5", full_name: "Oxana Lupu", club: "Alexia", sport: "pilates", photo_url: "/brand/imagery/golf-sunset.jpg", total_points: 84, birthdate: "1993-11-05", bio: "pilates reformer.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "t6", full_name: "Andrei Popescu", club: "Aquaterra", sport: "triathlon", photo_url: "/brand/imagery/water-bottle-pet.jpg", total_points: 71, birthdate: "1986-06-18", bio: "triathlon.", socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
];

export default async function TrainersPage() {
  let rows: LeaderboardRow[] = FALLBACK;
  let clubsCount = 8;
  try {
    const supabase = createAdminClient();
    const [{ data: lbData }, { count }] = await Promise.all([
      supabase
        .from("leaderboard")
        .select("*")
        .order("total_points", { ascending: false }),
      supabase
        .from("clubs")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
    ]);
    if (lbData && lbData.length > 0) rows = lbData as LeaderboardRow[];
    if (count) clubsCount = count;
  } catch {}

  return (
    <>
      <SiteHeader />
      {/* HERO — dark */}
      <section
        className="bg-[var(--om-ink-900)] text-white relative overflow-hidden"
        style={{ paddingTop: 96, paddingBottom: 72 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/park-crowd.jpg)",
            opacity: 0.22,
          }}
        />
        <div className="container-om relative">
          <div className="eyebrow eyebrow-w">ambassadors · season 2026</div>
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
            meet the
            <br />
            ambassadors.
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
            <span>{rows.length} coaches</span>
            <span>· {clubsCount} clubs</span>
            <span>· Chișinău</span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-[var(--om-ink-50)]" style={{ padding: "72px 0 96px" }}>
        <div className="container-om">
          <div
            className="grid sm:grid-cols-2 md:grid-cols-3 border border-[var(--om-ink-100)]"
          >
            {rows.map((t, i) => {
              const total = rows.length;
              const cols = 3;
              return (
                <Link
                  href={`/trainers/${t.id}`}
                  key={t.id}
                  className="bg-white block group"
                  style={{
                    borderRight:
                      (i + 1) % cols !== 0 && i !== total - 1
                        ? "1px solid var(--om-ink-100)"
                        : "none",
                    borderBottom:
                      i < total - (total % cols === 0 ? cols : total % cols)
                        ? "1px solid var(--om-ink-100)"
                        : "none",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="bg-img"
                    style={{
                      aspectRatio: "1/1",
                      backgroundImage: t.photo_url
                        ? `url(${t.photo_url})`
                        : "none",
                      backgroundColor: "var(--om-ink-100)",
                    }}
                  />
                  <div style={{ padding: "22px 24px" }}>
                    <div className="flex justify-between items-baseline gap-3">
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 20,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.05,
                        }}
                      >
                        {t.full_name}
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--om-blue)", fontWeight: 700 }}
                      >
                        #{i + 1}
                      </div>
                    </div>
                    <div
                      className="font-mono mt-2"
                      style={{
                        fontSize: 11,
                        color: "var(--om-ink-500)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t.club ?? "—"}
                      {t.sport ? ` · ${t.sport}` : ""}
                    </div>
                    <div
                      className="flex justify-between items-center mt-4 pt-3"
                      style={{ borderTop: "1px solid var(--om-ink-100)" }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color: "var(--om-ink-500)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        points
                      </span>
                      <span
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 22,
                          color: "var(--om-blue)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {t.total_points}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
