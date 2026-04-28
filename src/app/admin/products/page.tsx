import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { createProduct, toggleProduct } from "../actions";

const KINDS: Product["kind"][] = ["merch", "gear", "service", "digital", "perk"];

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (data ?? []) as Product[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">шоп</div>
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
          создавай и архивируй товары.
        </h1>
      </div>

      <form
        action={createProduct}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">название</div>
          <input className="input mt-2" name="title" required />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">описание</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{
              resize: "none",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">тип</div>
          <select className="input mt-2" name="kind" defaultValue="merch">
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">цена (баллы)</div>
          <input
            className="input mt-2"
            name="price_points"
            type="number"
            min={1}
            required
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">stock (пусто = безлимит)</div>
          <input
            className="input mt-2"
            name="stock"
            type="number"
            min={0}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">обложка</div>
          <input
            className="input mt-2"
            name="cover"
            type="file"
            accept="image/*"
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">
            создать
          </button>
        </div>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-[var(--om-ink-100)] flex gap-4"
            style={{
              padding: "16px 18px",
              opacity: p.active ? 1 : 0.55,
            }}
          >
            <div
              className="relative shrink-0 bg-[var(--om-ink-50)] overflow-hidden"
              style={{ width: 96, height: 96 }}
            >
              {p.cover_url ? (
                <Image
                  src={p.cover_url}
                  alt={p.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.title}
                </div>
                <span className="chip chip-blue">{p.price_points} бал.</span>
                <span className="chip">{p.kind}</span>
                {p.stock !== null && (
                  <span className="chip">остаток {p.stock}</span>
                )}
              </div>
              {p.description && (
                <div
                  className="font-body mt-2 line-clamp-2"
                  style={{
                    fontSize: 13,
                    color: "var(--om-ink-500)",
                    lineHeight: 1.55,
                  }}
                >
                  {p.description}
                </div>
              )}
              <form action={toggleProduct} className="mt-3">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(p.active)} />
                <button type="submit" className="btn btn-outline btn-sm">
                  {p.active ? "архивировать" : "вернуть"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div
            className="sm:col-span-2 bg-white border border-[var(--om-ink-100)]"
            style={{
              padding: "40px 28px",
              textAlign: "center",
              color: "var(--om-ink-500)",
              fontSize: 14,
            }}
          >
            товаров нет. добавь первый через форму выше.
          </div>
        )}
      </div>
    </div>
  );
}
