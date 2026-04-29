"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Challenge, Submission } from "@/lib/types";
import { SubmissionForm } from "./SubmissionForm";

const KIND_LABEL: Record<Challenge["kind"], string> = {
  photo_ai: "photo · AI",
  video_ai: "video · AI",
  survey_trainee: "survey",
  manual: "manual review",
};

const KIND_FILTER: Record<Challenge["kind"], string> = {
  photo_ai: "photo",
  video_ai: "video",
  survey_trainee: "survey",
  manual: "manual",
};

type StatusCode = "magenta" | "blue" | "muted";

function challengeStatus(subs: Submission[]): { label: string; code: StatusCode } {
  if (!subs || subs.length === 0) return { label: "available", code: "muted" };
  const pending = subs.find((s) => s.status === "pending");
  if (pending) return { label: "in review", code: "magenta" };
  const approved = subs.find((s) => s.status === "approved");
  if (approved) return { label: "approved", code: "blue" };
  const rejected = subs.find((s) => s.status === "rejected");
  if (rejected) return { label: "rejected · try again", code: "magenta" };
  return { label: "available", code: "muted" };
}

function statusColor(code: StatusCode): string {
  if (code === "magenta") return "var(--om-magenta)";
  if (code === "blue") return "var(--om-blue)";
  return "var(--om-ink-500)";
}

const FILTERS = ["all", "photo", "video", "survey", "manual"] as const;
type Filter = (typeof FILTERS)[number];

