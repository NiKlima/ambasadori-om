import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Challenge, Submission } from "@/lib/types";
import { HeroCard } from "@/components/HeroCard";
import { VideoAccordion } from "@/components/VideoAccordion";
import { SubmissionForm } from "./SubmissionForm";

const KIND_BADGE: Record<Challenge["kind"], string> = {
  photo_ai: "Фото · AI",
  video_ai: "Видео · AI",
  survey_trainee: "Опрос подопечного",
  manual: "Модерация",
};

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: challenges }, { data: submissions }, { data: profile }] = await Promise.all([
    supabase.from("challenges").select("*").eq("active", true).order("points", { ascending: false }),
    supabase.from("submissions").select("*").eq("trainer_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("promo_code").eq("id", user.id).single(),
  ]);

  const myByChallenge = new Map<string, Submission[]>();
  for (const s of (submissions ?? []) as Submission[]) {
    if (!myByChallenge.has(s.challenge_id)) myByChallenge.set(s.challenge_id, []);
    myByChallenge.get(s.challenge_id)!.push(s);
  }

  const statusLabel: Record<string, { t: string; c: string }> = {
    pending: { t: "На модерации", c: "bg-om-sand text-om-ink" },
    approved: { t: "Одобрено", c: "bg-om-green/15 text-om-green" },
    rejected: { t: "Отклонено", c: "bg-om-coral/15 text-om-coral" },
  };

  const promo = profile?.promo_code ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Челленджи</h1>
        <p className="text-om-muted mt-2">Выполняй, загружай подтверждение — баллы приходят после одобрения.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {((challenges ?? []) as Challenge[]).map((ch) => {
          const mine = myByChallenge.get(ch.id) ?? [];
          const surveyHref = ch.kind === "survey_trainee" && promo
            ? `/survey/${ch.id}?ref=${encodeURIComponent(promo)}`
            : null;
          return (
            <div key={ch.id} className="space-y-3">
              <HeroCard
                coverUrl={ch.cover_url}
                title={ch.title}
                subtitle={ch.description}
                meta={`+${ch.points}`}
                badge={KIND_BADGE[ch.kind]}
              />

              {ch.intro_video_url && (
                <VideoAccordion url={ch.intro_video_url} />
              )}

              {mine.length > 0 && (
                <div className="space-y-1">
                  {mine.slice(0, 2).map((s) => {
                    const lbl = statusLabel[s.status];
                    return (
                      <div key={s.id} className="flex items-center justify-between text-xs">
                        <span className="text-om-muted">{formatDate(s.created_at)}</span>
                        <span className={`rounded-full px-2 py-0.5 ${lbl.c}`}>{lbl.t}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {ch.kind === "survey_trainee" ? (
                <div className="rounded-2xl bg-white border border-black/5 p-4 space-y-2">
                  <p className="text-xs text-om-muted">
                    Поделись ссылкой с подопечным — баллы придут автоматически после прохождения.
                  </p>
                  {surveyHref ? (
                    <Link
                      href="/dashboard/surveys"
                      className="inline-flex rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm hover:bg-om-blue-dark transition"
                    >
                      Получить ссылку
                    </Link>
                  ) : (
                    <p className="text-xs text-om-coral">
                      Сначала задай свой промокод — он работает как реф-код в ссылке.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-black/5 p-4">
                  <SubmissionForm challengeId={ch.id} kind={ch.kind} />
                </div>
              )}
            </div>
          );
        })}
        {(!challenges || challenges.length === 0) && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-white p-8 text-om-muted">
            Челленджи появятся скоро. Следи за обновлениями в кабинете.
          </div>
        )}
      </div>
    </div>
  );
}
