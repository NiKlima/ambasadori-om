import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Club, Event, EventStatus, EventRegistration } from "@/lib/types";
import { EventFormFields } from "@/components/EventForm";
import { updateMyEvent, withdrawMyEvent } from "../actions";

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

type Params = Promise<{ id: string }>;

export default async function MyEventPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: evRaw }, { data: clubsRaw }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("clubs").select("*").eq("active", true).order("sort_order", { ascending: false }),
  ]);

  const ev = evRaw as Event | null;
  if (!ev) notFound();
  if (ev.created_by !== user.id) notFound();

  const clubs = (clubsRaw ?? []) as Club[];
  const editable = ev.status !== "approved";

  // регистрации (только если approved + reg_enabled) — show count, not emails (privacy)
  let registrationsCount = 0;
  if (ev.status === "approved" && ev.registration_enabled) {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", ev.id);
    registrationsCount = count ?? 0;
  }

  return (
    <div className="container-om" style={{ paddingTop: 40, paddingBottom: 96, maxWidth: 920 }}>
      <Link
        href="/dashboard/events"
        className="font-mono inline-block"
        style={{
          fontSize: 11,
          color: "var(--om-ink-500)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 24,
        }}
      >
        ← my events
      </Link>

      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div className="eyebrow">my event</div>
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
      </div>

      <h1
        className="font-display"
        style={{
          fontWeight: 900,
          fontSize: "clamp(36px, 5vw, 56px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          margin: "0 0 12px",
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
          marginBottom: 32,
        }}
      >
        {formatDate(ev.starts_at)}
        {ev.location ? ` · ${ev.location}` : ""}
      </div>

      {ev.status === "rejected" && ev.moderator_note && (
        <div
          style={{
            padding: "16px 20px",
            border: "1px solid var(--om-magenta)",
            color: "var(--om-magenta)",
            fontSize: 14,
            lineHeight: 1.55,
            background: "rgba(232,55,150,0.04)",
            marginBottom: 28,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "var(--om-magenta)", marginBottom: 6 }}
          >
            admin feedback
          </div>
          {ev.moderator_note}
        </div>
      )}

      {ev.status === "approved" && ev.registration_enabled && (
        <div
          className="bg-[var(--om-blue-50)]"
          style={{
            padding: "16px 20px",
            color: "var(--om-blue)",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          <strong>{registrationsCount}</strong> {registrationsCount === 1 ? "registration" : "registrations"} so far.{" "}
          <em style={{ opacity: 0.75 }}>contact admin for full participant list.</em>
        </div>
      )}

      {editable ? (
        <div className="grid gap-4">
          <form
            action={updateMyEvent}
            className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
            style={{ padding: "32px 36px" }}
          >
            <input type="hidden" name="id" value={ev.id} />
            <EventFormFields defaults={ev} clubs={clubs} />
            <div className="md:col-span-2" style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-blue">
                {ev.status === "rejected" ? "resubmit for review" : "save changes"}
              </button>
            </div>
          </form>
          <form action={withdrawMyEvent} className="flex">
            <input type="hidden" name="id" value={ev.id} />
            <button
              type="submit"
              className="btn btn-outline"
              style={{ borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
            >
              withdraw event
            </button>
          </form>
        </div>
      ) : (
        <div
          className="bg-white border border-[var(--om-ink-100)]"
          style={{ padding: "32px 36px" }}
        >
          <p
            className="font-body"
            style={{ fontSize: 15, color: "var(--om-ink-900)", lineHeight: 1.65 }}
          >
            {ev.description ?? "no description"}
          </p>
          <p
            className="font-mono mt-4"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            event approved — contact admin to edit.
          </p>
        </div>
      )}
    </div>
  );
}
