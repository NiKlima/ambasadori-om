"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 5;
const MAX_BYTES = 2 * 1024 * 1024;

export function GalleryUpload({ userId, current }: { userId: string; current: string[] }) {
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
      setError(`Максимум ${MAX_PHOTOS} фото`);
      return;
    }
    const toUpload = Array.from(files).slice(0, slots);
    for (const f of toUpload) {
      if (f.size > MAX_BYTES) {
        setError(`Файл ${f.name} больше 2МБ`);
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
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  async function remove(url: string) {
    setBusy(true);
    try {
      await persist(items.filter((u) => u !== url));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Галерея (до {MAX_PHOTOS} фото, до 2МБ)</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((url) => (
          <div key={url} className="relative group">
            <img src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => remove(url)}
              disabled={busy}
              className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition"
            >
              Удалить
            </button>
          </div>
        ))}
        {items.length < MAX_PHOTOS && (
          <label className={`flex items-center justify-center aspect-square rounded-xl border-2 border-dashed border-black/15 cursor-pointer text-sm text-om-muted ${busy ? "opacity-50" : "hover:bg-om-cream"}`}>
            {busy ? "Загрузка…" : "+ Добавить"}
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
