import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import {
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
  reorderEntity,
} from "../actions";

const KINDS: Product["kind"][] = ["merch", "gear", "service", "digital", "perk"];

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  const list = (data ?? []) as Product[];

  return (
    <div className="grid gap-8">
      <div>
        <div className="eyebrow">shop</div>
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
          create, edit and reorder products.
        </h1>
        <p
          className="font-body mt-3"
          style={{ fontSize: 14, color: "var(--om-ink-500)", lineHeight: 1.55, maxWidth: 600 }}
        >
          flag products as <strong>featured</strong> to surface them in the
          landing prizes block (top 6 by sort_order).
        </p>
      </div>

      <form
        action={createProduct}
        className="bg-white border border-[var(--om-ink-100)] grid md:grid-cols-2 gap-4"
        style={{ padding: "28px 32px" }}
      >
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">title</div>
          <input className="input mt-2" name="title" required />
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow eyebrow-ink">description</div>
          <textarea
            className="input mt-2"
            name="description"
            rows={3}
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
          />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">type</div>
          <select className="input mt-2" name="kind" defaultValue="merch">
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">price (points)</div>
          <input className="input mt-2" name="price_points" type="number" min={1} required />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">stock (empty = unlimited)</div>
          <input className="input mt-2" name="stock" type="number" min={0} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">sort order</div>
          <input className="input mt-2" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div>
          <div className="eyebrow eyebrow-ink">cover</div>
          <input className="input mt-2" name="cover" type="file" accept="image/*" />
        </div>
        <label
          className="flex items-center gap-2 font-mono"
          style={{
            fontSize: 12,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 4,
          }}
        >
          <input name="featured" type="checkbox" />
          <span>featured (show in landing prizes block)</span>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-blue">create</button>
        </div>
      </form>

      <div className="grid gap-3">
        {list.map((p) => (
          <details
            key={p.id}
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ opacity: p.active ? 1 : 0.55 }}
          >
            <summary
              className="flex items-center gap-4 cursor-pointer list-none"
              style={{ padding: "16px 20px" }}
            >
              <div
                className="relative shrink-0 bg-[var(--om-ink-50)] overflow-hidden"
                style={{ width: 64, height: 64 }}
              >
                {p.cover_url ? (
                  <Image
                    src={p.cover_url}
                    alt={p.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    {p.title}
                  </div>
                  <span className="chip chip-blue">{p.price_points} pts</span>
                  <span className="chip">{p.kind}</span>
                  {p.featured && <span className="chip chip-blue">featured</span>}
                  {p.stock !== null && <span className="chip">stock {p.stock}</span>}
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
                  sort {p.sort_order} · {p.active ? "active" : "archived"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="products" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="up">↑</button>
                </form>
                <form action={reorderEntity}>
                  <input type="hidden" name="table" value="products" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className="btn btn-outline btn-sm" aria-label="down">↓</button>
                </form>
              </div>
            </summary>

            <div
              className="grid gap-4"
              style={{ borderTop: "1px solid var(--om-ink-100)", padding: "24px 28px" }}
            >
              <form action={updateProduct} className="grid md:grid-cols-2 gap-4">
                <input type="hidden" name="id" value={p.id} />
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">title</div>
                  <input className="input mt-2" name="title" defaultValue={p.title} required />
                </div>
                <div className="md:col-span-2">
                  <div className="eyebrow eyebrow-ink">description</div>
                  <textarea
                    className="input mt-2"
                    name="description"
                    rows={3}
                    defaultValue={p.description ?? ""}
                    style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">type</div>
                  <select className="input mt-2" name="kind" defaultValue={p.kind}>
                    {KINDS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">price (points)</div>
                  <input
                    className="input mt-2"
                    name="price_points"
                    type="number"
                    min={1}
                    defaultValue={p.price_points}
                    required
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">stock</div>
                  <input
                    className="input mt-2"
                    name="stock"
                    type="number"
                    min={0}
                    defaultValue={p.stock ?? ""}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">sort order</div>
                  <input
                    className="input mt-2"
                    name="sort_order"
                    type="number"
                    defaultValue={p.sort_order}
                  />
                </div>
                <div>
                  <div className="eyebrow eyebrow-ink">replace cover</div>
                  <input className="input mt-2" name="cover" type="file" accept="image/*" />
                </div>
                <label
                  className="flex items-center gap-2 font-mono"
                  style={{
                    fontSize: 12,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: 24,
                  }}
                >
                  <input name="featured" type="checkbox" defaultChecked={p.featured} />
                  <span>featured (landing prizes)</span>
                </label>
                <div className="md:col-span-2">
                  <button type="submit" className="btn btn-blue">save</button>
                </div>
              </form>

              <div
                className="flex gap-3 flex-wrap"
                style={{ borderTop: "1px solid var(--om-ink-100)", paddingTop: 16 }}
              >
                <form action={toggleProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="active" value={String(p.active)} />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {p.active ? "archive" : "restore"}
                  </button>
                </form>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: "var(--om-magenta)", color: "var(--om-magenta)" }}
                  >
                    delete
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}
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
            no products yet. add the first one via the form above.
          </div>
        )}
      </div>
    </div>
  );
}
