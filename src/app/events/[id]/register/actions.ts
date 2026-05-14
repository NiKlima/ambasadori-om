"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerForEvent(formData: FormData) {
  const eventId = String(formData.get("event_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const consent = formData.get("consent") === "on";

  if (!eventId) return { error: "Invalid event" };
  if (!name) return { error: "Name is required" };
  if (!EMAIL_RE.test(email)) return { error: "Valid email is required" };
  if (!consent) return { error: "Consent is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use admin (service role) — public anonymous insert needs to bypass user-context RLS quirks
  const admin = createAdminClient();

  // Verify event is open for registration
  const { data: ev } = await admin
    .from("events")
    .select("id, status, registration_enabled, max_participants, active")
    .eq("id", eventId)
    .single();

  if (!ev || !ev.active || ev.status !== "approved") {
    return { error: "Event not available" };
  }
  if (!ev.registration_enabled) {
    return { error: "Registration is not enabled for this event" };
  }

  // Capacity check
  if (ev.max_participants) {
    const { count } = await admin
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);
    if ((count ?? 0) >= ev.max_participants) {
      return { error: "Event is full" };
    }
  }

  const { error } = await admin.from("event_registrations").insert({
    event_id: eventId,
    user_id: user?.id ?? null,
    name,
    email,
    phone,
    note,
    consent: true,
  });

  if (error) {
    // unique violation = already registered
    if (error.code === "23505") {
      return { error: "This email is already registered for this event" };
    }
    return { error: error.message };
  }

  redirect(`/events/${eventId}/register/thanks`);
}
