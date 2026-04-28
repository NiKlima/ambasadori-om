import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Order, OrderStatus, Product, Profile } from "@/lib/types";
import { updateOrderStatus } from "../actions";

type Row = Order & {
  product: Product | null;
  trainer: Pick<Profile, "id" | "full_name" | "club"> | null;
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["approved", "fulfilled", "cancelled"],
  approved: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "в обработке",
  approved: "подтверждён",
  fulfilled: "выдан",
  cancelled: "отменён",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "var(--om-magenta)",
  approved: "var(--om-blue)",
  fulfilled: "var(--om-blue)",
  cancelled: "var(--om-ink-500)",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, product:products(*), trainer:profiles(id,full_name,club)")
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Row[];

  return (
    <div className="grid gap-6">
      <div>
        <div className="eyebrow">заказы</div>
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
          очередь из шопа OM.
        </h1>
      </div>

      <div className="grid gap-3">
        {list.map((o) => {
          const next = NEXT_STATUSES[o.status];
          return (
            <div
              key={o.id}
              className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-[1fr_auto] gap-4"
              style={{ padding: "20px 24px" }}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 800,
                      fontSize: 17,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {o.product?.title ?? "—"}
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: STATUS_COLOR[o.status],
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ● {STATUS_LABEL[o.status]}
                  </span>
                  <span className="chip chip-blue">−{o.price_points}</span>
                </div>
                <div
                  className="font-mono mt-2"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {o.trainer?.full_name ?? "—"}
                  {o.trainer?.club ? ` · ${o.trainer.club}` : ""} · {formatDate(o.created_at)}
                </div>
                {o.trainer_note && (
                  <div
                    className="font-body mt-2"
                    style={{
                      fontSize: 13,
                      color: "var(--om-ink-500)",
                      lineHeight: 1.55,
                    }}
                  >
                    тренер: {o.trainer_note}
                  </div>
                )}
                {o.admin_note && (
                  <div
                    className="font-body mt-1"
                    style={{
                      fontSize: 13,
                      color: "var(--om-blue)",
                      lineHeight: 1.55,
                    }}
                  >
                    OM: {o.admin_note}
                  </div>
                )}
              </div>

              {next.length > 0 ? (
                <form
                  action={updateOrderStatus}
                  className="grid gap-2 md:w-64"
                >
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={next[0]} className="input">
                    {next.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    name="admin_note"
                    placeholder="комментарий (опц)"
                    defaultValue={o.admin_note ?? ""}
                  />
                  <button type="submit" className="btn btn-blue">
                    сохранить
                  </button>
                </form>
              ) : (
                <div
                  className="font-mono md:text-right"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  завершено
                  {o.fulfilled_at && <div>{formatDate(o.fulfilled_at)}</div>}
                </div>
              )}
            </div>
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
            заказов пока нет.
          </div>
        )}
      </div>
    </div>
  );
}
