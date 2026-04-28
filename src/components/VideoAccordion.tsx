"use client";

import { useState } from "react";

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoAccordion({ url, label = "Как снимать" }: { url: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const embed = youtubeEmbed(url);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);

  return (
    <div className="rounded-2xl bg-white border border-black/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-om-cream transition"
      >
        <span>▶ {label}</span>
        <span className="text-om-muted">{open ? "Скрыть" : "Показать"}</span>
      </button>
      {open && (
        <div className="p-4 pt-0">
          {embed ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={embed}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : isVideo ? (
            <video controls className="w-full rounded-xl bg-black" preload="metadata">
              <source src={url} />
            </video>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-om-blue-dark underline text-sm">
              Открыть видео →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
