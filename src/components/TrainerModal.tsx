"use client";

import { useEffect, useState } from "react";
import { TrainerProfileBody } from "./TrainerProfileBody";
import type { LeaderboardRow } from "@/lib/types";

type Props = {
  trainer: LeaderboardRow;
  rank?: number;
  onClose: () => void;
};

function ShareButton({ trainer }: { trainer: LeaderboardRow }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/trainers/${trainer.id}`;
    const data = {
      title: trainer.full_name,
      text: `${trainer.full_name} — амбассадор ОМ`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-om-ink text-om-cream text-xs uppercase tracking-wider px-4 py-2 hover:bg-om-blue-dark transition"
    >
      {copied ? "Скопировано ✓" : "Поделиться"}
    </button>
  );
}

export function TrainerModal({ trainer, rank, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Профиль: ${trainer.full_name}`}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-om-cream rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-om-ink flex items-center justify-center text-xl shadow"
        >
          ×
        </button>
        <TrainerProfileBody trainer={trainer} rank={rank} shareSlot={<ShareButton trainer={trainer} />} />
      </div>
    </div>
  );
}
