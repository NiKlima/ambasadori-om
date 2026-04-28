"use client";

import { useState, useTransition } from "react";
import { submitChallenge } from "./actions";
import type { ChallengeKind } from "@/lib/types";

type Props = { challengeId: string; kind: ChallengeKind };

const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--om-ink-500)",
  marginBottom: 6,
};

export function SubmissionForm({ challengeId, kind }: Props) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err" | "info">("ok");
  const [pending, startTransition] = useTransition();

  async function handle(fd: FormData) {
    fd.set("challenge_id", challengeId);
    startTransition(async () => {
      const res = await submitChallenge(fd);
      if (res?.error) {
        setTone("err");
        setMsg(`ошибка: ${res.error}`);
        return;
      }
      const ai = res?.aiStatus;
      if (ai === "approved") {
        setTone("ok");
        setMsg("AI одобрил — баллы начислены.");
      } else if (ai === "rejected") {
        setTone("err");
        setMsg("AI отклонил. загрузи новое подтверждение.");
      } else if (ai === "pending") {
        setTone("info");
        setMsg("AI не уверен — отправлено на ручную модерацию.");
      } else {
        setTone("ok");
        setMsg("отправлено. жди модерации.");
      }
      setOpen(false);
    });
  }

  const toneColor =
    tone === "err"
      ? "var(--om-magenta)"
      : tone === "info"
        ? "var(--om-blue)"
        : "var(--om-blue)";

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setMsg(null);
          }}
          className="btn btn-blue"
        >
          отправить подтверждение
        </button>
        {msg && (
          <p
            className="font-mono mt-3"
            style={{
              fontSize: 12,
              color: toneColor,
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

  const showPhoto = kind === "photo_ai" || kind === "manual";
  const showVideo = kind === "video_ai";

  return (
    <form
      action={handle}
      className="grid gap-3"
      style={{
        padding: "20px 22px",
        background: "var(--om-blue-50)",
        border: "1px solid var(--om-ink-100)",
      }}
    >
      {showPhoto && (
        <div>
          <div style={FIELD_LABEL_STYLE}>фото</div>
          <input className="input" name="photo" type="file" accept="image/*" />
        </div>
      )}
      {showVideo && (
        <div>
          <div style={FIELD_LABEL_STYLE}>видео</div>
          <input className="input" name="video" type="file" accept="video/*" />
          <p
            className="font-mono mt-2"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            AI смотрит ключевой кадр — сними одним дублем
          </p>
        </div>
      )}
      <div>
        <div style={FIELD_LABEL_STYLE}>ссылка (stories, пост)</div>
        <input
          className="input"
          name="link"
          type="url"
          placeholder="https://…"
        />
      </div>
      <div>
        <div style={FIELD_LABEL_STYLE}>комментарий</div>
        <textarea
          className="input"
          name="note"
          rows={2}
          style={{ resize: "none", fontFamily: "var(--font-body)", fontSize: 13 }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-ink"
        >
          {pending ? "отправляем…" : "отправить →"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-outline"
        >
          отмена
        </button>
      </div>
      {msg && (
        <p
          className="font-mono"
          style={{
            fontSize: 12,
            color: toneColor,
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
