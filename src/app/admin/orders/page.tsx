import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Order, OrderStatus, Product, Profile } from "@/lib/types";
import { updateOrderStatus } from "../actions";

type Row = Order & { product: Product | null; trainer: Pick<Profile, "id" | "full_name" | "club"> | null };

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["approved", "fulfilled", "cancelled"],
  approved: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "В обработке",
  approved: "Подтверждён",
  fulfilled: "Выдан",
  cancelled: "Отменён",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, product:products(*), trainer:profiles(id,full_name,club)")
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Заказы</h1>
        <p className="text-om-muted mt-2">Очередь заказов из шопа OM.</p>
      </div>

      <div className="space-y-3">
        {list.map((o) => {
          const next = NEXT_STATUSES[o.status];
          return (
            <div key={o.id} className="rounded-3xl bg-white p-6 grid md:grid-cols-[1fr_auto] gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{o.product?.title ?? "—"}</div>
                  <span className="rounded-full bg-om-sand text-om-ink text-xs px-2 py-0.5">
                    {STATUS_LABEL[o.status]}
                  </span>
                  <span className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs font-semibold px-2 py-0.5">
                    −{o.price_points}
                  </span>
                </div>
                <div className="text-om-muted text-sm mt-1">
                  {o.trainer?.full_name}{o.trainer?.club ? ` · ${o.trainer.club}` : ""}
                </div>
                <div className="text-om-muted text-xs mt-1">{formatDate(o.created_at)}</div>
                {o.trainer_note && (
                  <div className="text-sm mt-2">
                    <span className="text-om-muted">Тренер:</span> {o.trainer_note}
                  </div>
                )}
                {o.admin_note && (
                  <div className="text-sm text-om-blue-dark mt-1">
                    <span className="text-om-muted">OM:</span> {o.admin_note}
                  </div>
                )}
              </div>

              {next.length > 0 ? (
                <form action={updateOrderStatus} className="space-y-2 md:w-64">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={next[0]} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm">
                    {next.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                  <input
                    name="admin_note"
                    placeholder="Комментарий (опционально)"
                    defaultValue={o.admin_note ?? ""}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  />
                  <button className="w-full rounded-full bg-om-ink text-om-cream px-4 py-2 text-sm">
                    Сохранить
                  </button>
                </form>
              ) : (
                <div className="text-om-muted text-xs md:text-right">
                  Завершено
                  {o.fulfilled_at && <div>{formatDate(o.fulfilled_at)}</div>}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-om-muted">
            Заказов пока нет.
          </div>
        )}
      </div>
    </div>
  );
}
