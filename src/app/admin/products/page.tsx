import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { createProduct, toggleProduct } from "../actions";

const KINDS: Product["kind"][] = ["merch", "gear", "service", "digital", "perk"];

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  const list = (data ?? []) as Product[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Шоп</h1>
        <p className="text-om-muted mt-2">Создавай и архивируй товары для тренеров.</p>
      </div>

      <form action={createProduct} className="rounded-3xl bg-white p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Название</label>
          <input name="title" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Описание</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Тип</label>
          <select name="kind" defaultValue="merch" className="w-full rounded-lg border border-black/10 px-3 py-2">
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Цена (баллы)</label>
          <input name="price_points" type="number" min={1} required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Stock (пусто = безлимит)</label>
          <input name="stock" type="number" min={0} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Обложка</label>
          <input name="cover" type="file" accept="image/*" className="block text-sm w-full" />
        </div>
        <div className="md:col-span-2">
          <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Создать</button>
        </div>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((p) => (
          <div key={p.id} className={`rounded-3xl bg-white border border-black/5 p-4 flex gap-4 ${p.active ? "" : "opacity-60"}`}>
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-om-blue-soft shrink-0">
              {p.cover_url ? (
                <Image src={p.cover_url} alt={p.title} fill sizes="96px" className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-semibold">{p.title}</div>
                <span className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs font-semibold px-2 py-0.5">
                  {p.price_points} бал.
                </span>
                <span className="rounded-full bg-om-sand text-om-ink text-xs px-2 py-0.5">{p.kind}</span>
                {p.stock !== null && (
                  <span className="rounded-full bg-om-ink/10 text-om-ink text-xs px-2 py-0.5">
                    остаток {p.stock}
                  </span>
                )}
              </div>
              <div className="text-om-muted text-sm mt-1 line-clamp-2">{p.description}</div>
              <form action={toggleProduct} className="mt-3">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(p.active)} />
                <button className="rounded-full border border-om-ink/20 px-4 py-1.5 text-xs hover:border-om-ink">
                  {p.active ? "Архивировать" : "Вернуть"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="sm:col-span-2 rounded-3xl bg-white p-8 text-center text-om-muted">
            Товаров нет. Добавь первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
