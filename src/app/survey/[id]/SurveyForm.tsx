"use client";

import { useState, useTransition } from "react";
import { submitSurvey } from "./actions";
import type { SurveyQuestion } from "@/lib/types";

type Props = {
  challengeId: string;
  ref: string;
  questions: SurveyQuestion[];
};

export function SurveyForm({ challengeId, ref, questions }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handle(fd: FormData) {
    fd.set("challenge_id", challengeId);
    fd.set("ref", ref);
    setError(null);
    startTransition(async () => {
      const res = await submitSurvey(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handle} className="space-y-6">
      <div className="rounded-3xl bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Имя</label>
          <input name="name" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
          <p className="text-xs text-om-muted mt-1">
            Email нужен только чтобы исключить повторное прохождение.
          </p>
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-3xl bg-white p-6 space-y-3">
          <div className="text-xs uppercase tracking-wider text-om-muted">Вопрос {i + 1}</div>
          <div className="font-semibold text-lg">{q.text}</div>
          {q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2 cursor-pointer hover:border-om-ink">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.label}
                    required
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              name={`q_${q.id}`}
              rows={3}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          )}
        </div>
      ))}

      <label className="flex items-start gap-3 rounded-2xl bg-white p-4 cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span className="text-sm text-om-muted">
          Я согласен на обработку персональных данных согласно{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-om-ink">
            политике конфиденциальности
          </a>
          .
        </span>
      </label>

      {error && (
        <div className="rounded-2xl bg-om-coral/10 text-om-coral p-4 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-om-ink text-om-cream px-8 py-3 text-base font-medium hover:bg-om-blue-dark transition disabled:opacity-50"
      >
        {pending ? "Отправляем…" : "Отправить ответы"}
      </button>
    </form>
  );
}
