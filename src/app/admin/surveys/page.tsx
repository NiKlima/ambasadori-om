import { createClient } from "@/lib/supabase/server";
import type { Challenge, SurveyQuestion } from "@/lib/types";
import { addSurveyQuestion, createSurveyChallenge, deleteSurveyQuestion } from "../actions";

export default async function AdminSurveysPage() {
  const supabase = await createClient();
  const [{ data: challenges }, { data: questions }] = await Promise.all([
    supabase
      .from("challenges")
      .select("*")
      .eq("kind", "survey_trainee")
      .order("created_at", { ascending: false }),
    supabase.from("survey_questions").select("*").order("position"),
  ]);

  const list = (challenges ?? []) as Challenge[];
  const byChallenge = new Map<string, SurveyQuestion[]>();
  for (const q of (questions ?? []) as SurveyQuestion[]) {
    if (!byChallenge.has(q.challenge_id)) byChallenge.set(q.challenge_id, []);
    byChallenge.get(q.challenge_id)!.push(q);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Опросы</h1>
        <p className="text-om-muted mt-2">
          Опрос — челлендж типа <code>survey_trainee</code>. Подопечный заполняет публичную форму, тренер получает баллы.
        </p>
      </div>

      <form action={createSurveyChallenge} className="rounded-3xl bg-white p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Название опроса</label>
          <input name="title" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Описание</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Баллы тренеру</label>
          <input name="points" type="number" min={1} defaultValue={10} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Создать опрос</button>
        </div>
      </form>

      <div className="space-y-6">
        {list.map((ch) => {
          const qs = byChallenge.get(ch.id) ?? [];
          const nextPosition = (qs[qs.length - 1]?.position ?? 0) + 1;
          return (
            <div key={ch.id} className="rounded-3xl bg-white p-6 space-y-4">
              <div>
                <div className="text-lg font-semibold">{ch.title}</div>
                <div className="text-om-muted text-sm mt-1">{ch.description}</div>
              </div>

              <div className="space-y-2">
                {qs.map((q) => (
                  <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl bg-om-cream p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{q.position}. {q.text}</div>
                      {q.options.length > 0 && (
                        <div className="text-xs text-om-muted mt-1">
                          {q.options.map((o) => o.label).join(" · ")}
                        </div>
                      )}
                    </div>
                    <form action={deleteSurveyQuestion}>
                      <input type="hidden" name="id" value={q.id} />
                      <button className="text-xs text-om-coral hover:underline">Удалить</button>
                    </form>
                  </div>
                ))}
                {qs.length === 0 && (
                  <div className="text-om-muted text-sm">Вопросов нет — добавь первый.</div>
                )}
              </div>

              <form action={addSurveyQuestion} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <input type="hidden" name="challenge_id" value={ch.id} />
                <input type="hidden" name="position" value={nextPosition} />
                <div>
                  <label className="text-xs uppercase text-om-muted block mb-1">Текст вопроса</label>
                  <input name="text" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs uppercase text-om-muted block mb-1">Варианты (по строке; пусто = свободный ответ)</label>
                  <textarea name="options" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                </div>
                <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Добавить</button>
              </form>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-om-muted">
            Опросов нет. Создай первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
