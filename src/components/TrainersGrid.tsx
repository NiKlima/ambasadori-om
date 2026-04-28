"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { TrainerModal } from "./TrainerModal";
import type { LeaderboardRow } from "@/lib/types";

type Props = { trainers: LeaderboardRow[] };

export function TrainersGrid({ trainers }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = trainers.find((t) => t.id === openId) ?? null;
  const openIndex = open ? trainers.findIndex((t) => t.id === open.id) : -1;

  if (trainers.length === 0) {
    return (
      <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 rounded-3xl bg-white p-8 text-om-muted">
        Список амбассадоров пока пуст.
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {trainers.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpenId(t.id)}
            className="text-left rounded-3xl bg-white border border-black/5 p-6 flex flex-col hover:border-om-ink/20 hover:shadow-md transition"
          >
            <Avatar name={t.full_name} photoUrl={t.photo_url} size="lg" />
            <div className="mt-4 font-semibold">{t.full_name}</div>
            <div className="text-om-muted text-sm mt-1">
              {t.club ?? "—"}
              {t.sport ? ` · ${t.sport}` : ""}
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-om-muted">Баллы</span>
              <span className="font-semibold tabular-nums">{t.total_points}</span>
            </div>
          </button>
        ))}
      </div>
      {open && (
        <TrainerModal
          trainer={open}
          rank={openIndex >= 0 ? openIndex + 1 : undefined}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
