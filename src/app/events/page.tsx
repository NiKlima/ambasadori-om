import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  race: "race",
  live: "live",
  workshop: "workshop",
  community: "community",
};

const FALLBACK_IMG = "/brand/imagery/park-crowd.jpg";

const FALLBACK: Event[] = [
  { id: "f1", title: "Chișinău 10K", description: "the main spring road race.", cover_url: "/brand/imagery/runner-asphalt-line.jpg", kind: "race", starts_at: "2026-05-25T08:00:00Z", ends_at: null, location: "Valea Morilor park", link: null, active: true, sort_order: 0, created_at: new Date().toISOString() },
  { id: "f2", title: "OM Live with ambassadors", description: "live stream with the network coaches.", cover_url: "/brand/imagery/yoga-rooftop.jpg", kind: "live", starts_at: "2026-05-12T19:00:00Z", ends_at: null, location: "Instagram @om", link: null, active: true, sort_order: 0, created_at: new Date().toISOString() },
  { id: "f3", title: "rooftop yoga · sunrise", description: "at sunrise in the city center.", cover_url: "/brand/imagery/yoga-rooftop.jpg", kind: "community", starts_at: "2026-06-02T06:30:00Z", ends_at: null, location: "Press House", link: null, active: true, sort_order: 0, created_at: new Date().toISOString() },
  { id: "f4", title: "trail half marathon", description: "through the Codrii forest paths.", cover_url: "/brand/imagery/runner-forest.jpg", kind: "race", starts_at: "2026-06-14T07:00:00Z", ends_at: null, location: "Codrii forest", link: null, active: true, sort_order: 0, created_at: new Date().toISOString() },
];