export function ChallengesGrid({
  challenges,
  byChallenge,
  promo,
}: {
  challenges: Challenge[];
  byChallenge: Record<string, Submission[]>;
  promo: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return challenges;
    return challenges.filter((c) => KIND_FILTER[c.kind] === filter);
  }, [challenges, filter]);

  const totalPoints = challenges.reduce((sum, c) => sum + (c.points ?? 0), 0);
  const inReview = challenges.filter((c) => {
    const subs = byChallenge[c.id] ?? [];
    return subs.some((s) => s.status === "pending");
  }).length;
  const ready = challenges.filter((c) => {
    const subs = byChallenge[c.id] ?? [];
    return subs.length === 0 || subs.every((s) => s.status === "rejected");
  }).length;

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-blue)] text-white"
        style={{ height: 480 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/runner-overhead.jpg)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,71,185,0.85) 0%, rgba(0,71,185,0.35) 100%)",
          }}
        />
        <div
          className="om-stripes-band"
          style={{ position: "absolute", inset: 0, opacity: 0.18 }}
        />
        <div
          className="container-om relative h-full flex flex-col justify-end"
          style={{ paddingBottom: 48 }}
        >
          <div className="eyebrow eyebrow-w">april 2026 · season is open</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(56px, 8vw, 128px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              margin: "12px 0 0",
              maxWidth: 1100,
            }}
          >
            {challenges.length} {challenges.length === 1 ? "challenge" : "challenges"}.
            <br />
            up to {totalPoints} pts.
          </h1>
          <div
            className="font-mono mt-6 flex flex-wrap gap-x-8 gap-y-2"
            style={{
              fontSize: 12,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>{ready} active</span>
            <span>· {inReview} in review</span>
            <span>· auto-credit in 2 days</span>
          </div>
        </div>
      </section>

      <div className="container-om" style={{ paddingTop: 40, paddingBottom: 96 }}>
        {/* Filter bar */}
        <div
          className="bg-white border border-[var(--om-ink-100)] flex justify-between items-center flex-wrap gap-3"
          style={{ padding: "18px 22px", marginBottom: 20 }}
        >
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "chip-ink" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
sort: by points ↓
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2" style={{ gap: 20 }}>
          {filtered.map((ch) => {
            const subs = byChallenge[ch.id] ?? [];
            const st = challengeStatus(subs);
            const isOpen = openId === ch.id;
            const isSurvey = ch.kind === "survey_trainee";
            const surveyHref = isSurvey && promo
              ? `/survey/${ch.id}?ref=${encodeURIComponent(promo)}`
              : null;
            const cover = ch.cover_url ?? "/brand/imagery/runner-asphalt-line.jpg";

            return (
              <article
                key={ch.id}
                className="bg-white border border-[var(--om-ink-100)] grid"
                style={{
                  gridTemplateColumns: "260px 1fr",
                  minHeight: 280,
                }}
              >
                <div
                  className="bg-img relative"
                  style={{ backgroundImage: `url(${cover})` }}
                >
                  <div className="absolute" style={{ top: 14, left: 14 }}>
                    <span
                      className="chip"
                      style={{
                        background: "rgba(255,255,255,.95)",
                        borderColor: "transparent",
                      }}
                    >
                      {KIND_LABEL[ch.kind]}
                    </span>
                  </div>
                  <div className="absolute" style={{ bottom: 14, left: 14 }}>
                    <span className="chip chip-blue">+{ch.points} pts</span>
                  </div>
                </div>
                <div
                  className="flex flex-col justify-between"
                  style={{ padding: "26px 28px" }}
                >
                  <div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: statusColor(st.code),
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      ● {st.label}
                    </div>
                    <div
                      className="font-display mt-2"
                      style={{
                        fontWeight: 900,
                        fontSize: 22,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {ch.title}
                    </div>
                    {ch.description && (
                      <div
                        className="font-body mt-2"
                        style={{
                          fontSize: 13,
                          color: "var(--om-ink-500)",
                          lineHeight: 1.55,
                        }}
                      >
                        {ch.description}
                      </div>
                    )}
                  </div>
                  <div
                    className="flex justify-between items-center mt-4 pt-3"
                    style={{ borderTop: "1px solid var(--om-ink-100)" }}
                  >
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: "var(--om-ink-500)" }}
                    >
                      {KIND_LABEL[ch.kind]}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : ch.id)}
                      className="btn btn-blue btn-sm"
                    >
                      {isOpen ? "close" : "open →"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      borderTop: "1px solid var(--om-ink-100)",
                      padding: "24px 28px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    {isSurvey ? (
                      <div className="flex flex-col gap-3">
                        <p
                          className="font-body"
                          style={{
                            fontSize: 13,
                            color: "var(--om-ink-500)",
                            lineHeight: 1.55,
                          }}
                        >
                          share the link with a client — points come automatically after the survey is submitted.
                        </p>
                        {surveyHref ? (
                          <Link
                            href="/dashboard/surveys"
                            className="btn btn-ink"
                            style={{ alignSelf: "flex-start" }}
                          >
get link
                          </Link>
                        ) : (
                          <p
                            className="font-mono"
                            style={{
                              fontSize: 12,
                              color: "var(--om-magenta)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            set your promo code in profile first — it works as the ref-code in the link.
                          </p>
                        )}
                      </div>
                    ) : (
                      <SubmissionForm challengeId={ch.id} kind={ch.kind} />
                    )}
                  </div>
                )}
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div
              className="md:col-span-2 bg-white border border-[var(--om-ink-100)] font-mono"
              style={{
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--om-ink-500)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {challenges.length === 0
                ? "challenges will appear soon. stay tuned."
                : "nothing matches this filter"}
            </div>
          )}
        </div>

        {/* Streak callout */}
        {challenges.length > 0 && (
          <div
            className="bg-[var(--om-ink-900)] text-white relative overflow-hidden grid items-center"
            style={{
              marginTop: 24,
              padding: "40px 44px",
              gridTemplateColumns: "1fr 240px",
              gap: 28,
            }}
          >
            <div
              className="om-stripes-white-soft"
              style={{ position: "absolute", inset: 0 }}
            />
            <div className="relative">
              <div className="eyebrow eyebrow-w">streak bonus</div>
              <div
                className="font-display mt-2"
                style={{
                  fontWeight: 900,
                  fontSize: 36,
                  letterSpacing: "-0.03em",
                }}
              >
                complete 5 challenges this month → +20 pts
              </div>
              <div
                className="font-mono mt-2"
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                your progress: 0 / 5
              </div>
            </div>
            <div
              className="relative grid"
              style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}
            >
              {[0, 0, 0, 0, 0].map((on, i) => (
                <div
                  key={i}
                  className="font-display flex flex-col justify-end items-center"
                  style={{
                    aspectRatio: "1/1.4",
                    background: on ? "var(--om-blue)" : "rgba(255,255,255,.1)",
                    padding: 6,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {on ? "✓" : i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
