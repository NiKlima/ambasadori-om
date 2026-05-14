"use client";

import { useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import type { LeaderboardRow } from "@/lib/types";

type Sort = "points" | "name";

function ageFrom(birthdate: string | null) {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function LeaderboardClient({
  rows,
  clubsFromDb,
}: {
  rows: LeaderboardRow[];
  clubsFromDb?: string[];
}) {
  const [query, setQuery] = useState("");
  const [club, setClub] = useState<string>("");
  const [sport, setSport] = useState<string>("");
  const [sort, setSort] = useState<Sort>("points");

  const clubs = useMemo(() => {
    if (clubsFromDb && clubsFromDb.length > 0) return clubsFromDb;
    return Array.from(new Set(rows.map((r) => r.club).filter(Boolean))) as string[];
  }, [rows, clubsFromDb]);
  const sports = useMemo(
    () => Array.from(new Set(rows.map((r) => r.sport).filter(Boolean))) as string[],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) list = list.filter((r) => r.full_name.toLowerCase().includes(q));
    if (club) list = list.filter((r) => r.club === club);
    if (sport) list = list.filter((r) => r.sport === sport);
    list = [...list].sort((a, b) =>
      sort === "name"
        ? a.full_name.localeCompare(b.full_name, "ru")
        : b.total_points - a.total_points,
    );
    return list;
  }, [rows, query, club, sport, sort]);

  const podium = filtered.slice(0, 3);
  const tail = filtered.slice(3);

  const reset = () => {
    setQuery("");
    setClub("");
    setSport("");
    setSort("points");
  };

  return (
    <>
      {/* Filters bar */}
      <section className="bg-white border-b border-[var(--om-ink-100)]">
        <div className="container-om py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_200px_200px_140px] gap-3 items-center">
          <input
            className="input"
            placeholder="search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input"
            value={club}
            onChange={(e) => setClub(e.target.value)}
          >
            <option value="">all clubs ({clubs.length})</option>
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="points">points ↓</option>
            <option value="name">by name</option>
          </select>
          <button className="btn btn-outline" onClick={reset} type="button">
            reset
          </button>
        </div>
        <div className="container-om pb-5 flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSport("")}
            className={`chip ${sport === "" ? "chip-ink" : ""}`}
          >
            all sports
          </button>
          {sports.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              className={`chip ${sport === s ? "chip-ink" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Top 3 podium */}
      {podium.length === 3 && (
        <section className="bg-[var(--om-ink-50)]" style={{ padding: "56px 0" }}>
          <div className="container-om grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1fr] gap-4 items-stretch">
            {[
              { row: podium[1], rank: 2, bg: "var(--om-ink-900)", fg: "#fff", border: "none" as const, av: undefined as "blue" | "ink" | "default" | undefined, stripes: false },
              { row: podium[0], rank: 1, bg: "var(--om-blue)", fg: "#fff", border: "none" as const, av: "default" as const, stripes: true },
              { row: podium[2], rank: 3, bg: "#fff", fg: "var(--om-ink-900)", border: "1px solid var(--om-ink-100)", av: "blue" as const, stripes: false },
            ].map((t) => {
              const isOne = t.rank === 1;
              const isThree = t.rank === 3;
              return (
                <a
                  key={t.row.id}
                  href={`/trainers/${t.row.id}`}
                  className="relative block"
                  style={{
                    background: t.bg,
                    color: t.fg,
                    minHeight: isOne ? 420 : 380,
                    padding: "28px",
                    border: t.border,
                    textDecoration: "none",
                  }}
                >
                  {t.stripes && (
                    <div
                      className="om-stripes-band"
                      style={{ position: "absolute", inset: 0, opacity: 0.32, pointerEvents: "none" }}
                    />
                  )}
                  <div
                    className="relative flex flex-col h-full justify-between"
                  >
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 900,
                        fontSize: isOne ? 96 : 72,
                        letterSpacing: "-0.04em",
                        lineHeight: 0.85,
                        opacity: isThree ? 0.18 : 0.4,
                      }}
                    >
                      №{t.rank}
                    </div>
                    <div>
                      <Avatar
                        name={t.row.full_name}
                        photoUrl={t.row.photo_url}
                        size={isOne ? "lg" : "md"}
                        variant={t.av}
                      />
                      <div
                        className="font-display mt-3"
                        style={{
                          fontWeight: 900,
                          fontSize: isOne ? 28 : 22,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {t.row.full_name}
                      </div>
                      <div
                        className="font-mono mt-1"
                        style={{
                          fontSize: 11,
                          opacity: 0.75,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {t.row.club} · {t.row.sport}
                      </div>
                      <div
                        className="mt-4 pt-3 flex items-baseline gap-2"
                        style={{
                          borderTop: isThree
                            ? "1px solid var(--om-ink-100)"
                            : "1px solid rgba(255,255,255,.2)",
                        }}
                      >
                        <span
                          className="font-display"
                          style={{
                            fontWeight: 900,
                            fontSize: isOne ? 48 : 36,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {t.row.total_points}
                        </span>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 11,
                            opacity: 0.75,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Full table */}
      <section className="bg-[var(--om-ink-50)]" style={{ padding: "0 0 96px" }}>
        <div className="container-om">
          <div
            className="border border-[var(--om-ink-100)]"
            style={{ borderTop: "none" }}
          >
            <div className="lb-row head">
              <div>#</div>
              <div>coach</div>
              <div>club</div>
              <div>sport</div>
              <div style={{ textAlign: "right" }}>age</div>
              <div style={{ textAlign: "right" }}>points</div>
            </div>
            {filtered.map((r, i) => {
              const age = ageFrom(r.birthdate);
              const isTop = i === 0 && sort === "points" && !query && !club && !sport;
              return (
                <div key={r.id} className={`lb-row${isTop ? " top1" : ""}`}>
                  <div className="rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={r.full_name}
                      photoUrl={r.photo_url}
                      size="md"
                      variant={isTop ? "blue" : "default"}
                    />
                    <div>
                      <a
                        href={`/trainers/${r.id}`}
                        className="font-display block"
                        style={{
                          fontWeight: 800,
                          fontSize: 16,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {r.full_name}
                      </a>
                      {age != null && (
                        <div
                          className="font-mono mt-0.5"
                          style={{ fontSize: 11, color: "var(--om-ink-500)" }}
                        >
                          {age} y.o.
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="font-display"
                    style={{ fontWeight: 700, fontSize: 14 }}
                  >
                    {r.club}
                  </div>
                  <div>{r.sport && <span className="chip">{r.sport}</span>}</div>
                  <div
                    className="font-mono"
                    style={{
                      textAlign: "right",
                      fontSize: 13,
                      color: "var(--om-ink-500)",
                    }}
                  >
                    {age ?? "—"}
                  </div>
                  <div
                    className="font-display"
                    style={{
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      color: isTop ? "var(--om-blue)" : "var(--om-ink-900)",
                    }}
                  >
                    {r.total_points}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div
                className="font-mono"
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  color: "var(--om-ink-500)",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                no results
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
