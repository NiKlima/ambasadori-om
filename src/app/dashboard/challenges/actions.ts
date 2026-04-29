"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AI_AUTO_APPLY_THRESHOLD, verifyMedia } from "@/lib/ai-verify";

export async function submitChallenge(formData: FormData) {
  const challengeId = String(formData.get("challenge_id"));
  const note = String(formData.get("note") ?? "");
  const link = String(formData.get("link") ?? "");
  const photo = formData.get("photo") as File | null;
  const video = formData.get("video") as File | null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authorised" };

  const { data: challenge } = await supabase
    .from("challenges")
    .select("kind, ai_prompt, ai_check")
    .eq("id", challengeId)
    .single();
  if (!challenge) return { error: "Challenge not found" };

  let photo_url: string | null = null;
  let video_url: string | null = null;

  async function uploadTo(folder: string, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("submissions")
      .upload(path, file, { contentType: file.type });
    if (upErr) throw new Error(upErr.message);
    return supabase.storage.from("submissions").getPublicUrl(path).data.publicUrl;
  }

  try {
    if (photo && photo.size > 0) photo_url = await uploadTo("photos", photo);
    if (video && video.size > 0) video_url = await uploadTo("videos", video);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload error" };
  }

  const { data: created, error } = await supabase
    .from("submissions")
    .insert({
      trainer_id: user.id,
      challenge_id: challengeId,
      photo_url,
      video_url,
      link: link || null,
      note: note || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  let aiStatus: "approved" | "rejected" | "pending" | null = null;
  const wantAi =
    challenge.ai_check &&
    challenge.ai_prompt &&
    (challenge.kind === "photo_ai" || challenge.kind === "video_ai");
  const mediaForAi = video_url || photo_url;
  if (wantAi && mediaForAi && created) {
    try {
      const aiVerdict = await verifyMedia(challenge.ai_prompt as string, mediaForAi);
      const autoApply = aiVerdict.confidence >= AI_AUTO_APPLY_THRESHOLD;
      aiStatus = autoApply ? aiVerdict.verdict : "pending";
      await supabase
        .from("submissions")
        .update({
          ai_verdict: aiVerdict,
          status: aiStatus,
          moderator_comment: autoApply ? `AI: ${aiVerdict.reasoning}` : null,
          moderated_at: autoApply ? new Date().toISOString() : null,
        })
        .eq("id", created.id);
    } catch {
      // AI failed — leave pending for manual review
    }
  }

  revalidatePath("/dashboard/challenges");
  revalidatePath("/dashboard");
  return { ok: true, aiStatus };
}
