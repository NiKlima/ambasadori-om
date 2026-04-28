import { createClient } from "@/lib/supabase/server";
import type { Challenge, Submission } from "@/lib/types";
import { ChallengesGrid } from "./ChallengesGrid";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: challenges }, { data: submissions }, { data: profile }] = await Promise.all([
    supabase.from("challenges").select("*").eq("active", true).order("points", { ascending: false }),
    supabase.from("submissions").select("*").eq("trainer_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("promo_code").eq("id", user.id).single(),
  ]);

  const byChallenge: Record<string, Submission[]> = {};
  for (const s of (submissions ?? []) as Submission[]) {
    if (!byChallenge[s.challenge_id]) byChallenge[s.challenge_id] = [];
    byChallenge[s.challenge_id].push(s);
  }

  const promo: string = profile?.promo_code ?? "";

  return (
    <ChallengesGrid
      challenges={(challenges ?? []) as Challenge[]}
      byChallenge={byChallenge}
      promo={promo}
    />
  );
}
