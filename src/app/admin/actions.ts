"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadCover } from "@/lib/upload";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authorised");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("No permission");
  return { supabase, user };
}

// ===== TRAINERS =====

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
  const club_idRaw = String(formData.get("club_id") ?? "").trim();
  const club_id = club_idRaw || null;
  const sport = String(formData.get("sport") ?? "").trim() || null;
  const promo_code = String(formData.get("promo_code") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const quote = String(formData.get("quote") ?? "").trim() || null;
  const story = String(formData.get("story") ?? "").trim() || null;
  const intro_video_url = String(formData.get("intro_video_url") ?? "").trim() || null;
  const birthdateRaw = String(formData.get("birthdate") ?? "").trim();
  const birthdate = birthdateRaw || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  // achievements: одна строка = одно достижение
  const achievementsRaw = String(formData.get("achievements") ?? "").trim();
  const achievements = achievementsRaw
    ? achievementsRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  // socials как jsonb
  const socials: Record<string, string> = {};
  for (const k of ["instagram", "tiktok", "telegram", "youtube"] as const) {
    const v = String(formData.get(`social_${k}`) ?? "").trim().replace(/^@/, "");
    if (v) socials[k] = v;
  }

  // photo upload (через service role чтобы обойти RLS на avatars)
  const photo = formData.get("photo") as File | null;
  let photo_url: string | undefined;
  if (photo && photo.size > 0) {
    const admin = createAdminClient();
    const url = await uploadCover(admin, "avatars", `${id}`, photo);
    if (url) photo_url = url;
  }

  const patch: Record<string, unknown> = {
    full_name,
    club,
    club_id,
    sport,
    promo_code,
    bio,
    quote,
    story,
    intro_video_url,
    birthdate,
    achievements,
    socials,
    sort_order,
  };
  if (photo_url) patch.photo_url = photo_url;
  await supabase.from("profiles").update(patch).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
  revalidatePath(`/trainers/${id}`);
}

// ===== CHALLENGES =====

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
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const cover = formData.get("cover") as File | null;
  if (!title) return;

  const cover_url = cover && cover.size > 0
    ? await uploadCover(supabase, "covers", "challenges", cover)
    : null;

  await supabase.from("challenges").insert({
    title, description, points, requires_moderation, kind, ai_prompt, ai_check, cover_url, intro_video_url, sort_order,
  });
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/");
}

