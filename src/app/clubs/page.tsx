import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Club } from "@/lib/types";

export const metadata = { title: "clubs · OM Ambasadori" };

type ClubWithCount = Club & { trainer_count: number };

async function getData(): Promise<ClubWithCount[]> {
  try {
    const supabase = await createClient();
    const [{ data: clubs }, { data: trainers }] = await Promise.all([
      supabase
        .from("clubs")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("club_id")
        .eq("role", "trainer")
        .eq("is_active", true),
    ]);
    const counts = (trainers ?? []).reduce<Record<string, number>>((acc, t) => {
      if (t.club_id) acc[t.club_id] = (acc[t.club_id] ?? 0) + 1;
      return acc;
    }, {});
    return (clubs ?? []).map((c) => ({
      ...(c as Club),
      trainer_count: counts[c.id as string] ?? 0,
    }));
  } catch {
    return [];
  }
}

const FALLBACK: ClubWithCount[] = [
  { id: "f1", name: "Bigsport",        slug: "bigsport",        logo_url: null, description: "крупнейший беговой клуб Кишинёва. групповые забеги по выходным.",  sport_focus: "бег, функциональные",      city: "Chișinău", website: null, sort_order: 100, active: true, created_at: "", trainer_count: 2 },
  { id: "f2", name: "Martz Fitness",   slug: "martz-fitness",   logo_url: null, description: "кроссфит-сообщество и боксёрский ринг. сильные тренеры.",          sport_focus: "кроссфит, бокс",           city: "Chișinău", website: null, sort_order: 90,  active: true, created_at: "", trainer_count: 2 },
  { id: "f3", name: "Jiva Yoga",       slug: "jiva-yoga",       logo_url: null, description: "йога-студия в центре. хатха, виньяса, восстановительные практики.", sport_focus: "йога",                     city: "Chișinău", website: null, sort_order: 80,  active: true, created_at: "", trainer_count: 2 },
  { id: "f4", name: "Premier Fitness", slug: "premier-fitness", logo_url: null, description: "силовой зал с олимпийским оборудованием.",                         sport_focus: "силовой, пауэрлифтинг",    city: "Chișinău", website: null, sort_order: 70,  active: true, created_at: "", trainer_count: 1 },
  { id: "f5", name: "Alexia",          slug: "alexia",          logo_url: null, description: "пилатес-студия с реформерами. малые группы, индивидуальный подход.", sport_focus: "пилатес",                  city: "Chișinău", website: null, sort_order: 60,  active: true, created_at: "", trainer_count: 1 },
  { id: "f6", name: "Aquaterra",       slug: "aquaterra",       logo_url: null, description: "триатлон и плавание. собственный бассейн + беговая программа.",    sport_focus: "триатлон, плавание",       city: "Chișinău", website: null, sort_order: 50,  active: true, created_at: "", trainer_count: 1 },
  { id: "f7", name: "Pilates Club",    slug: "pilates-club",    logo_url: null, description: "пилатес-клуб для всех уровней. групповые и персональные занятия.",  sport_focus: "пилатес",                  city: "Chișinău", website: null, sort_order: 40,  active: true, created_at: "", trainer_count: 1 },
  { id: "f8", name: "OM Studio",       slug: "om-studio",       logo_url: null, description: "мультиспортивная студия партнёров OM.",                            sport_focus: "multi-sport",              city: "Chișinău", website: null, sort_order: 30,  active: true, created_at: "", trainer_count: 0 },
];

export default async function ClubsPage() {
  const fromDb = await getData();
  const clubs = fromDb.length > 0 ? fromDb : FALLBACK;
  const totalTrainers = clubs.reduce((s, c) => s + c.trainer_count, 0);

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-blue)] text-white"
        style={{ paddingTop: 96, paddingBottom: 72 }}
      >
        <div className="container-om relative">
          <div className="eyebrow eyebrow-w">partner clubs · season 2026</div>
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
            where the coaches
            <br />
            actually train.
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
            <span>{clubs.length} clubs</span>
            <span>· {totalTrainers} active coaches</span>
            <span>· Chișinău</span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-white" style={{ padding: "72px 0 96px" }}>
        <div className="container-om">
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 border border-[var(--om-ink-100)]"
          >
            {clubs.map((c, i) => {
              const total = clubs.length;
              return (
                <article
                  key={c.id}
                  className="bg-white flex flex-col"
                  style={{
                    padding: "32px 32px 28px",
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
                  <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
                    {c.logo_url ? (
                      <div
                        className="bg-img shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          backgroundImage: `url(${c.logo_url})`,
                          backgroundColor: "var(--om-ink-50)",
                          border: "1px solid var(--om-ink-100)",
                        }}
                      />
                    ) : (
                      <div
                        className="shrink-0 flex items-center justify-center font-display"
                        style={{
                          width: 64,
                          height: 64,
                          background: "var(--om-ink-50)",
                          color: "var(--om-blue)",
                          fontWeight: 900,
                          fontSize: 22,
                          letterSpacing: "-0.02em",
                          border: "1px solid var(--om-ink-100)",
                        }}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 24,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.05,
                        }}
                      >
                        {c.name}
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
                        {c.city ?? "Chișinău"}
                        {c.sport_focus ? ` · ${c.sport_focus}` : ""}
                      </div>
                    </div>
                  </div>

                  {c.description && (
                    <p
                      className="font-body"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "var(--om-ink-500)",
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {c.description}
                    </p>
                  )}

                  <div
                    className="flex justify-between items-center mt-6 pt-4"
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
                      {c.trainer_count}{" "}
                      {c.trainer_count === 1 ? "ambassador" : "ambassadors"}
                    </span>
                    {c.website ? (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lk"
                      >
                        website →
                      </a>
                    ) : null}
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
