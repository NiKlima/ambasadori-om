import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Kpi } from "@/components/ui/Kpi";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { PointTransaction } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: lbAll } = await supabase
    .from("leaderboard")
    .select("id,total_points")
    .order("total_points", { ascending: false });
  const totalPoints = (lbAll?.find((r) => r.id === user.id)?.total_points as number | undefined) ?? 0;
  const position = lbAll ? lbAll.findIndex((r) => r.id === user.id) + 1 : 0;

  const { data: recentTxs } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingSubs } = await supabase
    .from("submissions")
    .select("id")
    .eq("trainer_id", user.id)
    .eq("status", "pending");

  if (!profile) {
    return (
      <div className="container-om py-10">
        <div className="bg-white border border-[var(--om-ink-100)] p-8">
          <div className="eyebrow">профиль не настроен</div>
          <h2
            className="font-display mt-3"
            style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-0.03em" }}
          >
            обратись к админу OM.
          </h2>
          <p
            className="mt-3"
            style={{ color: "var(--om-ink-500)" }}
          >
            нужно добавить тебя в программу. напиши на{" "}
            <a href="mailto:ambasadori@om.md" style={{ color: "var(--om-blue)" }}>
              ambasadori@om.md
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-om py-8 grid gap-4">
      {/* Profile + promo code */}
      <div className="grid md:grid-cols-[1.6fr_1fr] gap-4">
        <div className="bg-white border border-[var(--om-ink-100)] p-8 sm:p-10 flex items-center gap-6">
          <Avatar
            name={profile.full_name}
            photoUrl={profile.photo_url}
            size="xl"
            variant="blue"
          />
          <div>
            <div className="eyebrow eyebrow-ink">привет,</div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 5vw, 56px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                margin: "8px 0 6px",
              }}
            >
              {profile.full_name?.toLowerCase() ?? ""}.
            </h1>
            <div
              className="font-mono"
              style={{
                fontSize: 12,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {profile.club ?? "—"}
              {profile.sport ? ` · ${profile.sport}` : ""}
              {" · амбассадор"}
            </div>
          </div>
        </div>

        <div className="bg-[var(--om-ink-900)] text-white p-8 relative overflow-hidden">
          <div className="om-stripes-white-soft" style={{ position: "absolute", inset: 0 }} />
          <div className="relative">
            <div className="eyebrow eyebrow-w">твой промокод</div>
            <div
              className="font-display mt-3"
              style={{ fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em" }}
            >
              {profile.promo_code ?? "—"}
            </div>
            <div
              className="font-mono mt-3"
              style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.55 }}
            >
              клиенты вводят код при покупке OM. баллы начисляются автоматически.
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="всего баллов" value={totalPoints} variant="blue" />
        <Kpi label="место" value={position ? `№${position}` : "—"} />
        <Kpi
          label="на модерации"
          value={
            <span style={{ color: "var(--om-magenta)" }}>
              {pendingSubs?.length ?? 0}
            </span>
          }
        />
        <Kpi label="всего записей" value={recentTxs?.length ?? 0} />
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-[var(--om-ink-100)] p-7 sm:p-8">
        <div className="flex justify-between items-baseline mb-5">
          <div>
            <div className="eyebrow">последние начисления</div>
            <h2
              className="font-display mt-2"
              style={{
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              недавняя активность.
            </h2>
          </div>
          <Link href="/dashboard/history" className="lk">
            вся история →
          </Link>
        </div>
        {recentTxs && recentTxs.length > 0 ? (
          <div>
            {(recentTxs as PointTransaction[]).map((t, i) => (
              <div
                key={t.id}
                className="flex justify-between items-center py-3"
                style={{
                  borderBottom:
                    i < recentTxs.length - 1
                      ? "1px solid var(--om-ink-100)"
                      : "none",
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
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
                    fontSize: 22,
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
          <p style={{ color: "var(--om-ink-500)" }}>
            пока тихо. начни с челленджа — загрузи фото и получишь первые
            баллы.{" "}
            <Link
              href="/dashboard/challenges"
              className="lk"
              style={{ display: "inline" }}
            >
              к челленджам →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
