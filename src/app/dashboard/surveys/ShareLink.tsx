"use client";

import { useState } from "react";

type Props = { url: string };

export function ShareLink({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 rounded-lg border border-black/10 bg-om-cream px-3 py-2 text-xs font-mono"
      />
      <button
        onClick={copy}
        className="rounded-full bg-om-ink text-om-cream px-4 py-2 text-xs whitespace-nowrap"
      >
        {copied ? "Скопировано" : "Копировать"}
      </button>
    </div>
  );
}
