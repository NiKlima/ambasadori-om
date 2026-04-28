import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, LeaderboardRow } from "@/lib/types";

const FALLBACK_CHALLENGES: Partial<Challenge>[] = [
  { id: "1", title: "фото с OM на тренировке", description: "выложи stories с тегом @om во время тренировки.", points: 5 },
  { id: "2", title: "ученик купил OM по промокоду", description: "каждая покупка по твоему промокоду — твои баллы.", points: 10 },
  { id: "3", title: "опрос для клиента", description: "поделись ссылкой — баллы после прохождения.", points: 8 },
  { id: "4", title: "регистрация на событие OM", description: "твой ученик записался на забег, фестиваль или йогу.", points: 10 },
];

const CHALLENGE_PHOTOS = [
  "/brand/imagery/runner-overhead.jpg",
  "/brand/imagery/water-bottle-pet.jpg",
  "/brand/imagery/yoga-rooftop.jpg",
  "/brand/imagery/park-crowd.jpg",
];

const CHALLENGE_KINDS = ["photo · AI", "auto", "survey", "auto"];

const PRIZES: { title: string; desc: string; points: number; kind: string; img: string }[] = [
  { title: "Garmin Forerunner 165", desc: "GPS-часы для бегунов и триатлетов.", points: 1200, kind: "device", img: "/brand/imagery/runner-asphalt-line.jpg" },
  { title: "абонемент Bigsport на месяц", desc: "все клубы сети, 30 дней.", points: 600, kind: "service", img: "/brand/imagery/stadium-seats.jpg" },
  { title: "капсула OM '26", desc: "лимитированная футболка + бутылка.", points: 250, kind: "merch", img: "/brand/imagery/socks-stripe.jpg" },
  { title: "слот на марафон", desc: "место на главном забеге года.", points: 400, kind: "bonus", img: "/brand/imagery/park-crowd.jpg" },
  { title: "сессия с топ-PT", desc: "час с ведущим тренером сети.", points: 350, kind: "service", img: "/brand/imagery/runner-overhead.jpg" },
  { title: "куртка амбассадора OM", desc: "эксклюзивный мерч для амбассадоров.", points: 800, kind: "merch", img: "/brand/imagery/towel.jpg" },
];

