"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { OrderButton } from "./OrderButton";

const KIND_LABEL: Record<Product["kind"], string> = {
  merch: "merch",
  gear: "gear",
  service: "service",
  digital: "digital",
  perk: "perk",
};

const FILTERS = ["all", "merch", "gear", "service", "digital", "perk"] as const;
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  all: "all",
  merch: "merch",
  gear: "gear",
  service: "service",
  digital: "digital",
  perk: "perk",
};

type Filter = (typeof FILTERS)[number];

export function ShopGrid({
  products,
  balance,
}: {
  products: Product[];
  balance: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.kind === filter);
  }, [products, filter]);

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-ink-900)] text-white"
        style={{ height: 360 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
            opacity: 0.35,
          }}
        />
        <div
          className="om-stripes-white-soft"
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          className="container-om relative h-full grid items-end"
          style={{
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
            paddingBottom: 36,
          }}
        >
          <div>
            <div className="eyebrow eyebrow-w">shop · season 2026</div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(56px, 8vw, 120px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                margin: "12px 0 0",
              }}
            >
              train. earn.{" "}
              <span style={{ color: "var(--om-blue)" }}>claim.</span>
            </h1>
          </div>
          <div
            className="bg-[var(--om-blue)]"
            style={{ padding: "22px 26px", textAlign: "right" }}
          >
            <div className="eyebrow eyebrow-w">your balance</div>
            <div
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: 64,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginTop: 6,
              }}
            >
              {balance}{" "}
              <span style={{ fontSize: 22, opacity: 0.85 }}>pts</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-om" style={{ paddingTop: 40, paddingBottom: 96 }}>
        {/* Filter bar */}
        <div
          className="bg-white border border-[var(--om-ink-100)] flex justify-between items-center flex-wrap gap-3"
          style={{ padding: "18px 22px", marginBottom: 20 }}
        >
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "chip-ink" : ""}`}
              >
                {FILTER_LABEL[f]}
              </button>
            ))}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
sort: price ↑
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            className="grid sm:grid-cols-2 md:grid-cols-3 border border-[var(--om-ink-100)]"
          >
            {filtered.map((p, i) => {
              const affordable = balance >= p.price_points;
              const stockEmpty = p.stock !== null && p.stock <= 0;
              const cover = p.cover_url ?? "/brand/imagery/runner-overhead.jpg";
              const isOpen = openId === p.id;
              const total = filtered.length;
              return (
                <article
                  key={p.id}
                  className="bg-white flex flex-col"
                  style={{
                    borderRight:
                      (i + 1) % 3 !== 0 && i !== total - 1
                        ? "1px solid var(--om-ink-100)"
                        : "none",
                    borderBottom:
                      i < total - (total % 3 === 0 ? 3 : total % 3)
                        ? "1px solid var(--om-ink-100)"
                        : "none",
                    opacity: stockEmpty ? 0.55 : 1,
                  }}
                >
                  <div
                    className="bg-img relative"
                    style={{ aspectRatio: "1/1", backgroundImage: `url(${cover})` }}
                  >
                    <span
                      className="chip absolute"
                      style={{
                        top: 12,
                        left: 12,
                        background: "rgba(255,255,255,.95)",
                        borderColor: "transparent",
                      }}
                    >
                      {KIND_LABEL[p.kind]}
                    </span>
                    {affordable && !stockEmpty && (
                      <span
                        className="chip chip-blue absolute"
                        style={{ top: 12, right: 12 }}
                      >
can claim
                      </span>
                    )}
                  </div>
                  <div
                    className="flex justify-between items-end gap-3"
                    style={{
                      padding: "20px 22px 18px",
                      borderTop: "1px solid var(--om-ink-100)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 800,
                          fontSize: 17,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {p.title}
                      </div>
                      {p.stock !== null && (
                        <div
                          className="font-mono mt-1"
                          style={{
                            fontSize: 11,
                            color: "var(--om-ink-500)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
stock: {p.stock}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 900,
                          fontSize: 22,
                          letterSpacing: "-0.02em",
                          color: "var(--om-blue)",
                        }}
                      >
                        {p.price_points}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color: "var(--om-ink-500)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
pts
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0 22px 22px",
                      borderTop: "1px solid var(--om-ink-100)",
                      paddingTop: 16,
                    }}
                  >
                    {stockEmpty ? (
                      <p
                        className="font-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--om-magenta)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
out of stock
                      </p>
                    ) : isOpen ? (
                      <OrderButton
                        productId={p.id}
                        price={p.price_points}
                        affordable={affordable}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenId(p.id)}
                        disabled={!affordable}
                        className={`btn ${affordable ? "btn-blue" : "btn-outline"} btn-sm`}
                        style={{ width: "100%" }}
                      >
                        {affordable
                          ? `claim for ${p.price_points}`
                          : "not enough points"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className="bg-white border border-[var(--om-ink-100)] font-mono"
            style={{
              padding: "40px 24px",
              textAlign: "center",
              color: "var(--om-ink-500)",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {products.length === 0
              ? "catalogue opens soon. check back later."
              : "nothing matches this filter"}
          </div>
        )}
      </div>
    </>
  );
}
