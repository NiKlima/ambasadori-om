import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
// Service-role bypass: public read on challenges/products/profiles is blocked by RLS
// until migration 009_audit_fixes is applied. Until then we read with service_role.
import { createAdminClient } from "@/lib/supabase/admin";
import type { Challenge, LeaderboardRow, Product } from "@/lib/types";

const FALLBACK_CHALLENGES: Partial<Challenge>[] = [
  { id: "1", title: "photo with OM at training", description: "post a story tagging @om while training. AI checks bottle/branding.", points: 5 },
  { id: "2", title: "client buys OM with your code", description: "every purchase via your promo code = your points. credits in 2 days.", points: 10 },
  { id: "3", title: "client survey · pulse", description: "share the link with a client — points come after submission.", points: 8 },
  { id: "4", title: "registration to OM event", description: "a client signs up to an OM run, festival or yoga session.", points: 10 },
];

const CHALLENGE_PHOTOS = [
  "/brand/imagery/runner-overhead.jpg",
  "/brand/imagery/water-bottle-pet.jpg",
  "/brand/imagery/yoga-rooftop.jpg",
  "/brand/imagery/park-crowd.jpg",
];

const CHALLENGE_KINDS = ["photo · AI", "auto", "survey", "auto"];

type PrizeView = { id: string; title: string; desc: string; points: number; kind: string; img: string };

const FALLBACK_PRIZES: PrizeView[] = [
  { id: "p1", title: "Garmin Forerunner 165", desc: "GPS watch for runners and triathletes.", points: 1200, kind: "gear", img: "/brand/imagery/runner-asphalt-line.jpg" },
  { id: "p2", title: "Bigsport monthly pass", desc: "all clubs in the network, 30 days.", points: 600, kind: "perk", img: "/brand/imagery/stadium-seats.jpg" },
  { id: "p3", title: "OM '26 capsule", desc: "limited tee + thermo bottle.", points: 250, kind: "merch", img: "/brand/imagery/socks-stripe.jpg" },
  { id: "p4", title: "marathon start slot", desc: "spot at the main race of the year.", points: 400, kind: "perk", img: "/brand/imagery/park-crowd.jpg" },
  { id: "p5", title: "session with top PT", desc: "an hour with a leading network coach.", points: 350, kind: "service", img: "/brand/imagery/runner-overhead.jpg" },
  { id: "p6", title: "OM ambassador jacket", desc: "exclusive merch for ambassadors.", points: 800, kind: "merch", img: "/brand/imagery/towel.jpg" },
];

