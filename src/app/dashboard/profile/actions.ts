"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const full_name = String(formData.get("full_name") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim() || null;
  const sport = String(formData.get("sport") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const birthdate = String(formData.get("birthdate") ?? "").trim() || null;
  const quote = String(formData.get("quote") ?? "").trim() || null;
  const story = String(formData.get("story") ?? "").trim() || null;
  const intro_video_url = String(formData.get("intro_video_url") ?? "").trim() || null;

  const socials: Record<string, string> = {};
  for (const key of ["instagram", "tiktok", "telegram", "youtube"]) {
    const v = String(formData.get(key) ?? "").trim();
    if (v) socials[key] = v;
  }

  const achievements = String(formData.get("achievements") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, club, sport, bio, birthdate, socials, achievements, quote, story, intro_video_url })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/leaderboard");
}
