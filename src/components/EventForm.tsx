import type { Club, Event, EventKind } from "@/lib/types";

const KIND_LABEL: Record<EventKind, string> = {
  race: "race",
  live: "live",
  workshop: "workshop",
  community: "community",
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Shared event form fields used by:
 * - /dashboard/events/new (proposeEvent)
 * - /dashboard/events/[id] (updateMyEvent)
 * The parent <form action={...}> + <button>save</button> wrap it.
 *
 * Renders all editable fields. Hidden <input name="id"> handled by parent.
 */
export function EventFormFields({
  defaults,
  clubs,
}: {
  defaults?: Partial<Event>;
  clubs: Club[];
}) {
  return (
    <>
      <div className="md:col-span-2">
        <div className="eyebrow eyebrow-ink">title</div>
        <input
          className="input mt-2"
          name="title"
          defaultValue={defaults?.title ?? ""}
          required
          placeholder="rooftop yoga · sunrise"
        />
      </div>
      <div className="md:col-span-2">
        <div className="eyebrow eyebrow-ink">description</div>
        <textarea
          className="input mt-2"
          name="description"
          rows={4}
          defaultValue={defaults?.description ?? ""}
          placeholder="a few sentences about the session — what, why, who it's for."
          style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
        />
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">type</div>
        <select className="input mt-2" name="kind" defaultValue={defaults?.kind ?? "community"}>
          {Object.entries(KIND_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">location</div>
        <input
          className="input mt-2"
          name="location"
          defaultValue={defaults?.location ?? ""}
          placeholder="Valea Morilor · Chișinău"
        />
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">starts at</div>
        <input
          className="input mt-2"
          name="starts_at"
          type="datetime-local"
          defaultValue={toLocalInput(defaults?.starts_at ?? null)}
          required
        />
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">ends at · optional</div>
        <input
          className="input mt-2"
          name="ends_at"
          type="datetime-local"
          defaultValue={toLocalInput(defaults?.ends_at ?? null)}
        />
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">host club · optional</div>
        <select
          className="input mt-2"
          name="host_club_id"
          defaultValue={defaults?.host_club_id ?? ""}
        >
          <option value="">— none —</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="eyebrow eyebrow-ink">external link · optional</div>
        <input
          className="input mt-2"
          name="link"
          type="url"
          defaultValue={defaults?.link ?? ""}
          placeholder="https://timepad.ru/event/…"
        />
        <p
          className="font-mono mt-2"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          if set — register CTA opens it. else internal form.
        </p>
      </div>
      <div className="md:col-span-2">
        <div className="eyebrow eyebrow-ink">cover photo {defaults?.cover_url ? "(replace)" : ""}</div>
        <input className="input mt-2" name="cover" type="file" accept="image/*" />
        {defaults?.cover_url && (
          <div
            className="bg-img mt-3"
            style={{
              aspectRatio: "16/9",
              backgroundImage: `url(${defaults.cover_url})`,
              maxWidth: 320,
              border: "1px solid var(--om-ink-100)",
            }}
          />
        )}
      </div>
      <label
        className="flex items-center gap-2 font-mono"
        style={{
          fontSize: 12,
          color: "var(--om-ink-500)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <input
          name="registration_enabled"
          type="checkbox"
          defaultChecked={defaults?.registration_enabled ?? false}
        />
        <span>enable internal registration (name/email form)</span>
      </label>
      <div>
        <div className="eyebrow eyebrow-ink">max participants · optional</div>
        <input
          className="input mt-2"
          name="max_participants"
          type="number"
          min={1}
          defaultValue={defaults?.max_participants ?? ""}
        />
      </div>
    </>
  );
}
