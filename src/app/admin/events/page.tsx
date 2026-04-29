import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { createEvent, updateEvent, toggleEvent, deleteEvent } from "./actions";
import { reorderEntity } from "../actions";

const KIND_LABEL: Record<string, string> = {
  race: "race",
  live: "live",
  workshop: "workshop",
  community: "community",
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("starts_at", { ascending: false });
  const list = (data ?? []) as Event[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">events</div>
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
          races, livestreams, workshops.
        </h1>
      </div>

      <form
        action={createEvent}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">title</div>
          <input className="input mt-2" name="title" required />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">description</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">type</div>
          <select className="input mt-2" name="kind" defaultValue="community">
            {Object.entries(KIND_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">location</div>
          <input className="input mt-2" name="location" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">starts</div>
          <input className="input mt-2" name="starts_at" type="datetime-local" required />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">end · optional</div>
          <input className="input mt-2" name="ends_at" type="datetime-local" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">link</div>
          <input className="input mt-2" name="link" type="url" placeholder="https://…" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">sort order</div>
          <input className="input mt-2" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">cover (file)</div>
          <input className="input mt-2" name="cover" type="file" accept="image/*" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">cover (url, fallback)</div>
          <input className="input mt-2" name="cover_url" type="url" placeholder="https://…" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">add</button>
        </div>
      </form>

      <div className="grid gap-3">
        {list.map((ev) => (
          <details
            key={ev.id}
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ opacity: ev.active ? 1 : 0.55 }}
          >
            <summary
              className="flex items-center gap-4 cursor-pointer list-none"
              style={{ padding: "16px 20px" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="font-display truncate"
                    style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    {ev.title}
                  </div>
                  <span className="chip chip-blue">{KIND_LABEL[ev.kind] ?? ev.kind}</span>
                  {!ev.active && <span className="chip">hidden</span>}
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
                  {formatDate(ev.starts_at)}
                  {ev.location ? ` · ${ev.location}` : ""} · sort {ev.sort_order}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="events" />
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="up">↑</button>
                </form>
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="events" />
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="down">↓</button>
                </form>
              </div>
            </summary>

            <div
              className="grid gap-4"
              style={{ borderTop: "1px solid var(--om-ink-100)", padding: "24px 28px" }}
            >
              <form action={updateEvent} className="grid md:grid-cols-2 gap-4">
                <input type="hidden" name="id" value={ev.id} />
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">title</div>
                  <input className="input mt-2" name="title" defaultValue={ev.title} required />
                </div>
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">description</div>
                  <textarea
                    className="input mt-2"
                    name="description"
                    rows={3}
                    defaultValue={ev.description ?? ""}
                    style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">type</div>
                  <select className="input mt-2" name="kind" defaultValue={ev.kind}>
                    {Object.entries(KIND_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">location</div>
                  <input className="input mt-2" name="location" defaultValue={ev.location ?? ""} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">starts</div>
                  <input
                    className="input mt-2"
                    name="starts_at"
                    type="datetime-local"
                    defaultValue={toLocalInput(ev.starts_at)}
                    required
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">end</div>
                  <input
                    className="input mt-2"
                    name="ends_at"
                    type="datetime-local"
                    defaultValue={toLocalInput(ev.ends_at)}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">link</div>
                  <input className="input mt-2" name="link" type="url" defaultValue={ev.link ?? ""} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">sort order</div>
                  <input
                    className="input mt-2"
                    name="sort_order"
                    type="number"
                    defaultValue={ev.sort_order}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">replace cover (file)</div>
                  <input className="input mt-2" name="cover" type="file" accept="image/*" />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">cover url</div>
                  <input
                    className="input mt-2"
                    name="cover_url"
                    type="url"
                    defaultValue={ev.cover_url ?? ""}
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn btn-blue">save</button>
                </div>
              </form>

              <div
                className="flex gap-3 flex-wrap"
                style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16 }}
              >
                <form action={toggleEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="active" value={String(ev.active)} />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {ev.active ? "hide" : "show"}
                  </button>
                </form>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <button
                    type="submit"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
                  >
                    delete
                  </button>
                </form>
              </div>
            </div>
          </details>
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
            no events yet.
          </p>
        )}
      </div>
    </div>
  );
}
