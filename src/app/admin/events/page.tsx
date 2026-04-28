import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { createEvent, toggleEvent, deleteEvent } from "./actions";

const KIND_LABEL: Record<string, string> = {
  race: "забег",
  live: "live",
  workshop: "воркшоп",
  community: "комьюнити",
};

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });
  const list = (data ?? []) as Event[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">события</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 5vw, 56px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "8px 0 0",
          }}
        >
          забеги, лайвы, воркшопы.
        </h1>
      </div>

      <form
        action={createEvent}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">название</div>
          <input className="input mt-2" name="title" required />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">описание</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{
              resize: "none",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">тип</div>
          <select className="input mt-2" name="kind" defaultValue="community">
            {Object.entries(KIND_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">локация</div>
          <input className="input mt-2" name="location" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">старт</div>
          <input
            className="input mt-2"
            name="starts_at"
            type="datetime-local"
            required
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">конец · опц</div>
          <input
            className="input mt-2"
            name="ends_at"
            type="datetime-local"
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">ссылка</div>
          <input
            className="input mt-2"
            name="link"
            type="url"
            placeholder="https://…"
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">cover url</div>
          <input
            className="input mt-2"
            name="cover_url"
            type="url"
            placeholder="https://…"
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">
            добавить
          </button>
        </div>
      </form>

      <div className="grid gap-3">
        {list.map((ev) => (
          <div
            key={ev.id}
            className="bg-white border border-[var(--om-ink-100)] flex items-start justify-between gap-4"
            style={{
              padding: "20px 24px",
              opacity: ev.active ? 1 : 0.55,
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="font-display truncate"
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {ev.title}
                </div>
                <span className="chip chip-blue">{KIND_LABEL[ev.kind] ?? ev.kind}</span>
                {!ev.active && <span className="chip">скрыто</span>}
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
                {formatDate(ev.starts_at)}
                {ev.location ? ` · ${ev.location}` : ""}
              </div>
              {ev.description && (
                <p
                  className="font-body mt-2 line-clamp-2"
                  style={{
                    fontSize: 13,
                    color: "var(--om-ink-500)",
                    lineHeight: 1.55,
                  }}
                >
                  {ev.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <form action={toggleEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <input type="hidden" name="active" value={String(ev.active)} />
                <button type="submit" className="btn btn-outline btn-sm">
                  {ev.active ? "скрыть" : "показать"}
                </button>
              </form>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <button
                  type="submit"
                  className="btn btn-outline btn-sm"
                  style={{
                    borderColor: "var(--om-magenta)",
                    color: "var(--om-magenta)",
                  }}
                >
                  удалить
                </button>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p
            className="font-mono"
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "var(--om-ink-500)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            событий пока нет.
          </p>
        )}
      </div>
    </div>
  );
}
