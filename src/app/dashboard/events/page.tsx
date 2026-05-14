import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event, EventStatus } from "@/lib/types";
import { withdrawMyEvent } from "./actions";

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
  rejected: "var(--om-magenta)",
};

export default async function DashboardEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Event[];

  return (
    <div className="container-om" style={{ paddingTop: 40, paddingBottom: 96 }}>
      <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow">my events</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 5vw, 64px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              margin: "8px 0 0",
            }}
          >
            propose a session.
          </h1>
          <p
            className="font-body mt-3"
            style={{ fontSize: 14, color: "var(--om-ink-500)", lineHeight: 1.55, maxWidth: 540 }}
          >
            предложи событие — admin проверит и опубликует на сайте. фото, текст, дата, опциональная регистрация.
          </p>
        </div>
        <Link href="/dashboard/events/new" className="btn btn-blue">
          + propose event
        </Link>
      </div>

      <div className="grid gap-3">
        {list.map((ev) => (
          <div
            key={ev.id}
            className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-[1fr_auto] gap-4 items-start"
            style={{ padding: "20px 24px", opacity: ev.active ? 1 : 0.55 }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="font-display truncate"
                  style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}
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
                {!ev.active && <span className="chip">hidden</span>}
                {ev.registration_enabled && <span className="chip chip-blue">registration on</span>}
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
              {ev.status === "rejected" && ev.moderator_note && (
                <div
                  className="font-body mt-3"
                  style={{
                    padding: "10px 14px",
                    border: "1px solid var(--om-magenta)",
                    color: "var(--om-magenta)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    background: "rgba(232,55,150,0.04)",
                  }}
                >
                  admin note: {ev.moderator_note}
                </div>
              )}
              {ev.description && (
                <p
                  className="font-body mt-2 line-clamp-2"
                  style={{ fontSize: 13, color: "var(--om-ink-500)", lineHeight: 1.55 }}
                >
                  {ev.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 items-stretch min-w-[140px]">
              <Link href={`/dashboard/events/${ev.id}`} className="btn btn-outline btn-sm">
                {ev.status === "approved" ? "view" : "edit"}
              </Link>
              {ev.active && ev.status !== "approved" && (
                <form action={withdrawMyEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <button
                    type="submit"
                    className="btn btn-outline btn-sm"
                    style={{
                      width: "100%",
                      borderColor: "var(--om-magenta)",
                      color: "var(--om-magenta)",
                    }}
                  >
                    withdraw
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "40px 28px", textAlign: "center", color: "var(--om-ink-500)", fontSize: 14 }}
          >
            no events yet. propose your first session via the button above.
          </div>
        )}
      </div>
    </div>
  );
}
