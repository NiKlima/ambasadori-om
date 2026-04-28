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
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 rounded-2xl bg-om-ink text-om-cream shadow-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="text-sm leading-relaxed flex-1">
        Используем cookies для аналитики и работы программы.{" "}
        <a href="/privacy" className="underline opacity-90 hover:opacity-100">
          Подробнее
        </a>
        .
      </div>
      <button
        type="button"
        onClick={accept}
        className="rounded-full bg-om-cream text-om-ink px-5 py-2 text-sm font-medium hover:bg-white transition self-start md:self-auto shrink-0"
      >
        Принимаю
      </button>
    </div>
  );
}
