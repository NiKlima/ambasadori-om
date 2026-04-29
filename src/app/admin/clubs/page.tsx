import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Club } from "@/lib/types";
import {
  createClub,
  updateClub,
  toggleClub,
  deleteClub,
  reorderEntity,
} from "../actions";

export default async function AdminClubsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clubs")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  const list = (data ?? []) as Club[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">clubs</div>
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
          partner clubs · {list.length}
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
          partner clubs that ambassadors belong to. higher sort_order shows first
          on landing/leaderboard.
        </p>
      </div>

      <form
        action={createClub}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">name</div>
          <input className="input mt-2" name="name" required placeholder="Bigsport" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">slug</div>
          <input className="input mt-2" name="slug" placeholder="bigsport" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">city</div>
          <input className="input mt-2" name="city" defaultValue="Chișinău" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">sport focus</div>
          <input className="input mt-2" name="sport_focus" placeholder="running, yoga, crossfit" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">sort order</div>
          <input className="input mt-2" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">website</div>
          <input className="input mt-2" name="website" type="url" placeholder="https://…" />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">logo</div>
          <input className="input mt-2" name="logo" type="file" accept="image/*" />
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
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">
            create club
          </button>
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
              <div
                className="relative shrink-0 bg-[var(--om-ink-50)] overflow-hidden"
                style={{ width: 56, height: 56 }}
              >
                {c.logo_url ? (
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-display truncate"
                  style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}
                >
                  {c.name}
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
                  {c.slug ?? "—"} · {c.sport_focus ?? "—"} · sort {c.sort_order}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="clubs" />
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="up">↑</button>
                </form>
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="clubs" />
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="down">↓</button>
                </form>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c.active ? "var(--om-blue)" : "var(--om-magenta)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  ● {c.active ? "active" : "hidden"}
                </span>
              </div>
            </summary>

            <div
              className="grid gap-4"
              style={{
                borderTop: "1px solid var(--om-ink-100)",
                padding: "24px 28px",
              }}
            >
              <form action={updateClub} className="grid md:grid-cols-2 gap-4">
                <input type="hidden" name="id" value={c.id} />
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">name</div>
                  <input className="input mt-2" name="name" defaultValue={c.name} required />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">slug</div>
                  <input className="input mt-2" name="slug" defaultValue={c.slug ?? ""} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">city</div>
                  <input className="input mt-2" name="city" defaultValue={c.city ?? "Chișinău"} />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">sport focus</div>
                  <input
                    className="input mt-2"
                    name="sport_focus"
                    defaultValue={c.sport_focus ?? ""}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">sort order</div>
                  <input
                    className="input mt-2"
                    name="sort_order"
                    type="number"
                    defaultValue={c.sort_order}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">website</div>
                  <input
                    className="input mt-2"
                    name="website"
                    type="url"
                    defaultValue={c.website ?? ""}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">replace logo</div>
                  <input className="input mt-2" name="logo" type="file" accept="image/*" />
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
                <div className="md:col-span-2 flex gap-3 flex-wrap">
                  <button type="submit" className="btn btn-blue">
                    save
                  </button>
                </div>
              </form>

              <div className="flex gap-3 flex-wrap" style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16 }}>
                <form action={toggleClub}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="active" value={String(c.active)} />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {c.active ? "hide" : "show"}
                  </button>
                </form>
                <form action={deleteClub}>
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
            no clubs yet. add the first one via the form above.
          </div>
        )}
      </div>
    </div>
  );
}
