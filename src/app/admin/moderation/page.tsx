import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { Kpi } from "@/components/ui/Kpi";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { moderateSubmission } from "../actions";

type Row = {
  id: string;
  photo_url: string | null;
  link: string | null;
  note: string | null;
  status: string;
  created_at: string;
  trainer: {
    id: string;
    full_name: string;
    club: string | null;
    sport: string | null;
    photo_url: string | null;
  } | null;
  challenge: { id: string; title: string; points: number } | null;
};

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select(
      "id, photo_url, link, note, status, created_at, trainer:profiles!submissions_trainer_id_fkey(id, full_name, club, sport, photo_url), challenge:challenges(id, title, points)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const list = (data ?? []) as unknown as Row[];
  const ptsAtStake = list.reduce(
    (sum, r) => sum + (r.challenge?.points ?? 0),
    0,
  );

  return (
    <>
      {/* Section hero */}
      <section className="bg-white border-b border-[var(--om-ink-100)]">
        <div
          className="grid items-end gap-4 om-grid-responsive"
          style={{
            padding: "0",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          }}
        >
          <div>
            <div className="eyebrow">moderation queue</div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(40px, 6vw, 64px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                margin: "8px 0 0",
              }}
            >
              {list.length === 0
                ? "queue empty."
                : `${list.length} to review.`}
            </h1>
          </div>
          <Kpi label="in review" value={list.length} />
          <Kpi
            label="points in queue"
            value={
              <span style={{ color: "var(--om-blue)" }}>+{ptsAtStake}</span>
            }
          />
          <Kpi label="avg wait" value="—" />
        </div>
      </section>

      <div className="grid gap-3" style={{ padding: "24px 0 80px" }}>
        {list.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-[var(--om-ink-100)] grid items-stretch om-grid-responsive"
            style={{
              gridTemplateColumns: "240px 1fr 280px",
            }}
          >
            <div
              className="relative bg-[var(--om-ink-50)] overflow-hidden"
              style={{ minHeight: 220 }}
            >
              {s.photo_url ? (
                <Image
                  src={s.photo_url}
                  alt="submission"
                  fill
                  className="object-cover"
                  sizes="240px"
                  unoptimized
                />
              ) : (
                <div
                  className="h-full flex items-center justify-center font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: 16,
                    textAlign: "center",
                  }}
                >
                  no photo
                </div>
              )}
              <span
                className="chip absolute"
                style={{
                  top: 12,
                  left: 12,
                  background: "rgba(255,255,255,.95)",
                  borderColor: "transparent",
                }}
              >
                submission
              </span>
            </div>

            <div
              style={{
                padding: "22px 28px",
                borderRight: "1px solid var(--om-ink-100)",
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "var(--om-ink-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {formatDate(s.created_at)}
              </div>
              <div
                className="flex items-center gap-3"
                style={{ marginTop: 8 }}
              >
                <Avatar
                  name={s.trainer?.full_name ?? "?"}
                  photoUrl={s.trainer?.photo_url ?? null}
                  size="sm"
                  variant="blue"
                />
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.trainer?.full_name ?? "unknown"}
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--om-ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.trainer?.club ?? "—"}
                    {s.trainer?.sport ? ` · ${s.trainer.sport}` : ""}
                  </div>
                </div>
              </div>

              <div
                className="flex gap-2 items-center flex-wrap"
                style={{ marginTop: 18 }}
              >
                <span className="chip">{s.challenge?.title ?? "—"}</span>
                <span className="chip chip-blue">
                  +{s.challenge?.points ?? 0} pts
                </span>
              </div>

              {s.note && (
                <div
                  className="font-body"
                  style={{
                    fontSize: 14,
                    color: "var(--om-ink-500)",
                    marginTop: 14,
                    lineHeight: 1.55,
                  }}
                >
                  &laquo;{s.note}&raquo;
                </div>
              )}
              {s.link && (
                <div style={{ marginTop: 8 }}>
                  <Link
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lk"
                    style={{ fontSize: 13, wordBreak: "break-all" }}
                  >
                    {s.link} →
                  </Link>
                </div>
              )}
            </div>

            <div
              className="bg-[var(--om-ink-50)] flex flex-col gap-2 justify-center"
              style={{ padding: "22px 24px" }}
            >
              <form action={moderateSubmission}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="action" value="approve" />
                <button
                  type="submit"
                  className="btn btn-blue"
                  style={{ width: "100%" }}
                >
                  approve · +{s.challenge?.points ?? 0}
                </button>
              </form>
              <form action={moderateSubmission} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="action" value="reject" />
                <input
                  name="comment"
                  placeholder="reason (optional)"
                  className="input"
                />
                <button
                  type="submit"
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                >
                  reject
                </button>
              </form>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "60px 32px", textAlign: "center" }}
          >
            <div className="eyebrow">all clear</div>
            <p
              className="font-body mt-3"
              style={{ fontSize: 15, color: "var(--om-ink-500)" }}
            >
              queue empty. submissions will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
