import Link from "next/link";
import { HeroCard } from "./HeroCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const FALLBACK: Pick<Product, "id" | "title" | "description" | "cover_url" | "price_points" | "kind">[] = [
  { id: "f1", title: "Garmin Forerunner 165", description: "Часы для бега и триатлона.", cover_url: null, price_points: 1200, kind: "gear" },
  { id: "f2", title: "Абонемент Bigsport на месяц", description: "Все клубы сети.", cover_url: null, price_points: 600, kind: "service" },
  { id: "f3", title: "Мерч OM (футболка + бутылка)", description: "Лимитированная капсула сезона.", cover_url: null, price_points: 250, kind: "merch" },
  { id: "f4", title: "Старт на марафоне Кишинёв", description: "Слот на главный забег года.", cover_url: null, price_points: 400, kind: "perk" },
  { id: "f5", title: "Персональная сессия с PT", description: "1 час работы с топ-тренером сети.", cover_url: null, price_points: 350, kind: "service" },
  { id: "f6", title: "OM-куртка из сезонной коллекции", description: "Капсульный мерч для амбассадоров.", cover_url: null, price_points: 800, kind: "merch" },
];

const KIND_LABEL: Record<string, string> = {
  merch: "Мерч",
  gear: "Экипировка",
  service: "Услуга",
  digital: "Цифровое",
  perk: "Бонус",
};

export async function PrizesShowcase() {
  let products: Pick<Product, "id" | "title" | "description" | "cover_url" | "price_points" | "kind">[] = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id,title,description,cover_url,price_points,kind")
      .eq("active", true)
      .order("price_points", { ascending: true })
      .limit(6);
    if (data && data.length > 0) products = data as typeof products;
  } catch {}

  return (
    <section id="prizes" className="container-xl pb-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-3">
            Призы сезона
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight max-w-2xl">
            Тренируйся, копи баллы, забирай.
          </h2>
        </div>
        <Link
          href="/login"
          className="hidden md:inline-flex rounded-full bg-om-ink text-om-cream px-5 py-3 text-sm font-medium hover:bg-om-blue-dark transition"
        >
          Стать амбассадором →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <HeroCard
            key={p.id}
            coverUrl={p.cover_url}
            title={p.title}
            subtitle={p.description}
            meta={`${p.price_points} баллов`}
            badge={KIND_LABEL[p.kind] ?? p.kind}
          />
        ))}
      </div>
    </section>
  );
}
