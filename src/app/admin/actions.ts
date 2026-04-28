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

export async function toggleTrainer(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("profiles").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateTrainer(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const full_name = String(formData.get("full_name") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim() || null;
  const sport = String(formData.get("sport") ?? "").trim() || null;
  const promo_code = String(formData.get("promo_code") ?? "").trim() || null;
  await supabase.from("profiles").update({ full_name, club, sport, promo_code }).eq("id", id);
  revalidatePath("/admin");
}

export async function createChallenge(formData: FormData) {
  const { supabase } = await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const points = Number(formData.get("points") ?? 0);
  const requires_moderation = formData.get("requires_moderation") === "on";
  const kind = String(formData.get("kind") ?? "manual");
  const ai_prompt = String(formData.get("ai_prompt") ?? "").trim() || null;
  const ai_check = (kind === "photo_ai" || kind === "video_ai") && !!ai_prompt;
  const intro_video_url = String(formData.get("intro_video_url") ?? "").trim() || null;
  const cover = formData.get("cover") as File | null;
  if (!title) return;

  let cover_url: string | null = null;
  if (cover && cover.size > 0) {
    const ext = cover.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `challenges/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, cover, { contentType: cover.type, upsert: false });
    if (!upErr) {
      cover_url = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
    }
  }

  await supabase.from("challenges").insert({
    title, description, points, requires_moderation, kind, ai_prompt, ai_check, cover_url, intro_video_url,
  });
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard/challenges");
}

export async function toggleChallenge(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("challenges").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/challenges");
}

export async function moderateSubmission(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const comment = String(formData.get("comment") ?? "").trim() || null;

  const status = action === "approve" ? "approved" : "rejected";
  await supabase
    .from("submissions")
    .update({
      status,
      moderator_comment: comment,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin/moderation");
}

export async function createProduct(formData: FormData) {
  const { supabase } = await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "merch");
  const price_points = Number(formData.get("price_points") ?? 0);
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const stock = stockRaw === "" ? null : Number(stockRaw);
  const cover = formData.get("cover") as File | null;
  if (!title || !price_points) return;

  let cover_url: string | null = null;
  if (cover && cover.size > 0) {
    const ext = cover.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `products/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, cover, { contentType: cover.type, upsert: false });
    if (!upErr) {
      cover_url = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
    }
  }

  await supabase.from("products").insert({ title, description, kind, price_points, stock, cover_url });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
}

export async function toggleProduct(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("products").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const admin_note = String(formData.get("admin_note") ?? "").trim() || null;
  const patch: Record<string, unknown> = { status, admin_note };
  if (status === "fulfilled") patch.fulfilled_at = new Date().toISOString();
  await supabase.from("orders").update(patch).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
}

export async function createSurveyChallenge(formData: FormData) {
  const { supabase } = await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const points = Number(formData.get("points") ?? 0);
  if (!title) return;
  const { data: ch } = await supabase
    .from("challenges")
    .insert({ title, description, points, kind: "survey_trainee", requires_moderation: false, ai_check: false })
    .select("id")
    .single();
  if (!ch) return;
  revalidatePath("/admin/surveys");
}

export async function addSurveyQuestion(formData: FormData) {
  const { supabase } = await assertAdmin();
  const challenge_id = String(formData.get("challenge_id"));
  const text = String(formData.get("text") ?? "").trim();
  const optionsRaw = String(formData.get("options") ?? "").trim();
  const position = Number(formData.get("position") ?? 1);
  if (!challenge_id || !text) return;
  const options = optionsRaw
    ? optionsRaw.split("\n").map((s) => s.trim()).filter(Boolean).map((label) => ({ label }))
    : [];
  await supabase.from("survey_questions").insert({ challenge_id, text, options, position });
  revalidatePath("/admin/surveys");
}

export async function deleteSurveyQuestion(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  await supabase.from("survey_questions").delete().eq("id", id);
  revalidatePath("/admin/surveys");
}

export async function awardPoints(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const trainer_id = String(formData.get("trainer_id"));
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  if (!trainer_id || !amount || !reason) return;
  await supabase.from("point_transactions").insert({
    trainer_id,
    amount,
    reason,
    created_by: user.id,
  });
  revalidatePath("/admin/points");
  revalidatePath("/admin");
}
