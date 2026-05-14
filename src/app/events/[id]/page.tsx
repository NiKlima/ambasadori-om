import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event, EventKind } from "@/lib/types";

const KIND_LABEL: Record<EventKind, string> = {
  race: "race",
  live: "live",
  workshop: "workshop",
  community: "community",
};

const FALLBACK_IMG = "/brand/imagery/park-crowd.jpg";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select("title, description")
      .eq("id", id)
      .eq("status", "approved")
      .eq("active", true)
      .single();
    if (data) {
      return {
        title: `${data.title} · OM Ambasadori`,
        description: data.description ?? undefined,
      };
    }
  } catch {}
  return { title: "event · OM Ambasadori" };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evRaw } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .eq("status", "approved")
    .single();
  const ev = evRaw as Event | null;
  if (!ev) notFound();

  // host info
  const [hostTrainerRes, hostClubRes, regCountRes] = await Promise.all([
    ev.host_trainer_id
      ? supabase
          .from("profiles")
          .select("id, full_name, sport, club, photo_url")
          .eq("id", ev.host_trainer_id)
          .single()
      : Promise.resolve({ data: null }),
    ev.host_club_id
      ? supabase
          .from("clubs")
          .select("id, name, slug, logo_url, city, sport_focus")
          .eq("id", ev.host_club_id)
          .single()
      : Promise.resolve({ data: null }),
    ev.registration_enabled
      ? supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", ev.id)
      : Promise.resolve({ count: 0 }),
  ]);

  const hostTrainer = hostTrainerRes.data as
    | { id: string; full_name: string; sport: string | null; club: string | null; photo_url: string | null }
    | null;
  const hostClub = hostClubRes.data as
    | { id: string; name: string; slug: string | null; logo_url: string | null; city: string | null; sport_focus: string | null }
    | null;
  const regCount = ("count" in regCountRes ? regCountRes.count : null) ?? 0;
  const cover = ev.cover_url ?? FALLBACK_IMG;

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-[var(--om-ink-900)]"
        style={{ minHeight: 560 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${cover})`,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,71,185,0.2) 0%, transparent 30%, rgba(35,31,32,0.92) 100%)",
          }}
        />
        <div
          className="container-om relative h-full flex flex-col justify-end text-white"
          style={{ paddingTop: 96, paddingBottom: 56, minHeight: 560 }}
        >
          <Link
            href="/events"
            className="font-mono inline-block"
            style={{
              fontSize: 11,
              opacity: 0.75,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 24,
            }}
          >
            ← all events
          </Link>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 12 }}>
            <span className="chip chip-blue">{KIND_LABEL[ev.kind] ?? ev.kind}</span>
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                opacity: 0.85,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {formatDate(ev.starts_at)}
              {ev.location ? ` · ${ev.location}` : ""}
            </span>
          </div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(48px, 8vw, 120px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: 0,
              maxWidth: 1100,
            }}
          >
            {ev.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white" style={{ padding: "72px 0 96px" }}>
        <div className="container-om grid md:grid-cols-[1.4fr_1fr] gap-12">
          <div>
            {ev.description && (
              <>
                <div className="eyebrow">about</div>
                <p
                  className="font-body whitespace-pre-line"
                  style={{
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: "var(--om-ink-900)",
                    margin: "12px 0 0",
                  }}
                >
                  {ev.description}
                </p>
              </>
            )}

            {(hostTrainer || hostClub) && (
              <div style={{ marginTop: 48 }}>
                <div className="eyebrow">hosts</div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {hostTrainer && (
                    <Link
                      href={`/trainers/${hostTrainer.id}`}
                      className="bg-white border border-[var(--om-ink-100)] flex items-center gap-4"
                      style={{ padding: "16px 20px" }}
                    >
                      <div
                        className="shrink-0 bg-img"
                        style={{
                          width: 56,
                          height: 56,
                          backgroundImage: hostTrainer.photo_url
                            ? `url(${hostTrainer.photo_url})`
                            : "none",
                          background: hostTrainer.photo_url ? undefined : "var(--om-blue-50)",
                          color: "var(--om-blue)",
                          display: "grid",
                          placeItems: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontSize: 20,
                        }}
                      >
                        {!hostTrainer.photo_url && hostTrainer.full_name.slice(0, 1)}
                      </div>
                      <div>
                        <div
                          className="font-display"
                          style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}
                        >
                          {hostTrainer.full_name}
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
                          host · {hostTrainer.sport ?? "coach"}
                        </div>
                      </div>
                    </Link>
                  )}
                  {hostClub && (
                    <div
                      className="bg-white border border-[var(--om-ink-100)] flex items-center gap-4"
                      style={{ padding: "16px 20px" }}
                    >
                      <div
                        className="shrink-0 bg-img"
                        style={{
                          width: 56,
                          height: 56,
                          backgroundImage: hostClub.logo_url ? `url(${hostClub.logo_url})` : "none",
                          background: hostClub.logo_url ? undefined : "var(--om-blue-50)",
                          color: "var(--om-blue)",
                          display: "grid",
                          placeItems: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        {!hostClub.logo_url && hostClub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div
                          className="font-display"
                          style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}
                        >
                          {hostClub.name}
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
                          venue · {hostClub.city ?? "Chișinău"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Side panel — date + register CTA */}
          <aside>
            <div
              className="bg-[var(--om-ink-50)] border border-[var(--om-ink-100)]"
              style={{ padding: "28px 28px 32px", position: "sticky", top: 96 }}
            >
              <div className="eyebrow">when</div>
              <div
                className="font-display mt-2"
                style={{
                  fontWeight: 900,
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {formatDate(ev.starts_at)}
              </div>
              {ev.ends_at && (
                <div
                  className="font-mono mt-1"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  until {formatDate(ev.ends_at)}
                </div>
              )}

              {ev.location && (
                <>
                  <div className="eyebrow" style={{ marginTop: 24 }}>where</div>
                  <div
                    className="font-display mt-2"
                    style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    📍 {ev.location}
                  </div>
                </>
              )}

              {(ev.link || ev.registration_enabled) && (
                <div style={{ marginTop: 28 }}>
                  {ev.link ? (
                    <a
                      href={ev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-blue"
                      style={{ width: "100%" }}
                    >
                      register →
                    </a>
                  ) : (
                    <Link
                      href={`/events/${ev.id}/register`}
                      className="btn btn-blue"
                      style={{ width: "100%" }}
                    >
                      register →
                    </Link>
                  )}
                  {ev.registration_enabled && ev.max_participants && (
                    <p
                      className="font-mono mt-3"
                      style={{
                        fontSize: 11,
                        color: "var(--om-ink-500)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {regCount} / {ev.max_participants} spots taken
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
