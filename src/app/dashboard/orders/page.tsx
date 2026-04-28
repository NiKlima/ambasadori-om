import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Order, OrderStatus, Product } from "@/lib/types";

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
  const total = orders.length;
  const counts = orders.reduce<Record<OrderStatus, number>>(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, fulfilled: 0, cancelled: 0 },
  );

  return (
    <>
      {/* HERO */}
      <section
        className="bg-[var(--om-blue)] text-white relative overflow-hidden"
        style={{ padding: "56px 0" }}
      >
        <div
          className="om-stripes-band"
          style={{ position: "absolute", inset: 0, opacity: 0.25 }}
        />
        <div className="container-om relative">
          <div className="eyebrow eyebrow-w">мои заказы</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(56px, 8vw, 96px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: "12px 0 0",
            }}
          >
            {total === 0 ? "ещё ни одного." : `${total} ${pluralOrder(total)}.`}
          </h1>
          {total > 0 && (
            <div
              className="font-mono mt-6 flex flex-wrap gap-x-6 gap-y-2"
              style={{
                fontSize: 12,
                opacity: 0.85,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <span>{counts.fulfilled} выдано</span>
              <span>· {counts.approved} подтверждено</span>
              <span>· {counts.pending} в обработке</span>
              <span>· {counts.cancelled} отменено</span>
            </div>
          )}
        </div>
      </section>

      <div className="container-om" style={{ padding: "32px 0 80px" }}>
        {orders.length > 0 ? (
          <div className="bg-white border border-[var(--om-ink-100)]">
            {orders.map((o, i) => (
              <div
                key={o.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "180px 1fr 200px 140px",
                  gap: 24,
                  padding: "20px 24px",
                  borderBottom:
                    i < orders.length - 1
                      ? "1px solid var(--om-ink-100)"
                      : "none",
                }}
              >
                <div
                  className="bg-img"
                  style={{
                    aspectRatio: "1/1",
                    backgroundImage: o.product?.cover_url
                      ? `url(${o.product.cover_url})`
                      : "url(/brand/imagery/runner-overhead.jpg)",
                    background: o.product?.cover_url
                      ? undefined
                      : "var(--om-ink-50)",
                  }}
                />
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    {o.product?.title ?? "—"}
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
                    заказ · {formatDate(o.created_at)}
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
                      &laquo;{o.trainer_note}&raquo;
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
                      от OM: {o.admin_note}
                    </div>
                  )}
                </div>
                <div
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
                </div>
                <div
                  className="font-display"
                  style={{
                    textAlign: "right",
                    fontWeight: 900,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                  }}
                >
                  −{o.price_points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "48px 32px", textAlign: "center" }}
          >
            <div className="eyebrow">пусто</div>
            <p
              className="font-body mt-3"
              style={{ color: "var(--om-ink-500)", fontSize: 15 }}
            >
              заказов пока нет. накопи баллы и забирай мерч, экипировку и привилегии.
            </p>
            <Link
              href="/dashboard/shop"
              className="btn btn-blue mt-5"
              style={{ display: "inline-flex" }}
            >
              открыть шоп →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function pluralOrder(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "заказ забран";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "заказа забрано";
  return "заказов забрано";
}