const FALLBACK_LEADERBOARD: LeaderboardRow[] = [
  { id: "1", full_name: "Алина Руссу", club: "Bigsport", sport: "бег", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 145, birthdate: "1992-04-12", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "2", full_name: "Михаил Чобану", club: "Martz Fitness", sport: "кроссфит", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 128, birthdate: "1988-09-03", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "3", full_name: "Ирина Балан", club: "Jiva Yoga", sport: "йога", photo_url: "/brand/imagery/yoga-rooftop.jpg", total_points: 110, birthdate: "1990-07-20", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "4", full_name: "Виктор Морару", club: "Premier Fitness", sport: "силовой", photo_url: "/brand/imagery/runner-forest.jpg", total_points: 92, birthdate: "1985-02-14", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "5", full_name: "Оксана Лупу", club: "Alexia", sport: "пилатес", photo_url: "/brand/imagery/golf-sunset.jpg", total_points: 84, birthdate: "1993-11-05", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "6", full_name: "Андрей Попеску", club: "Aquaterra", sport: "триатлон", photo_url: "/brand/imagery/runner-asphalt-line.jpg", total_points: 71, birthdate: "1986-06-18", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "7", full_name: "Наталья Гынку", club: "Bigsport", sport: "функциональный", photo_url: "/brand/imagery/park-crowd.jpg", total_points: 60, birthdate: "1991-03-09", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
  { id: "8", full_name: "Дмитрий Унгуряну", club: "Martz Fitness", sport: "бокс", photo_url: "/brand/imagery/runner-overhead.jpg", total_points: 48, birthdate: "1989-08-25", bio: null, socials: {}, achievements: [], quote: null, story: null, intro_video_url: null, gallery: [] },
];

async function getData() {
  try {
    const supabase = await createClient();
    const [challengesRes, leaderboardRes] = await Promise.all([
      supabase.from("challenges").select("*").eq("active", true).order("points", { ascending: false }).limit(4),
      supabase.from("leaderboard").select("*").limit(8),
    ]);
    return {
      challenges: (challengesRes.data as Challenge[] | null) ?? null,
      leaderboard: (leaderboardRes.data as LeaderboardRow[] | null) ?? null,
    };
  } catch {
    return { challenges: null, leaderboard: null };
  }
}

export default async function Home() {
  const { challenges, leaderboard } = await getData();
  const chs = challenges && challenges.length > 0 ? challenges : (FALLBACK_CHALLENGES as Challenge[]);
  const lb = leaderboard && leaderboard.length > 0 ? leaderboard : FALLBACK_LEADERBOARD;
  const trainers = lb.slice(0, 8);

  return (
    <div className="bg-white">
      <SiteHeader onBlue />

      {/* HERO */}
      <section className="bg-[var(--om-blue)] text-white pt-24 relative overflow-hidden">
        <div className="container-om">
          <div className="grid md:grid-cols-[1.25fr_1fr] gap-12 items-end">
            <div>
              <div className="eyebrow eyebrow-w">ambasadori om · сезон 2026</div>
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
                ты тренируешь людей.
                <br />
                мы тренируем тебя.
              </h1>
              <p
                className="font-body"
                style={{
                  fontSize: 18,
                  lineHeight: 1.4,
                  maxWidth: 480,
                  opacity: 0.9,
                  margin: "0 0 32px",
                }}
              >
                программа лояльности OM для тренеров Молдовы. простые челленджи. реальные баллы. экипировка, курсы, гаджеты и слоты на события.
              </p>
              <div className="flex gap-3 items-center mb-16 flex-wrap">
                <Link href="/login" className="btn btn-white">
                  стать амбассадором
                </Link>
                <Link href="/leaderboard" className="btn btn-outline-w">
                  смотреть лидерборд
                </Link>
              </div>
              <div
                className="grid grid-cols-3 pt-7 border-t border-white/20"
                style={{ marginRight: 48 }}
              >
                {[
                  ["120+", "активных тренеров"],
                  ["8", "клубов-партнёров"],
                  ["32 000", "баллов начислено"],
                ].map(([n, l]) => (
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
              className="bg-img"
              style={{
                aspectRatio: "4/5",
                backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
                marginBottom: -1,
              }}
            />
          </div>
        </div>
        <div style={{ height: 18, background: "#fff" }} />
      </section>

      {/* MANIFESTO STRIP */}
      <section className="bg-white border-b border-[var(--om-ink-100)]">
        <div className="container-om py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div
            className="font-display flex-1"
            style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}
          >
            здоровое тело начинается с хорошей воды.{" "}
            <span style={{ color: "var(--om-blue)" }}>OM — твоё ежедневное решение.</span>
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
            — алина руссу, top coach 2026
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white relative" style={{ padding: "96px 0" }}>
        <div
          className="om-stripes-blue-soft"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
        <div className="container-om relative">
          <div className="eyebrow">как работает</div>
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
            четыре шага от первого
            <br />
            челленджа до реального приза.
          </h2>
          <div className="grid md:grid-cols-4 gap-0">
            {[
              ["01", "вступаешь", "получаешь доступ к личному кабинету и свой промокод."],
              ["02", "выполняешь челленджи", "сторис, опросы, регистрации — каждый месяц новый набор."],
              ["03", "копишь баллы", "каждая активность = баллы. всё прозрачно в кабинете."],
              ["04", "забираешь приз", "экипировка, курсы, гаджеты, слоты на события."],
            ].map(([n, t, d], i) => (
              <div
                key={n}
                style={{
                  borderTop: "4px solid var(--om-blue)",
                  padding: "20px 24px 0 0",
                  borderRight: i < 3 ? "1px solid var(--om-ink-100)" : "none",
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--om-blue)", fontWeight: 700 }}
                >
                  {n} · шаг
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
      <section id="challenges" className="bg-[var(--om-ink-50)]" style={{ padding: "96px 0" }}>
        <div className="container-om">
          <div className="flex justify-between items-end mb-12 gap-6 flex-wrap">
            <div>
              <div className="eyebrow">челленджи сезона</div>
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
                простые действия.
                <br />
                реальные баллы.
              </h2>
            </div>
            <Link href="/login" className="lk">все 12 челленджей →</Link>
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
                <div className="p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <span className="chip">{CHALLENGE_KINDS[i] ?? "auto"}</span>
                      <span className="chip chip-blue">+{ch.points} баллов</span>
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
                      открой кабинет, чтобы участвовать
                    </span>
                    <Link href="/login" className="lk">войти →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINERS GRID */}
      <section id="trainers" className="bg-white" style={{ padding: "96px 0" }}>
        <div className="container-om">
          <div className="flex justify-between items-end mb-12 gap-6 flex-wrap">
            <div>
              <div className="eyebrow">амбассадоры</div>
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
                реальные тренеры.
                <br />
                реальные истории.
              </h2>
            </div>
            <Link href="/leaderboard" className="lk">смотреть лидерборд →</Link>
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
                <div className="p-4 sm:p-[18px]">
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
                      баллы
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
        style={{ padding: "96px 0" }}
      >
        <div className="container-om">
          <div className="flex justify-between items-end mb-12 gap-6 flex-wrap">
            <div>
              <div className="eyebrow eyebrow-w">призы сезона</div>
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
                тренируй. зарабатывай.
                <br />
                <span style={{ color: "var(--om-blue)" }}>забирай.</span>
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
              никаких лотерей. никаких розыгрышей. баллы → приз, напрямую.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border border-white/10">
            {PRIZES.map((p, i) => (
              <article
                key={i}
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
      <section className="bg-[var(--om-blue)] text-white">
        <div className="om-stripes-band" style={{ padding: "96px 0" }}>
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
              мы — бренд, который вдохновляет тебя выбирать лучшую версию себя.
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
              манифест бренда OM · 2026
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
