import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { HeroCard } from "@/components/HeroCard";
import { OrderButton } from "./OrderButton";

const KIND_LABEL: Record<Product["kind"], string> = {
  merch: "Мерч",
  gear: "Экипировка",
  service: "Сервис",
  digital: "Цифровое",
  perk: "Привилегия",
};

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: products }, { data: txs }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("price_points", { ascending: true }),
    supabase.from("point_transactions").select("amount").eq("trainer_id", user.id),
  ]);

  const balance = (txs ?? []).reduce((sum, t) => sum + (t.amount as number), 0);
  const list = (products ?? []) as Product[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Шоп</h1>
          <p className="text-om-muted mt-2">Меняй баллы на мерч, экипировку и сервис от партнёров OM.</p>
        </div>
        <div className="rounded-3xl bg-om-ink text-om-cream px-5 py-3">
          <div className="text-xs uppercase tracking-wider text-om-cream/60">Доступно</div>
          <div className="text-2xl font-semibold">{balance} баллов</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => {
          const affordable = balance >= p.price_points;
          const stockEmpty = p.stock !== null && p.stock <= 0;
          return (
            <div key={p.id} className="space-y-3">
              <HeroCard
                coverUrl={p.cover_url}
                title={p.title}
                subtitle={p.description}
                meta={`${p.price_points} баллов`}
                badge={KIND_LABEL[p.kind]}
                dimmed={stockEmpty}
              />
              <div className="rounded-2xl bg-white border border-black/5 p-4 space-y-2">
                {p.stock !== null && (
                  <p className="text-xs text-om-muted">
                    Осталось: <span className="font-semibold">{p.stock}</span>
                  </p>
                )}
                {stockEmpty ? (
                  <p className="text-sm text-om-coral">Закончилось</p>
                ) : (
                  <OrderButton
                    productId={p.id}
                    price={p.price_points}
                    affordable={affordable}
                  />
                )}
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-white p-8 text-om-muted">
            Каталог скоро откроется. Заходи позже.
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6">
        <Link href="/dashboard/orders" className="text-om-blue-dark hover:text-om-ink text-sm">
          Мои заказы →
        </Link>
      </div>
    </div>
  );
}