export default async function EventsPage() {
  let events: Event[] = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: false })
      .order("starts_at", { ascending: true });
    if (data && data.length > 0) events = data as Event[];
  } catch {}

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now);

  const spotlight = upcoming[0];
  const moreUpcoming = upcoming.slice(1);
  const filters = ["all", ...Array.from(new Set(upcoming.map((e) => KIND_LABEL[e.kind] ?? e.kind)))];

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-ink-900)]"
        style={{ height: 720 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${FALLBACK_IMG})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,71,185,0.25) 0%, transparent 30%, rgba(35,31,32,0.85) 100%)",
          }}
        />
        <div
          className="container-om relative h-full flex flex-col justify-end text-white"
          style={{ paddingBottom: 56 }}
        >
          <div className="eyebrow eyebrow-w">events · season 2026</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(64px, 10vw, 168px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              margin: "20px 0 24px",
              maxWidth: 1100,
            }}
          >
            where the
            <br />
            community lives.
          </h1>
          <div
            className="font-mono flex flex-wrap gap-x-8 gap-y-2"
            style={{
              fontSize: 12,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>{upcoming.length} upcoming</span>
            <span>· 4 cities</span>
            <span>· OM run · OM live · OM festival</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "var(--om-blue)",
          }}
        />
      </section>

      {/* Filter bar */}
      <section className="bg-white border-b border-[var(--om-ink-100)]">
        <div
          className="container-om flex gap-2 items-center flex-wrap"
          style={{ padding: "20px 0" }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginRight: 8,
            }}
          >
            filter
          </span>
          {filters.map((f, i) => (
            <span key={f} className={i === 0 ? "chip chip-ink" : "chip"}>
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT — first event huge */}
      {spotlight && (
        <section className="bg-white">
          <div className="container-om" style={{ padding: "56px 0" }}>
            <div className="eyebrow">next event</div>
            <div
              className="grid mt-4 border border-[var(--om-ink-100)]"
              style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
            >
              <div
                className="bg-img relative"
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: `url(${spotlight.cover_url ?? FALLBACK_IMG})`,
                }}
              >
                <div className="absolute" style={{ top: 20, left: 20 }}>
                  <span className="chip chip-blue">
                    {KIND_LABEL[spotlight.kind] ?? spotlight.kind}
                  </span>
                </div>
              </div>
              <div
                className="bg-[var(--om-blue)] text-white relative overflow-hidden flex flex-col justify-between"
                style={{ padding: "40px 44px" }}
              >
                <div
                  className="om-stripes-band"
                  style={{ position: "absolute", inset: 0, opacity: 0.32 }}
                />
                <div className="relative">
                  <div className="eyebrow eyebrow-w">
                    {formatDate(spotlight.starts_at)}
                  </div>
                  <h2
                    className="font-display"
                    style={{
                      fontWeight: 900,
                      fontSize: "clamp(40px, 5vw, 64px)",
                      letterSpacing: "-0.04em",
                      lineHeight: 0.92,
                      margin: "12px 0 16px",
                    }}
                  >
                    {spotlight.title}
                  </h2>
                  {spotlight.location && (
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 12,
                        opacity: 0.85,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 24,
                      }}
                    >
                      📍 {spotlight.location}
                    </div>
                  )}
                  {spotlight.description && (
                    <p
                      className="font-body"
                      style={{
                        fontSize: 16,
                        lineHeight: 1.5,
                        opacity: 0.95,
                        marginBottom: 28,
                      }}
                    >
                      {spotlight.description}
                    </p>
                  )}
                </div>
                <div className="relative flex gap-3 flex-wrap">
                  {spotlight.link ? (
                    <a
                      href={spotlight.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-white"
                    >
                      register →
                    </a>
                  ) : (
                    <span className="btn btn-white" style={{ opacity: 0.7 }}>
                      details soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING GRID */}
      {moreUpcoming.length > 0 && (
        <section style={{ padding: "0 0 72px" }}>
          <div className="container-om">
            <div
              className="eyebrow"
              style={{ paddingBottom: 16 }}
            >
              upcoming · {moreUpcoming.length} more
            </div>
            <div
              className="grid border border-[var(--om-ink-100)]"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              {moreUpcoming.map((e, i) => {
                const cover = e.cover_url ?? FALLBACK_IMG;
                const total = moreUpcoming.length;
                return (
                  <article
                    key={e.id}
                    className="relative overflow-hidden"
                    style={{
                      aspectRatio: "4/5",
                      borderRight:
                        (i + 1) % 3 !== 0 && i !== total - 1
                          ? "1px solid var(--om-ink-100)"
                          : "none",
                      borderBottom:
                        i < total - (total % 3 === 0 ? 3 : total % 3)
                          ? "1px solid var(--om-ink-100)"
                          : "none",
                    }}
                  >
                    <div
                      className="bg-img"
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${cover})`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(35,31,32,0.95) 0%, rgba(35,31,32,0.1) 50%, transparent 100%)",
                      }}
                    />
                    <div
                      className="absolute flex gap-2"
                      style={{ top: 16, left: 16 }}
                    >
                      <span className="chip chip-outline-w">
                        {KIND_LABEL[e.kind] ?? e.kind}
                      </span>
                    </div>
                    <div
                      className="absolute font-mono text-white"
                      style={{
                        top: 16,
                        right: 16,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        textAlign: "right",
                      }}
                    >
                      {formatDate(e.starts_at)}
                    </div>
                    <div
                      className="absolute text-white"
                      style={{ left: 20, right: 20, bottom: 20 }}
                    >
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 28,
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                          marginBottom: 8,
                        }}
                      >
                        {e.title}
                      </div>
                      {e.location && (
                        <div
                          className="font-mono"
                          style={{
                            fontSize: 11,
                            opacity: 0.8,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 16,
                          }}
                        >
                          {e.location}
                        </div>
                      )}
                      <div
                        className="flex justify-between items-center pt-3"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,.25)",
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 11,
                            opacity: 0.85,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          registration open
                        </span>
                        {e.link ? (
                          <a
                            href={e.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display"
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              color: "#fff",
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            register →
                          </a>
                        ) : (
                          <span
                            className="font-display"
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              opacity: 0.7,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            soon →
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {upcoming.length === 0 && (
        <section style={{ padding: "72px 0" }}>
          <div className="container-om">
            <div
              className="bg-white border border-[var(--om-ink-100)]"
              style={{ padding: "40px 28px", textAlign: "center" }}
            >
              <div className="eyebrow">empty</div>
              <p
                className="font-body mt-3"
                style={{ fontSize: 15, color: "var(--om-ink-500)" }}
              >
                nothing scheduled yet — stay tuned.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PAST */}
      {past.length > 0 && (
        <section
          className="bg-[var(--om-ink-50)]"
          style={{ padding: "72px 0" }}
        >
          <div className="container-om">
            <div className="eyebrow">past events</div>
            <h2
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 5vw, 56px)",
                letterSpacing: "-0.03em",
                margin: "12px 0 32px",
              }}
            >
              look back.
            </h2>
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
            >
              {past.map((p) => (
                <article
                  key={p.id}
                  className="bg-white border border-[var(--om-ink-100)]"
                >
                  <div
                    className="bg-img"
                    style={{
                      aspectRatio: "16/10",
                      backgroundImage: `url(${p.cover_url ?? FALLBACK_IMG})`,
                      filter: "grayscale(0.4)",
                    }}
                  />
                  <div
                    className="flex justify-between items-baseline gap-3"
                    style={{
                      padding: "16px 20px",
                      borderTop: "1px solid var(--om-ink-100)",
                    }}
                  >
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.title}
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
                      {formatDate(p.starts_at)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
