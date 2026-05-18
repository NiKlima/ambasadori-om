import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event, EventRegistration } from "@/lib/types";
import { deleteRegistration } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EventRegistrationsPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: evRaw }, { data: regsRaw }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const ev = evRaw as Event | null;
  if (!ev) notFound();
  const regs = (regsRaw ?? []) as EventRegistration[];

  return (
    <div className="grid gap-8">
      <div>
        <Link
          href="/admin/events"
          className="font-mono inline-block"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          ← all events
        </Link>
        <div className="eyebrow">registrations</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "8px 0 4px",
          }}
        >
          {ev.title}
        </h1>
        <div
          className="font-mono"
          style={{
            fontSize: 12,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {formatDate(ev.starts_at)}
          {ev.location ? ` · ${ev.location}` : ""}
          {" · "}
          {regs.length} {regs.length === 1 ? "registration" : "registrations"}
          {ev.max_participants ? ` / ${ev.max_participants}` : ""}
        </div>
      </div>

      {regs.length === 0 ? (
        <div
          className="bg-white border border-[var(--om-ink-100)]"
          style={{ padding: "40px 28px", textAlign: "center", color: "var(--om-ink-500)", fontSize: 14 }}
        >
          no registrations yet.
        </div>
      ) : (
        <div className="bg-white border border-[var(--om-ink-100)]">
          {regs.map((r, i) => (
            <div
              key={r.id}
              className="grid items-start om-grid-responsive"
              style={{
                gridTemplateColumns: "1fr 220px 180px auto",
                gap: 16,
                padding: "16px 20px",
                borderBottom: i < regs.length - 1 ? "1px solid var(--om-ink-100)" : "none",
              }}
            >
              <div>
                <div
                  className="font-display"
                  style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}
                >
                  {r.name}
                </div>
                {r.note && (
                  <div
                    className="font-body mt-1"
                    style={{ fontSize: 12, color: "var(--om-ink-500)", lineHeight: 1.5 }}
                  >
                    {r.note}
                  </div>
                )}
              </div>
              <a
                href={`mailto:${r.email}`}
                className="lk"
                style={{ fontSize: 13, wordBreak: "break-all" }}
              >
                {r.email}
              </a>
              <span
                className="font-mono"
                style={{ fontSize: 12, color: "var(--om-ink-500)" }}
              >
                {r.phone ?? "—"}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {formatDate(r.created_at)}
                </span>
                <form action={deleteRegistration}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="event_id" value={ev.id} />
                  <button
                    type="submit"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
                  >
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
