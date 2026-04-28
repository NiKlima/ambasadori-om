"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentUrl: string | null;
  field: "photo_url" | "intro_video_url";
  label: string;
  accept: string;
  maxBytes: number;
};

export function PhotoUpload({ userId, currentUrl, field, label, accept, maxBytes }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    setError(null);
    if (file.size > maxBytes) {
      setError(`Файл больше ${(maxBytes / 1024 / 1024).toFixed(1)}МБ`);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const key = `${userId}/${field}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(key, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(key);
      const url = pub.publicUrl;
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ [field]: url })
        .eq("id", userId);
      if (dbErr) throw dbErr;
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        {currentUrl && field === "photo_url" && (
          <img src={currentUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
        )}
        {currentUrl && field === "intro_video_url" && (
          <a href={currentUrl} target="_blank" rel="noreferrer" className="text-sm text-om-blue-dark underline">
            текущий файл
          </a>
        )}
        <label className={`rounded-full px-4 py-2 text-sm border border-black/10 bg-white cursor-pointer ${busy ? "opacity-50" : "hover:bg-om-cream"}`}>
          {busy ? "Загрузка…" : currentUrl ? "Заменить" : "Загрузить"}
          <input
            type="file"
            accept={accept}
            disabled={busy}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
