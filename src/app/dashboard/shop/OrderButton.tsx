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
        setMsg("order placed. admin will reach out about delivery.");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          disabled={!affordable}
          onClick={() => {
            setOpen(true);
            setMsg(null);
          }}
          className={`btn ${affordable ? "btn-blue" : "btn-outline"}`}
          style={{ width: "100%" }}
        >
          {affordable ? `claim for ${price}` : "not enough points"}
        </button>
        {msg && (
          <p
            className="font-mono mt-2"
            style={{
              fontSize: 11,
              color: tone === "err" ? "var(--om-magenta)" : "var(--om-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {msg}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={submit} className="flex flex-col gap-2">
      <textarea
        name="note"
        rows={2}
        placeholder="note (address, size, contact)…"
        className="input"
        style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 13 }}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-ink"
          style={{ flex: 1 }}
        >
          {pending ? "placing…" : `confirm — ${price}`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-outline"
        >
          cancel
        </button>
      </div>
      {msg && (
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: tone === "err" ? "var(--om-magenta)" : "var(--om-blue)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
