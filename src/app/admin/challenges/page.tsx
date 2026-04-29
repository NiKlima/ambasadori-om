import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/types";
import {
  createChallenge,
  updateChallenge,
  toggleChallenge,
  deleteChallenge,
  reorderEntity,
} from "../actions";

const KIND_OPTS: { value: Challenge["kind"]; label: string }[] = [
  { value: "manual", label: "manual — manual review" },
  { value: "photo_ai", label: "photo_ai — photo + AI" },
  { value: "video_ai", label: "video_ai — video + AI" },
  { value: "survey_trainee", label: "survey_trainee — client survey" },
];

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("challenges")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  const list = (data ?? []) as Challenge[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">challenges</div>
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
          create, edit and reorder.
        </h1>
      </div>

      <form
        action={createChallenge}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">title</div>
          <input className="input mt-2" name="title" required placeholder="photo with OM at training" />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">description</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">type</div>
          <select className="input mt-2" name="kind" defaultValue="manual">
            {KIND_OPTS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">points</div>
          <input className="input mt-2" name="points" type="number" min={0} defaultValue={5} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">sort order</div>
          <input className="input mt-2" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">cover</div>
          <input className="input mt-2" name="cover" type="file" accept="image/*" />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">AI prompt (for photo_ai / video_ai)</div>
          <textarea
            className="input mt-2"
            name="ai_prompt"
            rows={3}
            placeholder="e.g. &laquo;OM bottle visible in the foreground, location — gym&raquo;"
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
          />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">intro video · url</div>
          <input className="input mt-2" name="intro_video_url" placeholder="https://youtu.be/…" />
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
          <span>requires manual review (if AI is unsure)</span>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">create</button>
        </div>
      </form>

      <div className="grid gap-3">
        {list.map((c) => (
          <details
            key={c.id}
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ opacity: c.active ? 1 : 0.55 }}
          >
            <summary
              className="flex items-center gap-4 cursor-pointer list-none"
              style={{ padding: "16px 20px" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    {c.title}
                  </div>
                  <span className="chip chip-blue">+{c.points}</span>
                  <span className="chip">{c.kind}</span>
                  {c.ai_check && <span className="chip">AI</span>}
                </div>
                <div
                  className="font-mono mt-1"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  sort {c.sort_order} · {c.active ? "active" : "archived"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="challenges" />
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="up">↑</button>
                </form>
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="challenges" />
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="down">↓</button>
                </form>
              </div>
            </summary>

            <div
              className="grid gap-4"
              style={{ borderTop: "1px solid var(--om-ink-100)", padding: "24px 28px" }}
            >
              <form action={updateChallenge} className="grid md:grid-cols-2 gap-4">
                <input type="hidden" name="id" value={c.id} />
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">title</div>
                  <input className="input mt-2" name="title" defaultValue={c.title} required />
                </div>
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">description</div>
                  <textarea
                    className="input mt-2"
                    name="description"
                    rows={3}
                    defaultValue={c.description ?? ""}
                    style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">type</div>
                  <select className="input mt-2" name="kind" defaultValue={c.kind}>
                    {KIND_OPTS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">points</div>
                  <input className="input mt-2" name="points" type="number" min={0} defaultValue={c.points} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">sort order</div>
                  <input className="input mt-2" name="sort_order" type="number" defaultValue={c.sort_order} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">replace cover</div>
                  <input className="input mt-2" name="cover" type="file" accept="image/*" />
                </div>
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">AI prompt</div>
                  <textarea
                    className="input mt-2"
                    name="ai_prompt"
                    rows={3}
                    defaultValue={c.ai_prompt ?? ""}
                    style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">intro video · url</div>
                  <input
                    className="input mt-2"
                    name="intro_video_url"
                    defaultValue={c.intro_video_url ?? ""}
                  />
                </div>
                <label
                  className="flex items-center gap-2 font-mono"
                  style={{
                    fontSize: 12,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <input
                    name="requires_moderation"
                    type="checkbox"
                    defaultChecked={c.requires_moderation}
                  />
                  <span>requires manual review</span>
                </label>
                <div className="md:col-span-2">
                  <button type="submit" className="btn btn-blue">save</button>
                </div>
              </form>

              <div
                className="flex gap-3 flex-wrap"
                style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16 }}
              >
                <form action={toggleChallenge}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="active" value={String(c.active)} />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {c.active ? "archive" : "restore"}
                  </button>
                </form>
                <form action={deleteChallenge}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
                  >
                    delete
                  </button>
                </form>
              </div>
            </div>
          </details>
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
            no challenges yet. create the first one via the form above.
          </div>
        )}
      </div>
    </div>
  );
}
