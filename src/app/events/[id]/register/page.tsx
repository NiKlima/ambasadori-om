import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { findFallbackEvent } from "@/lib/fallback-events";
import { RegistrationForm } from "./RegistrationForm";

type Params = Promise<{ id: string }>;

export const metadata = { title: "register · OM Ambasadori" };

export default async function EventRegisterPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evRaw } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .eq("status", "approved")
    .maybeSingle();
  const ev = (evRaw as Event | null) ?? findFallbackEvent(id);
  if (!ev) notFound();
  // fallback events не имеют real registration_enabled — 404 для /register
  if (!ev.registration_enabled) notFound();

  // preset for logged-in users
  const { data: { user } } = await supabase.auth.getUser();
  let presetName = "";
  let presetEmail = user?.email ?? "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    presetName = (profile?.full_name as string | undefined) ?? "";
  }

  return (
    <>
      <SiteHeader />
      <section className="bg-[var(--om-ink-50)]" style={{ padding: "64px 0 96px" }}>
        <div className="container-om grid md:grid-cols-[1fr_1.2fr] gap-12" style={{ maxWidth: 1100 }}>
          <div>
            <Link
              href={`/events/${ev.id}`}
              className="font-mono inline-block"
              style={{
                fontSize: 11,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 24,
              }}
            >
              ← event
            </Link>
            <div className="eyebrow">registration</div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(40px, 6vw, 72px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                margin: "12px 0 16px",
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
                lineHeight: 1.55,
              }}
            >
              {formatDate(ev.starts_at)}
              {ev.location ? <><br />📍 {ev.location}</> : null}
            </div>
            {ev.description && (
              <p
                className="font-body mt-6"
                style={{
                  fontSize: 14,
                  color: "var(--om-ink-500)",
                  lineHeight: 1.65,
                  maxWidth: 420,
                }}
              >
                {ev.description.slice(0, 220)}
                {ev.description.length > 220 ? "…" : ""}
              </p>
            )}
          </div>

          <RegistrationForm
            eventId={ev.id}
            presetName={presetName}
            presetEmail={presetEmail}
          />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
