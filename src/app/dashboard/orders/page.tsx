import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Order, Product } from "@/lib/types";

const STATUS_LABEL: Record<Order["status"], { t: string; c: string }> = {
  pending: { t: "В обработке", c: "bg-om-sand text-om-ink" },
  approved: { t: "Подтверждён", c: "bg-om-blue-soft text-om-blue-dark" },
  fulfilled: { t: "Выдан", c: "bg-om-green/15 text-om-green" },
  cancelled: { t: "Отменён", c: "bg-om-coral/15 text-om-coral" },
};

type OrderWithProduct = Order & { product: Product | null };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select("*, product:products(*)")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderWithProduct[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Мои заказы</h1>
        <p className="text-om-muted mt-2">Статусы заказов из шопа OM.</p>
      </div>

      <div className="space-y-3">
        {orders.map((o) => {
          const s = STATUS_LABEL[o.status];
          return (
            <div key={o.id} className="rounded-3xl bg-white p-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold">{o.product?.title ?? "—"}</div>
                <div className="text-om-muted text-sm mt-1">{formatDate(o.created_at)}</div>
                {o.trainer_note && (
                  <div className="text-om-muted text-xs mt-2">Комментарий: {o.trainer_note}</div>
                )}
                {o.admin_note && (
                  <div className="text-om-blue-dark text-xs mt-1">От OM: {o.admin_note}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-semibold">−{o.price_points}</div>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${s.c}`}>{s.t}</span>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-om-muted">
            Заказов пока нет.{" "}
            <Link href="/dashboard/shop" className="underline hover:text-om-ink">
              Открыть шоп →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
