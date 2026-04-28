"use client";

import { useState, useTransition } from "react";
import { submitChallenge } from "./actions";
import type { ChallengeKind } from "@/lib/types";

type Props = { challengeId: string; kind: ChallengeKind };

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
        setMsg(`Ошибка: ${res.error}`);
        return;
      }
      const ai = res?.aiStatus;
      if (ai === "approved") { setTone("ok"); setMsg("AI одобрил — баллы начислены."); }
      else if (ai === "rejected") { setTone("err"); setMsg("AI отклонил. Загрузи новое подтверждение."); }
      else if (ai === "pending") { setTone("info"); setMsg("AI не уверен — отправлено на ручную модерацию."); }
      else { setTone("ok"); setMsg("Отправлено! Жди модерации."); }
      setOpen(false);
    });
  }

  if (!open) {
    const toneCls =
      tone === "err" ? "text-om-coral" : tone === "info" ? "text-om-blue-dark" : "text-om-green";
    return (
      <div>
        <button
          onClick={() => { setOpen(true); setMsg(null); }}
          className="mt-4 rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm hover:bg-om-blue-dark transition"
        >
          Отправить подтверждение
        </button>
        {msg && <p className={`mt-3 text-sm ${toneCls}`}>{msg}</p>}
      </div>
    );
  }

  const showPhoto = kind === "photo_ai" || kind === "manual";
  const showVideo = kind === "video_ai";

  return (
    <form action={handle} className="mt-4 space-y-3 p-4 rounded-2xl bg-om-blue-soft">
      {showPhoto && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Фото</label>
          <input name="photo" type="file" accept="image/*" className="block text-sm w-full" />
        </div>
      )}
      {showVideo && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Видео</label>
          <input name="video" type="file" accept="video/*" className="block text-sm w-full" />
          <p className="text-xs text-om-muted mt-1">AI смотрит ключевой кадр. Сними одним дублем.</p>
        </div>
      )}
      <div>
        <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Ссылка (stories, пост)</label>
        <input
          name="link"
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-om-muted mb-1">Комментарий</label>
        <textarea
          name="note"
          rows={2}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Отправка…" : "Отправить"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-om-ink/20 px-5 py-2 text-sm"
        >
          Отмена
        </button>
      </div>
      {msg && <p className="text-sm text-om-coral">{msg}</p>}
    </form>
  );
}
