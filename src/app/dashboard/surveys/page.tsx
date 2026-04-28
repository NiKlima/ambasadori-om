import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Challenge, SurveyResponse } from "@/lib/types";
import { ShareLink } from "./ShareLink";

export default async function MySurveysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: challenges }, { data: responses }] = await Promise.all([
    supabase.from("profiles").select("promo_code").eq("id", user.id).single(),
    supabase
      .from("challenges")
      .select("*")
      .eq("kind", "survey_trainee")
      .eq("active", true)
      .order("points", { ascending: false }),
    supabase
      .from("survey_responses")
      .select("*")
      .eq("trainer_id", user.id)
      .order("submitted_at", { ascending: false }),
  ]);

  const promo = profile?.promo_code ?? null;

  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const list = (challenges ?? []) as Challenge[];
  const byChallenge = new Map<string, SurveyResponse[]>();
  for (const r of (responses ?? []) as SurveyResponse[]) {
    if (!byChallenge.has(r.challenge_id)) byChallenge.set(r.challenge_id, []);
    byChallenge.get(r.challenge_id)!.push(r);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Опросы для подопечных</h1>
        <p className="text-om-muted mt-2">
          Скопируй ссылку и отправь подопечному. После прохождения баллы придут автоматически.
        </p>
      </div>

      {!promo && (
        <div className="rounded-3xl bg-om-coral/10 text-om-coral p-6">
          У тебя не задан промокод — без него ссылка не работает. Установи его в{" "}
          <a className="underline" href="/dashboard/profile">профиле</a>{" "}
          или попроси админа.
        </div>
      )}

      <div className="space-y-4">
        {list.map((ch) => {
          const url = promo ? `${origin}/survey/${ch.id}?ref=${encodeURIComponent(promo)}` : "";
          const got = byChallenge.get(ch.id) ?? [];
          return (
            <div key={ch.id} className="rounded-3xl bg-white p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{ch.title}</div>
                  <div className="text-om-muted text-sm mt-1">{ch.description}</div>
                </div>
                <div className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs font-semibold px-3 py-1">
                  +{ch.points}
                </div>
              </div>

              {url && <ShareLink url={url} />}

              {got.length > 0 && (
                <div className="border-t border-black/5 pt-4">
                  <div className="text-xs uppercase tracking-wider text-om-muted mb-2">
                    Прошли ({got.length})
                  </div>
                  <div className="divide-y divide-black/5">
                    {got.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                        <div>
                          <div className="font-medium">{r.trainee_name ?? r.trainee_email}</div>
                          <div className="text-om-muted text-xs">{r.trainee_email}</div>
                        </div>
                        <div className="text-om-muted text-xs">{formatDate(r.submitted_at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-om-muted">
            Опросов пока нет. Админ может добавить их в админке.
          </div>
        )}
      </div>
    </div>
  );
}
