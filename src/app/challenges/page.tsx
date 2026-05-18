import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, ChallengeKind } from "@/lib/types";

export const metadata = {
  title: "challenges · OM Ambasadori",
  description:
    "shows-and-tells, photo proofs, surveys, AI moderation — every activity is points.",
};

const KIND_LABEL: Record<ChallengeKind, string> = {
  photo_ai: "photo · AI",
  video_ai: "video · AI",
  survey_trainee: "survey",
  manual: "manual review",
};

const FALLBACK_PHOTOS: Record<ChallengeKind, string> = {
  photo_ai: "/brand/imagery/runner-overhead.jpg",
  video_ai: "/brand/imagery/runner-asphalt-line.jpg",
  survey_trainee: "/brand/imagery/yoga-rooftop.jpg",
  manual: "/brand/imagery/park-crowd.jpg",
};

const FALLBACK_CHALLENGES: Partial<Challenge>[] = [
  { id: "c1", title: "photo with OM at training", description: "post a story tagging @om while training. AI checks bottle/branding.", points: 5, kind: "photo_ai" },
  { id: "c2", title: "client buys OM with your code", description: "every purchase via your promo code = your points. credits in 2 days.", points: 10, kind: "manual" },
  { id: "c3", title: "client survey · pulse", description: "share the link with a client — points come after submission.", points: 8, kind: "survey_trainee" },
  { id: "c4", title: "registration to OM event", description: "a client signs up to an OM run, festival or yoga session.", points: 10, kind: "manual" },
  { id: "c5", title: "video reel · 60 sec", description: "a 60-sec reel about why you choose OM. AI moderation + visibility check.", points: 12, kind: "video_ai" },
  { id: "c6", title: "ambassador of the month", description: "the OM team picks one ambassador every month. nominate yourself.", points: 50, kind: "manual" },
];

export default async function ChallengesPage() {
  let challenges: Challenge[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: false })
      .order("points", { ascending: false });
    if (data && data.length > 0) challenges = data as Challenge[];
  } catch {}

  const list: Partial<Challenge>[] = challenges.length > 0 ? challenges : FALLBACK_CHALLENGES;
  const totalPoints = list.reduce((sum, c) => sum + (c.points ?? 0), 0);

  return (
    <>
      <SiteHeader />
      {/* HERO */}
      <section
        className="bg-[var(--om-blue)] text-white relative overflow-hidden"
        style={{ paddingTop: 96, paddingBottom: 72 }}
      >
        <div className="container-om relative">
          <div className="eyebrow eyebrow-w">challenges · season 2026</div>
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
            simple actions.
            <br />
            real points.
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
            <span>{list.length} challenges</span>
            <span>· up to {totalPoints} pts</span>
            <span>· auto-credit in 2 days</span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-[var(--om-ink-50)]" style={{ padding: "56px 0 96px" }}>
        <div className="container-om">
          <div className="flex justify-between items-baseline gap-6 flex-wrap" style={{ marginBottom: 40 }}>
            <div>
              <div className="eyebrow">the programme</div>
              <h2
                className="font-display mt-2"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                what coaches actually do.
              </h2>
            </div>
            <Link href="/login" className="lk">
              join programme →
            </Link>
          </div>

          <div className="grid md:grid-cols-2" style={{ gap: 20 }}>
            {list.map((ch, i) => {
              const kind = (ch.kind ?? "manual") as ChallengeKind;
              const cover = ch.cover_url ?? FALLBACK_PHOTOS[kind] ?? FALLBACK_PHOTOS.manual;
              return (
                <article
                  key={ch.id ?? i}
                  className="bg-white border border-[var(--om-ink-100)] grid om-grid-responsive"
                  style={{ gridTemplateColumns: "260px 1fr", minHeight: 280 }}
                >
                  <div
                    className="bg-img relative"
                    style={{
                      backgroundImage: `url(${cover})`,
                      aspectRatio: "16/10",
                    }}
                  >
                    <div className="absolute" style={{ top: 14, left: 14 }}>
                      <span
                        className="chip"
                        style={{
                          background: "rgba(255,255,255,.95)",
                          borderColor: "transparent",
                        }}
                      >
                        {KIND_LABEL[kind]}
                      </span>
                    </div>
                    <div className="absolute" style={{ bottom: 14, left: 14 }}>
                      <span className="chip chip-blue">+{ch.points} pts</span>
                    </div>
                  </div>
                  <div
                    className="flex flex-col justify-between"
                    style={{ padding: "26px 28px" }}
                  >
                    <div>
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 22,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.1,
                        }}
                      >
                        {ch.title}
                      </div>
                      {ch.description && (
                        <div
                          className="font-body mt-2"
                          style={{
                            fontSize: 13,
                            color: "var(--om-ink-500)",
                            lineHeight: 1.55,
                          }}
                        >
                          {ch.description}
                        </div>
                      )}
                    </div>
                    <div
                      className="flex justify-between items-center mt-4 pt-3"
                      style={{ borderTop: "1px solid var(--om-ink-100)" }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--om-ink-500)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        ambassadors only
                      </span>
                      <Link href="/login" className="lk">
                        log in →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
