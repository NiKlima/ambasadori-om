"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadCover } from "@/lib/upload";

async function assertTrainer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authorised");
  return { supabase, user };
}

function parseTrainerEventForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    kind: String(formData.get("kind") ?? "community"),
    starts_at_raw: String(formData.get("starts_at") ?? "").trim(),
    ends_at_raw: String(formData.get("ends_at") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim() || null,
    link: String(formData.get("link") ?? "").trim() || null,
    host_club_id: String(formData.get("host_club_id") ?? "").trim() || null,
    registration_enabled: formData.get("registration_enabled") === "on",
    max_participants: (() => {
      const raw = String(formData.get("max_participants") ?? "").trim();
      return raw === "" ? null : Number(raw);
    })(),
  };
}

export async function proposeEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertTrainer();
  const f = parseTrainerEventForm(formData);
  if (!f.title || !f.starts_at_raw) return;
  const starts_at = new Date(f.starts_at_raw).toISOString();
  const ends_at = f.ends_at_raw ? new Date(f.ends_at_raw).toISOString() : null;

  const cover = formData.get("cover") as File | null;
  const cover_url = cover && cover.size > 0
    ? await uploadCover(supabase, "covers", "events", cover)
    : null;

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: f.title,
      description: f.description,
      cover_url,
      kind: f.kind,
      starts_at,
      ends_at,
      location: f.location,
      link: f.link,
      host_club_id: f.host_club_id,
      host_trainer_id: user.id,
      created_by: user.id,
      status: "pending",
      registration_enabled: f.registration_enabled,
      max_participants: f.max_participants,
      active: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/events");
  if (data?.id) redirect(`/dashboard/events/${data.id}`);
}

export async function updateMyEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertTrainer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const f = parseTrainerEventForm(formData);
  if (!f.title || !f.starts_at_raw) return;
  const starts_at = new Date(f.starts_at_raw).toISOString();
  const ends_at = f.ends_at_raw ? new Date(f.ends_at_raw).toISOString() : null;

  // safety: можно править только свои pending/draft/rejected events
  const { data: existing } = await supabase
    .from("events")
    .select("id, created_by, status")
    .eq("id", id)
    .single();
  if (!existing || existing.created_by !== user.id) {
    throw new Error("Cannot edit this event");
  }
  if (!["pending", "draft", "rejected"].includes(existing.status as string)) {
    throw new Error("Event already moderated — cannot edit");
  }

  const patch: Record<string, unknown> = {
    title: f.title,
    description: f.description,
    kind: f.kind,
    starts_at,
    ends_at,
    location: f.location,
    link: f.link,
    host_club_id: f.host_club_id,
    registration_enabled: f.registration_enabled,
    max_participants: f.max_participants,
    // если был rejected — снова идёт на модерацию
    status: "pending",
    moderator_note: null,
  };

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const uploaded = await uploadCover(supabase, "covers", "events", cover);
    if (uploaded) patch.cover_url = uploaded;
  }

  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath("/admin/events");
}

export async function withdrawMyEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await assertTrainer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data: existing } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", id)
    .single();
  if (!existing || existing.created_by !== user.id) {
    throw new Error("Cannot withdraw this event");
  }
  await supabase.from("events").update({ active: false }).eq("id", id);
  revalidatePath("/dashboard/events");
}
