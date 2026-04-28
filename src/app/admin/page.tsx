import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import type { Profile } from "@/lib/types";
import { toggleTrainer, updateTrainer } from "./actions";

export default async function AdminTrainersPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "trainer")
    .order("created_at", { ascending: false });

  const list = (trainers ?? []) as Profile[];

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">тренеры</div>
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
            всего: {list.length}
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
          создание тренера: supabase → auth → add user → потом заполни профиль здесь.
        </div>
      </div>

      <div className="grid gap-3">
        {list.map((t) => (
          <details
            key={t.id}
            className="bg-white border border-[var(--om-ink-100)]"
          >
            <summary
              className="flex items-center gap-4 cursor-pointer list-none"
              style={{ padding: "16px 20px" }}
            >
              <Avatar
                name={t.full_name}
                photoUrl={t.photo_url}
                size="md"
                variant="blue"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-display truncate"
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: "-0.01em",
                  }}
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
                  {t.sport ? ` · ${t.sport}` : ""} · {t.promo_code ?? "без промокода"}
                </div>
              </div>
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
                ● {t.is_active ? "активен" : "заблокирован"}
              </span>
            </summary>
            <div
              className="grid md:grid-cols-2 gap-6"
              style={{
                borderTop: "1px solid var(--om-ink-100)",
                padding: "24px 28px",
              }}
            >
              <form action={updateTrainer} className="grid gap-3">
                <input type="hidden" name="id" value={t.id} />
                <div>
                  <div className="eyebrow eyebrow-ink">имя</div>
                  <input
                    className="input mt-2"
                    name="full_name"
                    defaultValue={t.full_name}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="eyebrow eyebrow-ink">клуб</div>
                    <input
                      className="input mt-2"
                      name="club"
                      defaultValue={t.club ?? ""}
                    />
                  </div>
                  <div>
                    <div className="eyebrow eyebrow-ink">спорт</div>
                    <input
                      className="input mt-2"
                      name="sport"
                      defaultValue={t.sport ?? ""}
                    />
                  </div>
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">промокод</div>
                  <input
                    className="input mt-2"
                    name="promo_code"
                    defaultValue={t.promo_code ?? ""}
                    style={{
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-blue"
                  style={{ alignSelf: "flex-start" }}
                >
                  сохранить
                </button>
              </form>

              <form
                action={toggleTrainer}
                className="flex items-start md:justify-end"
              >
                <input type="hidden" name="id" value={t.id} />
                <input
                  type="hidden"
                  name="active"
                  value={String(t.is_active)}
                />
                <button type="submit" className="btn btn-outline">
                  {t.is_active ? "заблокировать" : "разблокировать"}
                </button>
              </form>
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
            тренеров пока нет. создай первого через supabase → authentication → add user, потом добавь запись в таблицу profiles.
          </div>
        )}
      </div>
    </div>
  );
}
