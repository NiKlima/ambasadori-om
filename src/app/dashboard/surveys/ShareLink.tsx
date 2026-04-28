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
        className="input"
        style={{
          flex: 1,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          background: "var(--om-ink-50)",
        }}
      />
      <button
        type="button"
        onClick={copy}
        className="btn btn-blue"
        style={{ whiteSpace: "nowrap" }}
      >
        {copied ? "скопировано" : "копировать"}
      </button>
    </div>
  );
}
