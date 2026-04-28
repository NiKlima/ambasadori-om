import { createClient } from "@/lib/supabase/server";
import type { Challenge, SurveyQuestion } from "@/lib/types";
import {
  addSurveyQuestion,
  createSurveyChallenge,
  deleteSurveyQuestion,
} from "../actions";

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
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">опросы</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 5vw, 56px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "8px 0 0",
          }}
        >
          ссылки и вопросы.
        </h1>
        <p
          className="font-body mt-3"
          style={{
            fontSize: 14,
            color: "var(--om-ink-500)",
            lineHeight: 1.55,
            maxWidth: 600,
          }}
        >
          опрос — челлендж типа <code>survey_trainee</code>. подопечный заполняет публичную форму, тренер получает баллы.
        </p>
      </div>

      <form
        action={createSurveyChallenge}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">название опроса</div>
          <input className="input mt-2" name="title" required />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">описание</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{
              resize: "none",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">баллы тренеру</div>
          <input
            className="input mt-2"
            name="points"
            type="number"
            min={1}
            defaultValue={10}
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">
            создать опрос
          </button>
        </div>
      </form>

      <div className="grid gap-6">
        {list.map((ch) => {
          const qs = byChallenge.get(ch.id) ?? [];
          const nextPosition = (qs[qs.length - 1]?.position ?? 0) + 1;
          return (
            <div
              key={ch.id}
              className="bg-white border border-[var(--om-ink-100)] grid gap-4"
              style={{ padding: "28px 32px" }}
            >
              <div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {ch.title}
                </div>
                {ch.description && (
                  <div
                    className="font-body mt-1"
                    style={{
                      fontSize: 13,
                      color: "var(--om-ink-500)",
                      lineHeight: 1.55,
                    }}
                  >
                    {ch.description}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                {qs.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3"
                    style={{
                      padding: "12px 14px",
                      background: "var(--om-ink-50)",
                      border: "1px solid var(--om-ink-100)",
                    }}
                  >
                    <div className="min-w-0">
                      <div
                        className="font-display"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {q.position}. {q.text}
                      </div>
                      {q.options.length > 0 && (
                        <div
                          className="font-mono mt-1"
                          style={{
                            fontSize: 11,
                            color: "var(--om-ink-500)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {q.options.map((o) => o.label).join(" · ")}
                        </div>
                      )}
                    </div>
                    <form action={deleteSurveyQuestion}>
                      <input type="hidden" name="id" value={q.id} />
                      <button
                        type="submit"
                        className="font-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--om-magenta)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                        }}
                      >
                        удалить
                      </button>
                    </form>
                  </div>
                ))}
                {qs.length === 0 && (
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 12,
                      color: "var(--om-ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    вопросов нет — добавь первый.
                  </div>
                )}
              </div>

              <form
                action={addSurveyQuestion}
                className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end"
              >
                <input type="hidden" name="challenge_id" value={ch.id} />
                <input type="hidden" name="position" value={nextPosition} />
                <div>
                  <div className="eyebrow eyebrow-ink">текст вопроса</div>
                  <input className="input mt-2" name="text" required />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">варианты · по строке</div>
                  <textarea
                    className="input mt-2"
                    name="options"
                    rows={2}
                    style={{
                      resize: "none",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-blue">
                  добавить
                </button>
              </form>
            </div>
          );
        })}
        {list.length === 0 && (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{
              padding: "40px 28px",
              textAlign: "center",
              color: "var(--om-ink-500)",
              fontSize: 14,
            }}
          >
            опросов нет. создай первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
