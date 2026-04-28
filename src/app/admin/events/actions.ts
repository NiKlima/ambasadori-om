"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Нет прав");
  return { supabase, user };
}

export async function createEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover_url = String(formData.get("cover_url") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "community");
  const starts_at_raw = String(formData.get("starts_at") ?? "").trim();
  const ends_at_raw = String(formData.get("ends_at") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim() || null;
  if (!title || !starts_at_raw) return;
  const starts_at = new Date(starts_at_raw).toISOString();
  const ends_at = ends_at_raw ? new Date(ends_at_raw).toISOString() : null;

  await supabase.from("events").insert({
    title, description, cover_url, kind, starts_at, ends_at, location, link,
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function toggleEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await supabase.from("events").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
