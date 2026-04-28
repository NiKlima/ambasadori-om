"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { TrainerModal } from "./TrainerModal";
import type { LeaderboardRow } from "@/lib/types";

type Props = {
  rows: LeaderboardRow[];
  variant?: "table" | "compact";
};

export function LeaderboardList({ rows, variant = "table" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((t) => t.id === openId) ?? null;
  const openIndex = open ? rows.findIndex((t) => t.id === open.id) : -1;

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-3xl px-6 py-12 text-center text-om-muted">
        Пока нет амбассадоров в этой категории.
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div className="bg-white rounded-3xl overflow-hidden">
          {rows.map((row, i) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setOpenId(row.id)}
              className={`w-full text-left flex items-center gap-4 px-6 py-4 hover:bg-om-blue-soft transition ${
                i > 0 ? "border-t border-black/5" : ""
              }`}
            >
              <div className="w-10 font-mono text-sm text-om-muted">
                {String(i + 1).padStart(2, "0")}
              </div>
              <Avatar name={row.full_name} photoUrl={row.photo_url} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{row.full_name}</div>
                <div className="text-om-muted text-sm truncate">
                  {row.club ?? "—"} {row.sport ? `· ${row.sport}` : ""}
                </div>
              </div>
              <div className="text-lg font-semibold tabular-nums">{row.total_points}</div>
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

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_200px_200px_100px] gap-4 px-6 py-4 text-xs uppercase tracking-wider text-om-muted border-b border-black/5">
          <div>#</div>
          <div>Амбассадор</div>
          <div>Клуб</div>
          <div>Вид спорта</div>
          <div className="text-right">Баллы</div>
        </div>
        {rows.map((row, i) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setOpenId(row.id)}
            className="w-full text-left grid grid-cols-[40px_1fr_80px] md:grid-cols-[60px_1fr_200px_200px_100px] gap-4 px-6 py-4 border-t border-black/5 items-center hover:bg-om-blue-soft transition"
          >
            <div className="font-mono text-sm text-om-muted">{String(i + 1).padStart(2, "0")}</div>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={row.full_name} photoUrl={row.photo_url} size="md" />
              <div className="min-w-0">
                <div className="font-semibold truncate">{row.full_name}</div>
                <div className="md:hidden text-om-muted text-xs truncate">
                  {row.club ?? "—"} {row.sport ? `· ${row.sport}` : ""}
                </div>
              </div>
            </div>
            <div className="hidden md:block text-om-muted truncate">{row.club ?? "—"}</div>
            <div className="hidden md:block text-om-muted truncate">{row.sport ?? "—"}</div>
            <div className="text-right text-lg font-semibold tabular-nums">{row.total_points}</div>
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
