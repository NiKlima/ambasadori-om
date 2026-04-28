import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/types";
import { createChallenge, toggleChallenge } from "../actions";

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
  const list = (data ?? []) as Challenge[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Челленджи</h1>
        <p className="text-om-muted mt-2">Создавай и архивируй активности.</p>
      </div>

      <form action={createChallenge} className="rounded-3xl bg-white p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Название</label>
          <input name="title" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Описание</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Тип</label>
          <select name="kind" defaultValue="manual" className="w-full rounded-lg border border-black/10 px-3 py-2">
            <option value="manual">manual — ручная модерация</option>
            <option value="photo_ai">photo_ai — фото + AI</option>
            <option value="video_ai">video_ai — видео + AI</option>
            <option value="survey_trainee">survey_trainee — опрос подопечного</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Баллы</label>
          <input name="points" type="number" min={0} defaultValue={5} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">AI-промпт (для photo_ai / video_ai)</label>
          <textarea
            name="ai_prompt"
            rows={2}
            placeholder="Например: «на фото должна быть бутылка OM на переднем плане, локация — спортзал»"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Обложка</label>
          <input name="cover" type="file" accept="image/*" className="block text-sm w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Видео-инструкция (URL, опц.)</label>
          <input
            name="intro_video_url"
            placeholder="https://youtu.be/... — пример «как снимать»"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 mt-7">
          <input name="requires_moderation" type="checkbox" defaultChecked />
          <span className="text-sm">Требует модерации (если AI не уверен)</span>
        </label>
        <div className="md:col-span-2">
          <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Создать</button>
        </div>
      </form>

      <div className="space-y-3">
        {list.map((c) => (
          <div key={c.id} className={`rounded-3xl bg-white border border-black/5 p-6 flex items-start justify-between gap-4 ${c.active ? "" : "opacity-60"}`}>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-lg font-semibold">{c.title}</div>
                <span className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs font-semibold px-2 py-0.5">+{c.points}</span>
                <span className="rounded-full bg-om-ink/10 text-om-ink text-xs px-2 py-0.5">{c.kind}</span>
                {c.ai_check && (
                  <span className="rounded-full bg-om-green/15 text-om-green text-xs px-2 py-0.5">AI</span>
                )}
                {c.requires_moderation && (
                  <span className="rounded-full bg-om-sand text-om-ink text-xs px-2 py-0.5">модерация</span>
                )}
              </div>
              <div className="text-om-muted text-sm mt-1">{c.description}</div>
            </div>
            <form action={toggleChallenge}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="active" value={String(c.active)} />
              <button className="rounded-full border border-om-ink/20 px-4 py-2 text-sm hover:border-om-ink">
                {c.active ? "Архивировать" : "Вернуть"}
              </button>
            </form>
          </div>
        ))}
        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-om-muted">
            Челленджей пока нет. Создай первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
