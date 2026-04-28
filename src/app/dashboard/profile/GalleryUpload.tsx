"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 12;
const MAX_BYTES = 2 * 1024 * 1024;

export function GalleryUpload({
  userId,
  current,
}: {
  userId: string;
  current: string[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>(current);
  const router = useRouter();

  async function persist(next: string[]) {
    const supabase = createClient();
    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ gallery: next })
      .eq("id", userId);
    if (dbErr) throw dbErr;
    setItems(next);
    router.refresh();
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const slots = MAX_PHOTOS - items.length;
    if (slots <= 0) {
      setError(`максимум ${MAX_PHOTOS} фото`);
      return;
    }
    const toUpload = Array.from(files).slice(0, slots);
    for (const f of toUpload) {
      if (f.size > MAX_BYTES) {
        setError(`файл ${f.name} больше 2 мб`);
        return;
      }
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const next = [...items];
      for (const f of toUpload) {
        const ext = f.name.split(".").pop() || "jpg";
        const key = `${userId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(key, f, { upsert: false, contentType: f.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(key);
        next.push(pub.publicUrl);
      }
      await persist(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  async function remove(url: string) {
    setBusy(true);
    try {
      await persist(items.filter((u) => u !== url));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <div
          className="font-display"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--om-ink-500)",
          }}
        >
          галерея · {items.length} из {MAX_PHOTOS}
        </div>
        {items.length < MAX_PHOTOS && (
          <label
            className="lk"
            style={{ fontSize: 12, cursor: busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "загрузка…" : "+ загрузить"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <div
        className="grid mt-3"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}
      >
        {items.map((url) => (
          <div
            key={url}
            className="bg-img relative group"
            style={{ aspectRatio: "1/1", backgroundImage: `url(${url})` }}
          >
            <button
              type="button"
              onClick={() => remove(url)}
              disabled={busy}
              className="font-display absolute opacity-0 group-hover:opacity-100 transition"
              style={{
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                background: "rgba(35,31,32,0.7)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 800,
                border: 0,
              }}
              aria-label="удалить"
            >
              ×
            </button>
          </div>
        ))}
        {items.length < MAX_PHOTOS && (
          <label
            className={`flex items-center justify-center font-mono ${busy ? "opacity-50" : ""}`}
            style={{
              aspectRatio: "1/1",
              border: "1.5px dashed var(--om-ink-100)",
              cursor: busy ? "not-allowed" : "pointer",
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: "var(--om-ink-50)",
            }}
          >
            +
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {error && (
        <p
          className="font-mono mt-2"
          style={{
            fontSize: 11,
            color: "var(--om-magenta)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
