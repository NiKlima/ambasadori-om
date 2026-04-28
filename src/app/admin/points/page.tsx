import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { awardPoints } from "../actions";

type TxRow = {
  id: string;
  trainer_id: string;
  amount: number;
  reason: string;
  created_at: string;
  trainer: { full_name: string } | null;
};

export default async function AdminPointsPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "trainer")
    .eq("is_active", true)
    .order("full_name");

  const { data: txs } = await supabase
    .from("point_transactions")
    .select("id, trainer_id, amount, reason, created_at, trainer:profiles!point_transactions_trainer_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const list = (trainers ?? []) as Profile[];
  const rows = (txs ?? []) as unknown as TxRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Ручные начисления</h1>
        <p className="text-om-muted mt-2">Начисления и списания вне челленджей (бонусы, корректировки).</p>
      </div>

      <form action={awardPoints} className="rounded-3xl bg-white p-6 grid md:grid-cols-[1fr_120px_2fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Тренер</label>
          <select name="trainer_id" required className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white">
            <option value="">—</option>
            {list.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Баллы</label>
          <input name="amount" type="number" required className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Причина</label>
          <input name="reason" required placeholder="Например: бонус за участие в забеге" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>
        <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Начислить</button>
      </form>

      <div className="rounded-3xl bg-white p-6">
        <h2 className="font-semibold mb-4">Последние транзакции</h2>
        <div className="divide-y divide-black/5">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{t.trainer?.full_name ?? "—"}</div>
                <div className="text-om-muted text-xs mt-1">
                  {t.reason} · {formatDate(t.created_at)}
                </div>
              </div>
              <div className={`font-semibold tabular-nums ${t.amount >= 0 ? "text-om-green" : "text-om-coral"}`}>
                {t.amount >= 0 ? "+" : ""}{t.amount}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-om-muted text-center py-6">Транзакций пока нет.</p>}
        </div>
      </div>
    </div>
  );
}
