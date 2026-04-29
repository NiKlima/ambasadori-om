import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyMedia, AI_AUTO_APPLY_THRESHOLD } from "@/lib/ai-verify";

const RATE_LIMIT_PER_DAY = 20;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const submissionId = String(body.submissionId ?? "");
  if (!submissionId) return NextResponse.json({ error: "submissionId required" }, { status: 400 });

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, challenges(kind, ai_prompt, ai_check)")
    .eq("id", submissionId)
    .single();

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.trainer_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }
  }

  const challenge = submission.challenges as {
    kind: string;
    ai_prompt: string | null;
    ai_check: boolean;
  } | null;
  if (!challenge?.ai_check || !challenge.ai_prompt) {
    return NextResponse.json({ error: "AI verification is not configured" }, { status: 400 });
  }

  const mediaUrl = submission.video_url || submission.photo_url;
  if (!mediaUrl) return NextResponse.json({ error: "No media" }, { status: 400 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("trainer_id", submission.trainer_id)
    .not("ai_verdict", "is", null)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_PER_DAY) {
    return NextResponse.json({ error: "Daily AI verification limit reached" }, { status: 429 });
  }

  let aiVerdict;
  try {
    aiVerdict = await verifyMedia(challenge.ai_prompt, mediaUrl);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 });
  }

  const autoApply = aiVerdict.confidence >= AI_AUTO_APPLY_THRESHOLD;
  const newStatus = autoApply ? aiVerdict.verdict : "pending";

  const { error: upErr } = await supabase
    .from("submissions")
    .update({
      ai_verdict: aiVerdict,
      status: newStatus,
      moderator_comment: autoApply ? `AI: ${aiVerdict.reasoning}` : null,
      moderated_at: autoApply ? new Date().toISOString() : null,
    })
    .eq("id", submissionId);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, verdict: aiVerdict, status: newStatus });
}
