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

export function VideoAccordion({
  url,
  label = "как снимать",
}: {
  url: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const embed = youtubeEmbed(url);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);

  return (
    <div className="bg-white border border-[var(--om-ink-100)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
        style={{
          padding: "14px 18px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: "transparent",
          border: 0,
          cursor: "pointer",
        }}
      >
        <span>▶ {label}</span>
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {open ? "скрыть" : "показать"}
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 18px 18px",
            borderTop: "1px solid var(--om-ink-100)",
            paddingTop: 14,
          }}
        >
          {embed ? (
            <div className="aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={embed}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : isVideo ? (
            <video controls className="w-full bg-black" preload="metadata">
              <source src={url} />
            </video>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="lk"
            >
              открыть видео →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
