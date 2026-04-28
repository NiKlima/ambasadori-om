"use client";

import { useEffect, useState } from "react";

const KEY = "om.cookie.ok";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {}
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed bg-[var(--om-blue)] text-white flex flex-col md:flex-row md:items-center gap-4 z-50"
      style={{
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        padding: "20px 24px",
        boxShadow: "0 16px 40px -12px rgba(0,71,185,0.4)",
      }}
    >
      <div
        className="om-stripes-band"
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
      />
      <div
        className="font-body relative"
        style={{ flex: 1, fontSize: 13, lineHeight: 1.55 }}
      >
        используем cookies для аналитики и работы программы.{" "}
        <a
          href="/privacy"
          style={{
            textDecoration: "underline",
            color: "#fff",
          }}
        >
          подробнее
        </a>
        .
      </div>
      <button
        type="button"
        onClick={accept}
        className="btn btn-white relative shrink-0"
        style={{ alignSelf: "flex-start" }}
      >
        принимаю →
      </button>
    </div>
  );
}
