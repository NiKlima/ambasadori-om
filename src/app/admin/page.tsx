import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import type { Club, Profile } from "@/lib/types";
import { toggleTrainer, updateTrainer, reorderEntity } from "./actions";

export default async function AdminTrainersPage() {
  const supabase = await createClient();
  const [{ data: trainersRaw }, { data: clubsRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "trainer")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("clubs")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: false }),
  ]);

  const list = (trainersRaw ?? []) as Profile[];
  const clubs = (clubsRaw ?? []) as Club[];

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">trainers</div>
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
            total: {list.length}
          </h1>
        </div>
        <div
          className="bg-[var(--om-blue-50)] font-mono"
          style={{
            padding: "16px 20px",
            color: "var(--om-blue)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.55,
            maxWidth: 480,
          }}
        >
          create a trainer: supabase → auth → add user → then fill the profile here.
        </div>
      </div>

      <div className="grid gap-3">
        {list.map((t) => {
          const socials = (t.socials ?? {}) as Record<string, string>;
          return (
            <details key={t.id} className="bg-white border border-[var(--om-ink-100)]">
              <summary
                className="flex items-center gap-4 cursor-pointer list-none"
                style={{ padding: "16px 20px" }}
              >
                <Avatar name={t.full_name} photoUrl={t.photo_url} size="md" variant="blue" />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display truncate"
                    style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    {t.full_name}
                  </div>
                  <div
                    className="font-mono truncate mt-1"
                    style={{
                      fontSize: 11,
                      color: "var(--om-ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t.club ?? "—"}
                    {t.sport ? ` · ${t.sport}` : ""} · {t.promo_code ?? "no promo code"} · sort {t.sort_order}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={reorderEntity}>
                    <input type="hidden" name="table" value="profiles" />
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" className="btn btn-outline btn-sm" aria-label="up">↑</button>
                  </form>
                  <form action={reorderEntity}>
                    <input type="hidden" name="table" value="profiles" />
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" className="btn btn-outline btn-sm" aria-label="down">↓</button>
                  </form>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.is_active ? "var(--om-blue)" : "var(--om-magenta)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ● {t.is_active ? "active" : "blocked"}
                  </span>
                </div>
              </summary>

              <div
                style={{
                  borderTop: "1px solid var(--om-ink-100)",
                  padding: "24px 28px",
                }}
              >
                <form action={updateTrainer} className="grid md:grid-cols-2 gap-4" encType="multipart/form-data">
                  <input type="hidden" name="id" value={t.id} />

                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">name</div>
                    <input className="input mt-2" name="full_name" defaultValue={t.full_name} required />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">club (free text)</div>
                    <input className="input mt-2" name="club" defaultValue={t.club ?? ""} />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">club (linked)</div>
                    <select
                      className="input mt-2"
                      name="club_id"
                      defaultValue={t.club_id ?? ""}
                    >
                      <option value="">— none —</option>
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">sport</div>
                    <input className="input mt-2" name="sport" defaultValue={t.sport ?? ""} />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">birthdate</div>
                    <input
                      className="input mt-2"
                      name="birthdate"
                      type="date"
                      defaultValue={t.birthdate ?? ""}
                    />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">promo code</div>
                    <input
                      className="input mt-2"
                      name="promo_code"
                      defaultValue={t.promo_code ?? ""}
                      style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
                    />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">sort order</div>
                    <input
                      className="input mt-2"
                      name="sort_order"
                      type="number"
                      defaultValue={t.sort_order}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">photo (replace)</div>
                    <input className="input mt-2" name="photo" type="file" accept="image/*" />
                    {t.photo_url && (
                      <div
                        className="font-mono mt-2"
                        style={{
                          fontSize: 11,
                          color: "var(--om-ink-500)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        current: {t.photo_url.split("/").slice(-1)[0]}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">bio (1 line)</div>
                    <input className="input mt-2" name="bio" defaultValue={t.bio ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">quote</div>
                    <input className="input mt-2" name="quote" defaultValue={t.quote ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">story · markdown</div>
                    <textarea
                      className="input mt-2"
                      name="story"
                      rows={6}
                      defaultValue={t.story ?? ""}
                      style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">achievements · one per line</div>
                    <textarea
                      className="input mt-2"
                      name="achievements"
                      rows={4}
                      defaultValue={(t.achievements ?? []).join("\n")}
                      style={{ resize: "none", fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="eyebrow eyebrow-ink">intro video · url</div>
                    <input
                      className="input mt-2"
                      name="intro_video_url"
                      defaultValue={t.intro_video_url ?? ""}
                    />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">instagram</div>
                    <input className="input mt-2" name="social_instagram" defaultValue={socials.instagram ?? ""} />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">tiktok</div>
                    <input className="input mt-2" name="social_tiktok" defaultValue={socials.tiktok ?? ""} />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">telegram</div>
                    <input className="input mt-2" name="social_telegram" defaultValue={socials.telegram ?? ""} />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">youtube</div>
                    <input className="input mt-2" name="social_youtube" defaultValue={socials.youtube ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="btn btn-blue">save profile</button>
                  </div>
                </form>

                <div
                  className="flex gap-3 flex-wrap"
                  style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16, marginTop: 24 }}
                >
                  <form action={toggleTrainer}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="active" value={String(t.is_active)} />
                    <button type="submit" className="btn btn-outline btn-sm">
                      {t.is_active ? "block" : "unblock"}
                    </button>
                  </form>
                </div>
              </div>
            </details>
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
            no trainers yet. create the first one via supabase → authentication → add user, then add a row in the profiles table.
          </div>
        )}
      </div>
    </div>
  );
}
