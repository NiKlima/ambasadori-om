import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { PointTransaction } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: txs } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  const list = (txs ?? []) as PointTransaction[];
  const total = list.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      {/* HERO */}
      <section
        className="bg-[var(--om-ink-900)] text-white relative overflow-hidden"
        style={{ padding: "56px 0" }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
            opacity: 0.18,
          }}
        />
        <div
          className="container-om relative grid items-end gap-6"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          <div>
            <div className="eyebrow eyebrow-w">история</div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(48px, 8vw, 96px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                margin: "12px 0 0",
              }}
            >
              каждый балл.
              <br />
              каждое движение.
            </h1>
          </div>
          <div
            className="bg-[var(--om-blue)]"
            style={{ padding: "22px 26px", textAlign: "right" }}
          >
            <div className="eyebrow eyebrow-w">всего</div>
            <div
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: 64,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginTop: 6,
              }}
            >
              {total}
            </div>
          </div>
        </div>
      </section>

      <div className="container-om" style={{ padding: "32px 0 80px" }}>
        {list.length > 0 ? (
          <div className="bg-white border border-[var(--om-ink-100)]">
            {list.map((t, i) => (
              <div
                key={t.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr auto",
                  padding: "18px 24px",
                  borderBottom:
                    i < list.length - 1
                      ? "1px solid var(--om-ink-100)"
                      : "none",
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t.reason}
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
                    {formatDate(t.created_at)}
                  </div>
                </div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 900,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    color:
                      t.amount >= 0 ? "var(--om-blue)" : "var(--om-magenta)",
                  }}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "48px 32px", textAlign: "center" }}
          >
            <div className="eyebrow">тихо</div>
            <p
              className="font-body mt-3"
              style={{ color: "var(--om-ink-500)", fontSize: 15 }}
            >
              пока нет начислений. начни с челленджа — баллы появятся здесь.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
