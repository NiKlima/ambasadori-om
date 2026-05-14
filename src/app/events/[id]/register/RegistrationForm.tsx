"use client";

import { useState, useTransition } from "react";
import { registerForEvent } from "./actions";

const FIELD_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--om-ink-500)",
  marginBottom: 8,
};

export function RegistrationForm({
  eventId,
  presetName,
  presetEmail,
}: {
  eventId: string;
  presetName?: string;
  presetEmail?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handle(fd: FormData) {
    setError(null);
    start(async () => {
      const res = await registerForEvent(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form
      action={handle}
      className="bg-white border border-[var(--om-ink-100)]"
      style={{ padding: "36px 40px" }}
    >
      <input type="hidden" name="event_id" value={eventId} />
      <div className="eyebrow">your details</div>
      <div className="grid gap-3 mt-4">
        <div>
          <div style={FIELD_LABEL}>full name</div>
          <input
            className="input"
            name="name"
            required
            defaultValue={presetName}
            placeholder="your name"
          />
        </div>
        <div>
          <div style={FIELD_LABEL}>email</div>
          <input
            className="input"
            name="email"
            type="email"
            required
            defaultValue={presetEmail}
            placeholder="you@email.md"
          />
        </div>
        <div>
          <div style={FIELD_LABEL}>phone · optional</div>
          <input
            className="input"
            name="phone"
            type="tel"
            placeholder="+373 …"
          />
        </div>
        <div>
          <div style={FIELD_LABEL}>note · optional</div>
          <textarea
            className="input"
            name="note"
            rows={3}
            placeholder="anything we should know"
            style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 14 }}
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
            marginTop: 8,
          }}
        >
          <input
            type="checkbox"
            name="consent"
            required
            style={{ marginTop: 3 }}
          />
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
          style={{ alignSelf: "flex-start", marginTop: 8 }}
        >
          {pending ? "registering…" : "register →"}
        </button>
      </div>
    </form>
  );
}