export async function updateChallenge(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const points = Number(formData.get("points") ?? 0);
  const requires_moderation = formData.get("requires_moderation") === "on";
  const kind = String(formData.get("kind") ?? "manual");
  const ai_prompt = String(formData.get("ai_prompt") ?? "").trim() || null;
  const ai_check = (kind === "photo_ai" || kind === "video_ai") && !!ai_prompt;
  const intro_video_url = String(formData.get("intro_video_url") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const cover = formData.get("cover") as File | null;
  if (!title) return;

  const patch: Record<string, unknown> = {
    title, description, points, requires_moderation, kind, ai_prompt, ai_check, intro_video_url, sort_order,
  };
  if (cover && cover.size > 0) {
    const cover_url = await uploadCover(supabase, "covers", "challenges", cover);
    if (cover_url) patch.cover_url = cover_url;
  }
  await supabase.from("challenges").update(patch).eq("id", id);
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/");
}

export async function toggleChallenge(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("challenges").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/");
}

export async function deleteChallenge(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  // safety: проверяем submissions
  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", id);
  if ((count ?? 0) > 0) {
    throw new Error(`Cannot delete: ${count} submissions exist. Archive instead.`);
  }
  await supabase.from("challenges").delete().eq("id", id);
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/");
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

// ===== PRODUCTS =====

export async function createProduct(formData: FormData) {
  const { supabase } = await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "merch");
  const price_points = Number(formData.get("price_points") ?? 0);
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const stock = stockRaw === "" ? null : Number(stockRaw);
  const featured = formData.get("featured") === "on";
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const cover = formData.get("cover") as File | null;
  if (!title || !price_points) return;

  const cover_url = cover && cover.size > 0
    ? await uploadCover(supabase, "covers", "products", cover)
    : null;

  await supabase.from("products").insert({
    title, description, kind, price_points, stock, cover_url, featured, sort_order,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  revalidatePath("/");
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "merch");
  const price_points = Number(formData.get("price_points") ?? 0);
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const stock = stockRaw === "" ? null : Number(stockRaw);
  const featured = formData.get("featured") === "on";
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const cover = formData.get("cover") as File | null;
  if (!title || !price_points) return;

  const patch: Record<string, unknown> = {
    title, description, kind, price_points, stock, featured, sort_order,
  };
  if (cover && cover.size > 0) {
    const cover_url = await uploadCover(supabase, "covers", "products", cover);
    if (cover_url) patch.cover_url = cover_url;
  }
  await supabase.from("products").update(patch).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  revalidatePath("/");
}

export async function toggleProduct(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("products").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  revalidatePath("/");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);
  if ((count ?? 0) > 0) {
    throw new Error(`Cannot delete: ${count} orders exist. Archive instead.`);
  }
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  revalidatePath("/");
}

// ===== ORDERS =====

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

// ===== SURVEYS =====

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

// ===== POINTS =====

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

// ===== REORDER (generic up/down sort_order swap) =====

const REORDER_TABLES = ["challenges", "products", "events", "clubs", "profiles"] as const;
type ReorderTable = (typeof REORDER_TABLES)[number];

export async function reorderEntity(formData: FormData) {
  const { supabase } = await assertAdmin();
  const table = String(formData.get("table")) as ReorderTable;
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction")); // "up" | "down"
  if (!REORDER_TABLES.includes(table) || !id) return;

  // получаем текущий sort_order
  const { data: current } = await supabase
    .from(table)
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (!current) return;

  // ищем соседа
  const op = direction === "up" ? "gt" : "lt";
  const sortDir = direction === "up" ? { ascending: true } : { ascending: false };
  const { data: neighbor } = await supabase
    .from(table)
    .select("id, sort_order")
    .filter("sort_order", op, current.sort_order)
    .order("sort_order", sortDir)
    .limit(1)
    .maybeSingle();
  if (!neighbor) return;

  // свапаем
  await supabase.from(table).update({ sort_order: neighbor.sort_order }).eq("id", current.id);
  await supabase.from(table).update({ sort_order: current.sort_order }).eq("id", neighbor.id);

  revalidatePath(`/admin/${table === "profiles" ? "" : table}`);
  revalidatePath("/");
}

// ===== CLUBS =====

export async function createClub(formData: FormData) {
  const { supabase } = await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const sport_focus = String(formData.get("sport_focus") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || "Chișinău";
  const website = String(formData.get("website") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const logo = formData.get("logo") as File | null;
  if (!name) return;

  const logo_url = logo && logo.size > 0
    ? await uploadCover(supabase, "covers", "clubs", logo)
    : null;

  await supabase.from("clubs").insert({
    name, slug, description, sport_focus, city, website, sort_order, logo_url,
  });
  revalidatePath("/admin/clubs");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}

export async function updateClub(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const sport_focus = String(formData.get("sport_focus") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || "Chișinău";
  const website = String(formData.get("website") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const logo = formData.get("logo") as File | null;
  if (!name) return;

  const patch: Record<string, unknown> = {
    name, slug, description, sport_focus, city, website, sort_order,
  };
  if (logo && logo.size > 0) {
    const logo_url = await uploadCover(supabase, "covers", "clubs", logo);
    if (logo_url) patch.logo_url = logo_url;
  }
  await supabase.from("clubs").update(patch).eq("id", id);
  revalidatePath("/admin/clubs");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}

export async function toggleClub(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("clubs").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/clubs");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}

export async function deleteClub(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id"));
  // unlink trainers
  await supabase.from("profiles").update({ club_id: null }).eq("club_id", id);
  await supabase.from("clubs").delete().eq("id", id);
  revalidatePath("/admin/clubs");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}
