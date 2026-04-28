import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroCard } from "@/components/HeroCard";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  race: "Забег",
  live: "Live",
  workshop: "Воркшоп",
  community: "Комьюнити",
};

const FALLBACK: Event[] = [
  { id: "f1", title: "Кишинёв 10К", description: "Главный городской забег весны.", cover_url: null, kind: "race", starts_at: "2026-05-25T08:00:00Z", ends_at: null, location: "Парк «Валя Морилор»", link: null, active: true, created_at: new Date().toISOString() },
  { id: "f2", title: "OM Live с амбассадорами", description: "Прямой эфир с тренерами сети.", cover_url: null, kind: "live", starts_at: "2026-05-12T19:00:00Z", ends_at: null, location: "Instagram @om", link: null, active: true, created_at: new Date().toISOString() },
];

export default async function EventsPage() {
  let events: Event[] = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("active", true)
      .order("starts_at", { ascending: true });
    if (data && data.length > 0) events = data as Event[];
  } catch {}

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now);

  return (
    <>
      <SiteHeader />
      <section className="container-xl pt-16 pb-24">
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
            Календарь · 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            События ОМ — там, где живёт сообщество.
          </h1>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Предстоящие</h2>
            {upcoming.length === 0 ? (
              <p className="text-om-muted">Пока ничего не запланировано — следи за обновлениями.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map((ev) => (
                  <HeroCard
                    key={ev.id}
                    coverUrl={ev.cover_url}
                    title={ev.title}
                    subtitle={ev.location ? `${formatDate(ev.starts_at)} · ${ev.location}` : formatDate(ev.starts_at)}
                    badge={KIND_LABEL[ev.kind]}
                    href={ev.link ?? undefined}
                    ctaLabel={ev.link ? "Подробнее" : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-om-muted">Прошедшие</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {past.map((ev) => (
                  <HeroCard
                    key={ev.id}
                    coverUrl={ev.cover_url}
                    title={ev.title}
                    subtitle={formatDate(ev.starts_at)}
                    badge={KIND_LABEL[ev.kind]}
                    dimmed
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
