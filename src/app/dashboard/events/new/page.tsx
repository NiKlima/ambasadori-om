import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Club } from "@/lib/types";
import { EventFormFields } from "@/components/EventForm";
import { proposeEvent } from "../actions";

export default async function ProposeEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: clubsRaw } = await supabase
    .from("clubs")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: false });
  const clubs = (clubsRaw ?? []) as Club[];

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

      <div className="eyebrow">propose event</div>
      <h1
        className="font-display"
        style={{
          fontWeight: 900,
          fontSize: "clamp(40px, 5vw, 56px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          margin: "8px 0 28px",
        }}
      >
        new session.
      </h1>

      <form
        action={proposeEvent}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "32px 36px" }}
      >
        <EventFormFields clubs={clubs} />
        <div className="md:col-span-2 flex gap-3 flex-wrap" style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-blue">
            submit for review
          </button>
          <Link href="/dashboard/events" className="btn btn-outline">
            cancel
          </Link>
        </div>
        <p
          className="md:col-span-2 font-mono"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 4,
          }}
        >
          after submission — admin reviews and publishes on /events.
        </p>
      </form>
    </div>
  );
}
