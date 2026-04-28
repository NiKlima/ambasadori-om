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

  const total = (txs ?? []).reduce((s, t) => s + (t.amount as number), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">История начислений</h1>
        <p className="text-om-muted mt-2">Всё прозрачно: каждая транзакция видна.</p>
      </div>

      <div className="rounded-3xl bg-white p-8">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="text-om-muted text-sm">Всего баллов</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="divide-y divide-black/5">
          {((txs ?? []) as PointTransaction[]).map((t) => (
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
          {(!txs || txs.length === 0) && (
            <div className="py-12 text-center text-om-muted">
              Пока нет начислений.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
