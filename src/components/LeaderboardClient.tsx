"use client";

import { useMemo, useState } from "react";
import { LeaderboardList } from "./LeaderboardList";
import type { LeaderboardRow } from "@/lib/types";

type Sort = "points" | "name";

export function LeaderboardClient({ rows }: { rows: LeaderboardRow[] }) {
  const [query, setQuery] = useState("");
  const [club, setClub] = useState<string>("");
  const [sort, setSort] = useState<Sort>("points");

  const clubs = useMemo(
    () => Array.from(new Set(rows.map((r) => r.club).filter(Boolean))) as string[],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) list = list.filter((r) => r.full_name.toLowerCase().includes(q));
    if (club) list = list.filter((r) => r.club === club);
    list = [...list].sort((a, b) =>
      sort === "name"
        ? a.full_name.localeCompare(b.full_name, "ru")
        : b.total_points - a.total_points,
    );
    return list;
  }, [rows, query, club, sort]);

  return (
    <>
      <div className="grid md:grid-cols-[1fr_220px_220px] gap-3 mb-6">
        <input
          type="search"
          placeholder="Поиск по имени"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm"
        />
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm"
        >
          <option value="">Все клубы</option>
          {clubs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm"
        >
          <option value="points">По баллам</option>
          <option value="name">По имени</option>
        </select>
      </div>
      <LeaderboardList rows={filtered} variant="table" />
    </>
  );
}
