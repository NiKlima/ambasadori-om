"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadCover } from "@/lib/upload";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authorised");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("No permission");
  return { supabase, user };
}

function parseEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover_url_input = String(formData.get("cover_url") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "community");
  const starts_at_raw = String(formData.get("starts_at") ?? "").trim();
  const ends_at_raw = String(formData.get("ends_at") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const host_trainer_id = String(formData.get("host_trainer_id") ?? "").trim() || null;
  const host_club_id = String(formData.get("host_club_id") ?? "").trim() || null;
  const registration_enabled = formData.get("registration_enabled") === "on";
  const maxRaw = String(formData.get("max_participants") ?? "").trim();
  const max_participants = maxRaw === "" ? null : Number(maxRaw);
  return {
    title, description, cover_url_input, kind, starts_at_raw, ends_at_raw,
    location, link, sort_order, host_trainer_id, host_club_id,
    registration_enabled, max_participants,
  };
}

export async function createEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertAdmin();
  const f = parseEventForm(formData);
  if (!f.title || !f.starts_at_raw) return;
  const starts_at = new Date(f.starts_at_raw).toISOString();
  const ends_at = f.ends_at_raw ? new Date(f.ends_at_raw).toISOString() : null;

  const cover = formData.get("cover") as File | null;
  let cover_url: string | null = f.cover_url_input;
  if (cover && cover.size > 0) {
    const uploaded = await uploadCover(supabase, "covers", "events", cover);
    if (uploaded) cover_url = uploaded;
  }

  const { error } = await supabase.from("events").insert({
    title: f.title,
    description: f.description,
    cover_url,
    kind: f.kind,
    starts_at,
    ends_at,
    location: f.location,
    link: f.link,
    sort_order: f.sort_order,
    host_trainer_id: f.host_trainer_id,
    host_club_id: f.host_club_id,
    registration_enabled: f.registration_enabled,
    max_participants: f.max_participants,
    // admin-created events bypass moderation
    status: "approved",
    created_by: user.id,
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const f = parseEventForm(formData);
  if (!f.title || !f.starts_at_raw) return;
  const starts_at = new Date(f.starts_at_raw).toISOString();
  const ends_at = f.ends_at_raw ? new Date(f.ends_at_raw).toISOString() : null;

  const patch: Record<string, unknown> = {
    title: f.title,
    description: f.description,
    kind: f.kind,
    starts_at,
    ends_at,
    location: f.location,
    link: f.link,
    sort_order: f.sort_order,
    host_trainer_id: f.host_trainer_id,
    host_club_id: f.host_club_id,
    registration_enabled: f.registration_enabled,
    max_participants: f.max_participants,
  };
  if (f.cover_url_input) patch.cover_url = f.cover_url_input;

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const uploaded = await uploadCover(supabase, "covers", "events", cover);
    if (uploaded) patch.cover_url = uploaded;
  }

  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/");
}

export async function approveEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("moderator_note") ?? "").trim() || null;
  if (!id) return;
  const { error } = await supabase
    .from("events")
    .update({
      status: "approved",
      moderator_note: note,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function rejectEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("moderator_note") ?? "").trim() || null;
  if (!id) return;
  const { error } = await supabase
    .from("events")
    .update({
      status: "rejected",
      moderator_note: note,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function toggleEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  const { error } = await supabase.from("events").update({ active: !active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteRegistration(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const eventId = String(formData.get("event_id") ?? "");
  if (!id) return;
  await supabase.from("event_registrations").delete().eq("id", id);
  if (eventId) revalidatePath(`/admin/events/${eventId}/registrations`);
}
