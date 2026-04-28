import Link from "next/link";
import { Avatar } from "@/components/Avatar";
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

  const { data: lbAll } = await supabase.from("leaderboard").select("id,total_points");
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
      <div className="rounded-3xl bg-white p-8">
        <h2 className="text-xl font-semibold mb-2">Профиль не настроен</h2>
        <p className="text-om-muted">
          Обратись к админу OM — нужно добавить тебя в программу.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-3xl bg-white p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={profile.full_name} photoUrl={profile.photo_url} size="lg" />
              <div>
                <div className="text-om-muted text-sm">Привет,</div>
                <div className="text-2xl md:text-3xl font-semibold">{profile.full_name}</div>
                <div className="text-om-muted text-sm mt-1">
                  {profile.club ?? ""}{profile.sport ? ` · ${profile.sport}` : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div>
              <div className="text-xs uppercase text-om-muted tracking-wider">Баллы</div>
              <div className="text-4xl font-semibold mt-1">{totalPoints}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-om-muted tracking-wider">Место</div>
              <div className="text-4xl font-semibold mt-1">
                {position ? `№${position}` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-om-muted tracking-wider">На модерации</div>
              <div className="text-4xl font-semibold mt-1">{pendingSubs?.length ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-om-ink text-om-cream p-8">
          <div className="text-xs uppercase tracking-wider text-om-cream/60 mb-3">
            Твой промокод
          </div>
          <div className="text-3xl md:text-4xl font-mono tracking-wider mb-6">
            {profile.promo_code ?? "—"}
          </div>
          <p className="text-sm text-om-cream/70">
            Подопечные вводят этот код при покупке OM. Баллы начисляются автоматически.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Последние начисления</h2>
          <Link href="/dashboard/history" className="text-om-blue-dark text-sm hover:text-om-ink">
            Вся история →
          </Link>
        </div>
        {recentTxs && recentTxs.length > 0 ? (
          <div className="divide-y divide-black/5">
            {(recentTxs as PointTransaction[]).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">{t.reason}</div>
                  <div className="text-om-muted text-xs mt-1">{formatDate(t.created_at)}</div>
                </div>
                <div className={`text-lg font-semibold tabular-nums ${t.amount >= 0 ? "text-om-green" : "text-om-coral"}`}>
                  {t.amount >= 0 ? "+" : ""}{t.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-om-muted">
            Пока тихо. Начни с челленджа — загрузи фото и получишь первые баллы.{" "}
            <Link href="/dashboard/challenges" className="underline hover:text-om-ink">
              К челленджам →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
