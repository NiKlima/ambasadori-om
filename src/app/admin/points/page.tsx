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
    .select(
      "id, trainer_id, amount, reason, created_at, trainer:profiles!point_transactions_trainer_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const list = (trainers ?? []) as Profile[];
  const rows = (txs ?? []) as unknown as TxRow[];

  return (
    <div className="grid gap-6">
      <div>
        <div className="eyebrow">manual credits</div>
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
          bonuses & adjustments.
        </h1>
      </div>

      <form
        action={awardPoints}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-[1fr_120px_2fr_auto] gap-3 items-end"
        style={{ padding: "24px 28px" }}
      >
        <div>
          <div className="eyebrow eyebrow-ink">trainer</div>
          <select className="input mt-2" name="trainer_id" required>
            <option value="">—</option>
            {list.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">points</div>
          <input
            className="input mt-2"
            name="amount"
            type="number"
            required
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">reason</div>
          <input
            className="input mt-2"
            name="reason"
            required
            placeholder="e.g. bonus for race participation"
          />
        </div>
        <button type="submit" className="btn btn-blue">
          award
        </button>
      </form>

      <div
        className="bg-white border border-[var(--om-ink-100)]"
        style={{ padding: "24px 28px" }}
      >
        <div className="eyebrow">recent transactions</div>
        <div className="mt-3">
          {rows.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center justify-between"
              style={{
                padding: "14px 0",
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid var(--om-ink-100)"
                    : "none",
              }}
            >
              <div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.trainer?.full_name ?? "—"}
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
                  {t.reason} · {formatDate(t.created_at)}
                </div>
              </div>
              <div
                className="font-display tabular-nums"
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
          {rows.length === 0 && (
            <p
              className="font-mono"
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "var(--om-ink-500)",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              no transactions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