const FALLBACK_LEADERBOARD: LeaderboardRow[] = [
  { id: "1", full_name: "Alina Russu", club: "Bigsport", sport: "running", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 145, birthdate: "1992-04-12", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "2", full_name: "Mihai Ciobanu", club: "Martz Fitness", sport: "crossfit", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 128, birthdate: "1988-09-03", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "3", full_name: "Irina Balan", club: "Jiva Yoga", sport: "yoga", photo_url: "/brand/imagery/yoga-rooftop.jpg", total_points: 110, birthdate: "1990-07-20", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "4", full_name: "Victor Moraru", club: "Premier Fitness", sport: "strength", photo_url: "/brand/imagery/runner-forest.jpg", total_points: 92, birthdate: "1985-02-14", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "5", full_name: "Oxana Lupu", club: "Alexia", sport: "pilates", photo_url: "/brand/imagery/golf-sunset.jpg", total_points: 84, birthdate: "1993-11-05", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "6", full_name: "Andrei Popescu", club: "Aquaterra", sport: "triathlon", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 71, birthdate: "1986-06-18", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "7", full_name: "Natalia Gincu", club: "Bigsport", sport: "functional", photo_url: "/brand/imagery/park-crowd.jpg", total_points: 60, birthdate: "1991-03-09", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "8", full_name: "Dmitrii Unguryanu", club: "Martz Fitness", sport: "boxing", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 48, birthdate: "1989-08-25", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
];

type HeroStats = {
  trainers: number;
  clubs: number;
  pointsAwarded: number;
};

async function getData() {
  try {
    const supabase = createAdminClient();
    const [challengesRes, leaderboardRes, prizesRes, trainersCount, clubsCount, pointsAgg] =
      await Promise.all([
        supabase
          .from("challenges")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(4),
        supabase.from("leaderboard").select("*").limit(8),
        supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .eq("featured", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "trainer")
          .eq("is_active", true),
        supabase
          .from("clubs")
          .select("*", { count: "exact", head: true })
          .eq("active", true),
        supabase
          .from("point_transactions")
          .select("amount")
          .gt("amount", 0),
      ]);
    const pointsTotal = (pointsAgg.data ?? []).reduce(
      (sum: number, t: { amount: number }) => sum + t.amount,
      0,
    );
    return {
      challenges: (challengesRes.data as Challenge[] | null) ?? null,
      leaderboard: (leaderboardRes.data as LeaderboardRow[] | null) ?? null,
      prizes: (prizesRes.data as Product[] | null) ?? null,
      stats: {
        trainers: trainersCount.count ?? 0,
        clubs: clubsCount.count ?? 0,
        pointsAwarded: pointsTotal,
      } as HeroStats,
    };
  } catch {
    return { challenges: null, leaderboard: null, prizes: null, stats: null };
  }
}

function formatStat(n: number, fallback: string, suffix = ""): string {
  if (n <= 0) return fallback;
  // round up to nearest 10 for trainers, integer for others
  return `${n.toLocaleString("en-US").replace(/,/g, " ")}${suffix}`;
}

const PRODUCT_KIND_LABEL: Record<Product["kind"], string> = {
  merch: "merch",
  gear: "gear",
  service: "service",
  digital: "digital",
  perk: "perk",
};

export default async function Home() {
  const { challenges, leaderboard, prizes, stats } = await getData();
  const chs = challenges && challenges.length > 0 ? challenges : (FALLBACK_CHALLENGES as Challenge[]);
  const lb = leaderboard && leaderboard.length > 0 ? leaderboard : FALLBACK_LEADERBOARD;
  const trainers = lb.slice(0, 8);

  // PRIZES: from DB if any featured, else fallback static
  const prizeViews: PrizeView[] = prizes && prizes.length > 0
    ? prizes.map((p, i) => ({
        id: p.id,
        title: p.title,
        desc: p.description ?? "",
        points: p.price_points,
        kind: PRODUCT_KIND_LABEL[p.kind] ?? p.kind,
        img: p.cover_url ?? FALLBACK_PRIZES[i % FALLBACK_PRIZES.length].img,
      }))
    : FALLBACK_PRIZES;

  // HERO STATS: live numbers if available, else hardcoded fallback
  const heroStats: [string, string][] = stats && stats.trainers > 0
    ? [
        [`${stats.trainers}+`, "active coaches"],
        [String(stats.clubs), "partner clubs"],
        [formatStat(stats.pointsAwarded, "32 000"), "points awarded"],
      ]
    : [
        ["120+", "active coaches"],
        ["8", "partner clubs"],
        ["32 000", "points awarded"],
      ];

  return (
    <div className="bg-white">
      <SiteHeader onBlue />

      {/* HERO */}
      <section className="bg-[var(--om-blue)] text-white relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 72 }}>
        <div className="container-om">
          <div className="grid md:grid-cols-[1.25fr_1fr] gap-16 items-stretch">
            <div>
              <div className="eyebrow eyebrow-w">ambasadori om · season 2026</div>
              <h1
                className="font-display"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(64px, 9vw, 144px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.88,
                  margin: "20px 0 28px",
                }}
              >
                you train people.
                <br />
                we train you.
              </h1>
              <p
                className="font-body"
                style={{
                  fontSize: 18,
                  lineHeight: 1.5,
                  maxWidth: 520,
                  opacity: 0.9,
                  margin: "0 0 40px",
                }}
              >
                OM&apos;s loyalty programme for coaches in Moldova. simple challenges. real points. gear, courses, gadgets and event slots.
              </p>
              <div className="flex gap-3 items-center flex-wrap" style={{ marginBottom: 80 }}>
                <Link href="/login" className="btn btn-white">
                  become an ambassador
                </Link>
                <Link href="/leaderboard" className="btn btn-outline-w">
                  view leaderboard
                </Link>
              </div>
              <div
                className="grid grid-cols-3"
                style={{ marginRight: 24, paddingTop: 28, gap: 24 }}
              >
                {heroStats.map(([n, l]) => (
                  <div key={l}>
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 900,
                        fontSize: 44,
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {n}
                    </div>
                    <div
                      className="font-mono mt-1"
                      style={{ fontSize: 11, opacity: 0.75 }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="bg-img hidden md:block"
              style={{
                backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
                minHeight: 560,
                alignSelf: "stretch",
              }}
            />
          </div>
        </div>
      </section>

      {/* MANIFESTO STRIP */}
      <section className="bg-white border-b border-[var(--om-ink-100)]">
        <div className="container-om flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div
            className="font-display flex-1"
            style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}
          >
            a healthy body starts with good water.{" "}
            <span style={{ color: "var(--om-blue)" }}>OM — your daily decision.</span>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            — alina russu, top coach 2026
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white relative" style={{ padding: "112px 0" }}>
        <div
          className="om-stripes-blue-soft"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
        <div className="container-om relative">
          <div className="eyebrow">how it works</div>
          <h2
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 72px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              margin: "16px 0 56px",
              maxWidth: 900,
            }}
          >
            four steps from your first
            <br />
            challenge to a real prize.
          </h2>
          <div className="grid md:grid-cols-4 gap-0">
            {[
              ["01", "join", "get access to your personal dashboard and your own promo code."],
              ["02", "do challenges", "stories, surveys, registrations — a fresh set every month."],
              ["03", "earn points", "every activity = points. fully transparent in your dashboard."],
              ["04", "claim a prize", "gear, courses, gadgets, slots at events."],
            ].map(([n, t, d], i) => (
              <div
                key={n}
                style={{
                  borderTop: "4px solid var(--om-blue)",
                  padding: "24px 28px 32px 0",
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--om-blue)", fontWeight: 700 }}
                >
                  {n} · step
                </div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 900,
                    fontSize: 36,
                    letterSpacing: "-0.02em",
                    margin: "10px 0 14px",
                  }}
                >
                  {t}
                </div>
                <div
                  className="font-body"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "var(--om-ink-500)",
                    paddingRight: 20,
                  }}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section id="challenges" className="bg-[var(--om-ink-50)]" style={{ padding: "112px 0" }}>
        <div className="container-om">
          <div className="flex justify-between items-end gap-6 flex-wrap" style={{ marginBottom: 56 }}>
            <div>
              <div className="eyebrow">season challenges</div>
              <h2
                className="font-display mt-4"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 5vw, 56px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  margin: 0,
                }}
              >
                simple actions.
                <br />
                real points.
              </h2>
            </div>
            <Link href="/login" className="lk">all 12 challenges →</Link>
          </div>
          <div className="grid md:grid-cols-2 border border-[var(--om-ink-100)]">
            {chs.slice(0, 4).map((ch, i) => (
              <article
                key={ch.id ?? i}
                className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] bg-white"
                style={{
                  borderRight: i % 2 === 0 ? "1px solid var(--om-ink-100)" : "none",
                  borderBottom: i < 2 ? "1px solid var(--om-ink-100)" : "none",
                }}
              >
                <div
                  className="bg-img"
                  style={{
                    backgroundImage: `url(${CHALLENGE_PHOTOS[i] ?? CHALLENGE_PHOTOS[0]})`,
                    minHeight: 220,
                  }}
                />
                <div className="flex flex-col justify-between" style={{ padding: "28px 32px" }}>
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <span className="chip">{CHALLENGE_KINDS[i] ?? "auto"}</span>
                      <span className="chip chip-blue">+{ch.points} pts</span>
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 900,
                        fontSize: 22,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                      }}
                    >
                      {ch.title}
                    </div>
                    <div
                      className="font-body mt-2"
                      style={{
                        fontSize: 14,
                        color: "var(--om-ink-500)",
                        lineHeight: 1.55,
                      }}
                    >
                      {ch.description}
                    </div>
                  </div>
                  <div
                    className="flex justify-between items-center mt-4 pt-3"
                    style={{ borderTop: "1px solid var(--om-ink-100)" }}
                  >
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: "var(--om-ink-500)" }}
                    >
                      open dashboard to participate
                    </span>
                    <Link href="/login" className="lk">log in →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINERS GRID */}
      <section id="trainers" className="bg-white" style={{ padding: "112px 0" }}>
        <div className="container-om">
          <div className="flex justify-between items-end gap-6 flex-wrap" style={{ marginBottom: 56 }}>
            <div>
              <div className="eyebrow">ambassadors</div>
              <h2
                className="font-display mt-4"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 5vw, 56px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  margin: 0,
                }}
              >
                real coaches.
                <br />
                real stories.
              </h2>
            </div>
            <Link href="/leaderboard" className="lk">view leaderboard →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border border-[var(--om-ink-100)]">
            {trainers.map((t, i) => (
              <Link
                key={t.id}
                href={`/trainers/${t.id}`}
                className="bg-white block"
                style={{
                  borderRight: (i + 1) % 4 !== 0 ? "1px solid var(--om-ink-100)" : "none",
                  borderBottom: i < 4 ? "1px solid var(--om-ink-100)" : "none",
                }}
              >
                <div
                  className="bg-img"
                  style={{
                    aspectRatio: "1/1",
                    backgroundImage: t.photo_url ? `url(${t.photo_url})` : "var(--om-ink-100)",
                    backgroundColor: "var(--om-ink-100)",
                  }}
                />
                <div style={{ padding: "20px 22px" }}>
                  <div className="flex justify-between items-baseline">
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 900,
                        fontSize: 18,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {t.full_name}
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 11, color: "var(--om-blue)" }}
                    >
                      #{i + 1}
                    </div>
                  </div>
                  <div
                    className="font-mono mt-1"
                    style={{
                      fontSize: 11,
                      color: "var(--om-ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t.club} · {t.sport}
                  </div>
                  <div
                    className="flex justify-between items-center mt-3 pt-3"
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
            ))}
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section
        className="bg-[var(--om-ink-900)] text-white relative overflow-hidden"
        style={{ padding: "112px 0" }}
      >
        <div className="container-om">
          <div className="flex justify-between items-end gap-6 flex-wrap" style={{ marginBottom: 56 }}>
            <div>
              <div className="eyebrow eyebrow-w">season prizes</div>
              <h2
                className="font-display mt-4"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(48px, 6vw, 72px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  margin: 0,
                }}
              >
                train. earn.
                <br />
                <span style={{ color: "var(--om-blue)" }}>claim.</span>
              </h2>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                opacity: 0.6,
                maxWidth: 280,
                textAlign: "right",
              }}
            >
              no lotteries. no draws. points → prize, directly.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border border-white/10">
            {prizeViews.map((p, i) => (
              <article
                key={p.id}
                className="relative overflow-hidden"
                style={{
                  aspectRatio: "4/5",
                  borderRight: (i + 1) % 3 !== 0 ? "1px solid rgba(255,255,255,.12)" : "none",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,.12)" : "none",
                }}
              >
                <div
                  className="bg-img"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${p.img})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(35,31,32,0.92) 0%, rgba(35,31,32,0.05) 55%, rgba(35,31,32,0) 100%)",
                  }}
                />
                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <span className="chip chip-outline-w">{p.kind}</span>
                </div>
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <span className="chip chip-blue">{p.points} pts</span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 20,
                    bottom: 20,
                    right: 20,
                    color: "#fff",
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="font-mono mt-2"
                    style={{ fontSize: 12, opacity: 0.75 }}
                  >
                    {p.desc}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO BLUE */}
      <section className="bg-[var(--om-blue)] text-white relative overflow-hidden">
        <div className="om-stripes-band" style={{ position: "absolute", inset: 0, opacity: 0.32, pointerEvents: "none" }} />
        <div style={{ padding: "120px 0" }} className="relative">
          <div className="container-om">
            <h2
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(48px, 7vw, 112px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                margin: 0,
                maxWidth: 1100,
              }}
            >
              we are a brand that inspires you to choose the best version of yourself.
            </h2>
            <div
              className="font-mono mt-8"
              style={{
                fontSize: 12,
                opacity: 0.85,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              OM brand manifesto · 2026
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
