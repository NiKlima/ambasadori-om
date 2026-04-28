"use client";

import { useState, useTransition } from "react";
import { submitContact } from "./actions";

const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--om-ink-500)",
  marginBottom: 8,
};

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
    <form
      action={handle}
      className="bg-[var(--om-ink-50)] border border-[var(--om-ink-100)]"
      style={{ padding: "32px 36px" }}
    >
      <div className="eyebrow">форма обратной связи</div>
      <div className="grid mt-4" style={{ gap: 12 }}>
        <div>
          <div style={FIELD_LABEL_STYLE}>имя</div>
          <input className="input" name="name" required placeholder="как тебя зовут" />
        </div>
        <div>
          <div style={FIELD_LABEL_STYLE}>email</div>
          <input className="input" name="email" type="email" required placeholder="you@email.md" />
        </div>
        <div>
          <div style={FIELD_LABEL_STYLE}>сообщение</div>
          <textarea
            className="input"
            name="message"
            rows={6}
            required
            placeholder="о чём хочешь поговорить"
            style={{ resize: "none", fontFamily: "var(--font-body)" }}
          />
        </div>
        <label
          className="flex items-start gap-3 cursor-pointer font-mono"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.55,
          }}
        >
          <input
            type="checkbox"
            name="consent"
            required
            style={{ marginTop: 3 }}
          />
          <span>
            согласен на обработку персональных данных по{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="lk"
              style={{ display: "inline" }}
            >
              политике конфиденциальности
            </a>
            .
          </span>
        </label>
        {error && (
          <div
            className="font-mono"
            style={{
              padding: "12px 16px",
              border: "1px solid var(--om-magenta)",
              color: "var(--om-magenta)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "rgba(232,55,150,0.06)",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn btn-blue"
          style={{ marginTop: 6, alignSelf: "flex-start" }}
        >
          {pending ? "отправляем…" : "отправить →"}
        </button>
      </div>
    </form>
  );
}
