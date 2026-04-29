"use client";

import { useState, useTransition } from "react";
import { submitSurvey } from "./actions";
import type { SurveyQuestion } from "@/lib/types";

type Props = {
  challengeId: string;
  ref: string;
  questions: SurveyQuestion[];
};

const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--om-ink-500)",
  marginBottom: 8,
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
    <form action={handle} className="grid gap-4">
      <div
        className="bg-white border border-[var(--om-ink-100)] grid gap-4"
        style={{ padding: "24px 28px" }}
      >
        <div>
          <div style={FIELD_LABEL_STYLE}>name</div>
          <input className="input" name="name" required />
        </div>
        <div>
          <div style={FIELD_LABEL_STYLE}>email</div>
          <input
            className="input"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <p
            className="font-mono mt-2"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
email is used only to prevent duplicate submissions
          </p>
        </div>
      </div>

      {questions.map((q, i) => (
        <div
          key={q.id}
          className="bg-white border border-[var(--om-ink-100)] grid gap-3"
          style={{ padding: "24px 28px" }}
        >
          <div className="eyebrow">question {i + 1}</div>
          <div
            className="font-display"
            style={{
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {q.text}
          </div>
          {q.options.length > 0 ? (
            <div className="grid gap-2">
              {q.options.map((opt, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 cursor-pointer font-body"
                  style={{
                    padding: "12px 14px",
                    border: "1px solid var(--om-ink-100)",
                    fontSize: 14,
                  }}
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.label}
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="input"
              name={`q_${q.id}`}
              rows={3}
              required
              style={{ resize: "none", fontFamily: "var(--font-body)" }}
            />
          )}
        </div>
      ))}

      <label
        className="flex items-start gap-3 bg-white border border-[var(--om-ink-100)] cursor-pointer font-mono"
        style={{
          padding: "16px 20px",
          fontSize: 12,
          color: "var(--om-ink-500)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1.55,
        }}
      >
        <input type="checkbox" name="consent" required style={{ marginTop: 3 }} />
        <span>
i agree to processing of personal data under the{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="lk"
            style={{ display: "inline" }}
          >
            privacy policy
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
        style={{ alignSelf: "flex-start" }}
      >
{pending ? "sending…" : "submit answers →"}
      </button>
    </form>
  );
}
