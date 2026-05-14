import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Club, Event, EventStatus, Profile } from "@/lib/types";
import {
  createEvent,
  updateEvent,
  toggleEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
} from "./actions";
import { reorderEntity } from "../actions";
import { EventFormFields } from "@/components/EventForm";

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "draft",
  pending: "in review",
  approved: "approved",
  rejected: "rejected",
};

const STATUS_COLOR: Record<EventStatus, string> = {
  draft: "var(--om-ink-500)",
  pending: "var(--om-magenta)",
  approved: "var(--om-blue)",
  rejected: "var(--om-ink-500)",
};

type SearchParams = Promise<{ status?: string }>;

const FILTERS = ["all", "pending", "approved", "rejected", "draft"] as const;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status: statusParam } = await searchParams;
  const filter = (FILTERS as readonly string[]).includes(statusParam ?? "")
    ? (statusParam as string)
    : "pending";

  const supabase = await createClient();

  let q = supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (filter !== "all") q = q.eq("status", filter);

  const [{ data: evRaw }, { data: clubsRaw }, { data: trainersRaw }] = await Promise.all([
    q,
    supabase.from("clubs").select("*").eq("active", true).order("sort_order", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, promo_code")
      .eq("role", "trainer")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  const list = (evRaw ?? []) as Event[];
  const clubs = (clubsRaw ?? []) as Club[];
  const trainers = (trainersRaw ?? []) as Pick<Profile, "id" | "full_name" | "promo_code">[];
  const trainerMap = new Map(trainers.map((t) => [t.id, t]));
  const clubMap = new Map(clubs.map((c) => [c.id, c]));

  // pending count for top badge
  const { count: pendingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

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
          moderation queue {pendingCount ? `· ${pendingCount} pending` : ""}
        </h1>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/events${f === "pending" ? "" : `?status=${f}`}`}
            className={`chip ${filter === f ? "chip-ink" : ""}`}
          >
            {f}
          </Link>
        ))}
      </div>

      {/* Create form (admin) */}
      <details className="bg-white border border-[var(--om-ink-100)]">
        <summary
          className="cursor-pointer list-none font-display"
          style={{ padding: "16px 20px", fontWeight: 800, fontSize: 14, letterSpacing: "-0.005em" }}
        >
          + create event (auto-approved)
        </summary>
        <form
          action={createEvent}
          className="grid md:grid-cols-2 gap-4"
          style={{
            borderTop: "1px solid var(--om-ink-100)",
            padding: "24px 28px",
          }}
        >
          <EventFormFields clubs={clubs} />
          <div>
            <div className="eyebrow eyebrow-ink">host trainer · optional</div>
            <select className="input mt-2" name="host_trainer_id" defaultValue="">
              <option value="">— none —</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="eyebrow eyebrow-ink">sort order</div>
            <input className="input mt-2" name="sort_order" type="number" defaultValue={0} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-blue">create event</button>
          </div>
        </form>
      </details>

      {/* List */}
      <div className="grid gap-3">
        {list.map((ev) => {
          const hostTrainer = ev.host_trainer_id ? trainerMap.get(ev.host_trainer_id) : null;
          const hostClub = ev.host_club_id ? clubMap.get(ev.host_club_id) : null;
          return (
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
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: STATUS_COLOR[ev.status],
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      ● {STATUS_LABEL[ev.status]}
                    </span>
                    {ev.registration_enabled && (
                      <span className="chip chip-blue">reg on</span>
                    )}
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
                    {ev.location ? ` · ${ev.location}` : ""}
                    {hostTrainer ? ` · by ${hostTrainer.full_name}` : ""}
                    {hostClub ? ` · at ${hostClub.name}` : ""}
                    {" · sort "}
                    {ev.sort_order}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ev.status === "approved" && ev.registration_enabled && (
                    <Link
                      href={`/admin/events/${ev.id}/registrations`}
                      className="btn btn-outline btn-sm"
                    >
                      registrations
                    </Link>
                  )}
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

              <div style={{ borderTop: "1px solid var(--om-ink-100)", padding: "24px 28px" }}>
                {/* Approve / reject (только если pending) */}
                {ev.status === "pending" && (
                  <div
                    className="grid md:grid-cols-2 gap-4"
                    style={{ marginBottom: 24 }}
                  >
                    <form action={approveEvent} className="bg-[var(--om-blue-50)]" style={{ padding: "16px 20px" }}>
                      <input type="hidden" name="id" value={ev.id} />
                      <div className="eyebrow" style={{ color: "var(--om-blue)" }}>approve</div>
                      <input
                        className="input mt-2"
                        name="moderator_note"
                        placeholder="note to trainer (optional)"
                      />
                      <button type="submit" className="btn btn-blue mt-3" style={{ width: "100%" }}>
                        ✓ approve & publish
                      </button>
                    </form>
                    <form action={rejectEvent} style={{ padding: "16px 20px", border: "1px solid var(--om-magenta)" }}>
                      <input type="hidden" name="id" value={ev.id} />
                      <div className="eyebrow" style={{ color: "var(--om-magenta)" }}>reject</div>
                      <textarea
                        className="input mt-2"
                        name="moderator_note"
                        rows={2}
                        placeholder="reason — required, will be shown to trainer"
                        style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 13 }}
                        required
                      />
                      <button
                        type="submit"
                        className="btn btn-outline mt-3"
                        style={{ width: "100%", borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
                      >
                        ✗ reject
                      </button>
                    </form>
                  </div>
                )}

                {ev.status === "rejected" && ev.moderator_note && (
                  <div
                    style={{
                      padding: "12px 16px",
                      border: "1px solid var(--om-ink-100)",
                      background: "var(--om-ink-50)",
                      marginBottom: 24,
                    }}
                  >
                    <div className="eyebrow" style={{ marginBottom: 4 }}>your rejection note</div>
                    <p style={{ fontSize: 13, color: "var(--om-ink-900)", margin: 0 }}>
                      {ev.moderator_note}
                    </p>
                  </div>
                )}

                {/* Full edit form */}
                <form action={updateEvent} className="grid md:grid-cols-2 gap-4">
                  <input type="hidden" name="id" value={ev.id} />
                  <EventFormFields defaults={ev} clubs={clubs} />
                  <div>
                    <div className="eyebrow eyebrow-ink">host trainer · optional</div>
                    <select
                      className="input mt-2"
                      name="host_trainer_id"
                      defaultValue={ev.host_trainer_id ?? ""}
                    >
                      <option value="">— none —</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name}
                        </option>
                      ))}
                    </select>
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
                  <div className="md:col-span-2 flex gap-3 flex-wrap" style={{ marginTop: 8 }}>
                    <button type="submit" className="btn btn-blue">save</button>
                  </div>
                </form>

                <div
                  className="flex gap-3 flex-wrap"
                  style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16, marginTop: 24 }}
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
          );
        })}
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
            no events in <strong>{filter}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
