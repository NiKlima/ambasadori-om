import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/types";
import { createChallenge, toggleChallenge } from "../actions";

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (data ?? []) as Challenge[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">челленджи</div>
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
          создавай и архивируй активности.
        </h1>
      </div>

      <form
        action={createChallenge}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">название</div>
          <input
            className="input mt-2"
            name="title"
            required
            placeholder="фото с OM на тренировке"
          />
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
          <div className="eyebrow eyebrow-ink">тип</div>
          <select className="input mt-2" name="kind" defaultValue="manual">
            <option value="manual">manual — ручная модерация</option>
            <option value="photo_ai">photo_ai — фото + AI</option>
            <option value="video_ai">video_ai — видео + AI</option>
            <option value="survey_trainee">survey_trainee — опрос подопечного</option>
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">баллы</div>
          <input
            className="input mt-2"
            name="points"
            type="number"
            min={0}
            defaultValue={5}
          />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">AI-промпт</div>
          <textarea
            className="input mt-2"
            name="ai_prompt"
            rows={3}
            placeholder="например: «на фото должна быть бутылка OM на переднем плане, локация — спортзал»"
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">обложка</div>
          <input
            className="input mt-2"
            name="cover"
            type="file"
            accept="image/*"
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">видео-инструкция · url</div>
          <input
            className="input mt-2"
            name="intro_video_url"
            placeholder="https://youtu.be/…"
          />
        </div>
        <label
          className="flex items-center gap-2 font-mono"
          style={{
            fontSize: 12,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 4,
          }}
        >
          <input name="requires_moderation" type="checkbox" defaultChecked />
          <span>требует модерации (если AI не уверен)</span>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">
            создать
          </button>
        </div>
      </form>

      <div className="grid gap-3">
        {list.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[var(--om-ink-100)] flex items-start justify-between gap-4"
            style={{
              padding: "20px 24px",
              opacity: c.active ? 1 : 0.55,
            }}
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {c.title}
                </div>
                <span className="chip chip-blue">+{c.points}</span>
                <span className="chip">{c.kind}</span>
                {c.ai_check && <span className="chip">AI</span>}
                {c.requires_moderation && (
                  <span className="chip">модерация</span>
                )}
              </div>
              {c.description && (
                <div
                  className="font-body mt-2"
                  style={{
                    fontSize: 13,
                    color: "var(--om-ink-500)",
                    lineHeight: 1.55,
                  }}
                >
                  {c.description}
                </div>
              )}
            </div>
            <form action={toggleChallenge}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="active" value={String(c.active)} />
              <button type="submit" className="btn btn-outline">
                {c.active ? "архивировать" : "вернуть"}
              </button>
            </form>
          </div>
        ))}
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
            челленджей пока нет. создай первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
