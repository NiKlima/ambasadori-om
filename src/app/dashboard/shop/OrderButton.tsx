"use client";

import { useState, useTransition } from "react";
import { placeOrder } from "./actions";

type Props = {
  productId: string;
  price: number;
  affordable: boolean;
};

export function OrderButton({ productId, price, affordable }: Props) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pending, startTransition] = useTransition();

  async function submit(fd: FormData) {
    fd.set("product_id", productId);
    startTransition(async () => {
      const res = await placeOrder(fd);
      if (res?.error) {
        setTone("err");
        setMsg(res.error);
      } else {
        setTone("ok");
        setMsg("Заказ создан. Админ свяжется по доставке.");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <div>
        <button
          disabled={!affordable}
          onClick={() => { setOpen(true); setMsg(null); }}
          className="w-full rounded-full bg-om-ink text-om-cream px-5 py-2.5 text-sm font-medium hover:bg-om-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {affordable ? `Заказать за ${price} баллов` : "Не хватает баллов"}
        </button>
        {msg && (
          <p className={`mt-2 text-xs ${tone === "err" ? "text-om-coral" : "text-om-green"}`}>
            {msg}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-2">
      <textarea
        name="note"
        rows={2}
        placeholder="Комментарий (адрес, размер, контакт)…"
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-om-ink text-om-cream px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Создаём…" : `Подтвердить — ${price}`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-om-ink/20 px-4 py-2 text-sm"
        >
          Отмена
        </button>
      </div>
      {msg && (
        <p className={`text-xs ${tone === "err" ? "text-om-coral" : "text-om-green"}`}>{msg}</p>
      )}
    </form>
  );
}
