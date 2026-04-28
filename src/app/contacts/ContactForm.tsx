"use client";

import { useState, useTransition } from "react";
import { submitContact } from "./actions";

export function ContactForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handle(fd: FormData) {
    setError(null);
    start(async () => {
      const res = await submitContact(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handle} className="rounded-3xl bg-white p-8 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Имя</label>
        <input name="name" required className="w-full rounded-xl border border-black/10 px-4 py-3" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input name="email" type="email" required className="w-full rounded-xl border border-black/10 px-4 py-3" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Сообщение</label>
        <textarea name="message" rows={5} required className="w-full rounded-xl border border-black/10 px-4 py-3" />
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span className="text-sm text-om-muted">
          Я согласен на обработку персональных данных согласно{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-om-ink">
            политике конфиденциальности
          </a>
          .
        </span>
      </label>
      {error && <div className="rounded-2xl bg-om-coral/10 text-om-coral p-4 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-om-ink text-om-cream px-8 py-3 font-medium hover:bg-om-blue-dark transition disabled:opacity-50"
      >
        {pending ? "Отправляем…" : "Отправить"}
      </button>
    </form>
  );
}
