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

export function PhotoUpload({
  userId,
  currentUrl,
  field,
  label,
  accept,
  maxBytes,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    setError(null);
    if (file.size > maxBytes) {
      setError(`файл больше ${(maxBytes / 1024 / 1024).toFixed(1)} мб`);
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
      setError(e instanceof Error ? e.message : "ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
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
        {label}
      </div>
      {field === "photo_url" && currentUrl && (
        <div
          className="bg-img mt-3"
          style={{
            aspectRatio: "1/1",
            backgroundImage: `url(${currentUrl})`,
          }}
        />
      )}
      {field === "intro_video_url" && currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="lk mt-3 inline-block"
          style={{ fontSize: 12 }}
        >
          текущий файл →
        </a>
      )}
      <label
        className={`btn btn-outline mt-3 ${busy ? "opacity-50" : ""}`}
        style={{ width: "100%", cursor: busy ? "not-allowed" : "pointer" }}
      >
        {busy
          ? "загрузка…"
          : currentUrl
            ? "заменить фото"
            : "загрузить фото"}
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
