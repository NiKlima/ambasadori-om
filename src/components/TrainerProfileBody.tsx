import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ageFromBirthdate, pluralRu, socialUrl } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  telegram: "Telegram",
  youtube: "YouTube",
};

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function VideoEmbed({ url }: { url: string }) {
  const embed = youtubeEmbed(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={embed}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return (
      <video controls className="w-full bg-black" preload="metadata">
        <source src={url} />
      </video>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="lk">
      открыть видео →
    </a>
  );
}

export function TrainerProfileBody({
  trainer,
  rank,
  shareSlot,
}: {
  trainer: LeaderboardRow;
  rank?: number;
  shareSlot?: React.ReactNode;
}) {
  const age = ageFromBirthdate(trainer.birthdate);
  const socials = Object.entries(trainer.socials ?? {}).filter(([, v]) => v);
  const achievements = trainer.achievements ?? [];
  const gallery = trainer.gallery ?? [];

  return (
    <div className="bg-white border border-[var(--om-ink-100)]">
      {/* Top split */}
      <div className="grid md:grid-cols-[1.05fr_1fr] min-h-[540px] relative">
        {/* Left — photo + quote */}
        <div className="relative overflow-hidden bg-[var(--om-ink-900)] min-h-[320px] md:min-h-0">
          {trainer.photo_url ? (
            <div
              className="bg-img"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${trainer.photo_url})`,
              }}
            />
          ) : (
            <div
              className="bg-img"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,71,185,0.3) 0%, rgba(35,31,32,0.85) 100%)",
            }}
          />
          {rank != null && (
            <div className="absolute left-8 top-8 z-10">
              <span className="chip chip-outline-w">● rank {rank} · 2026</span>
            </div>
          )}
          {trainer.quote && (
            <div className="absolute left-8 right-8 bottom-8 text-white">
              <div
                className="font-mono mb-3"
                style={{
                  fontSize: 11,
                  opacity: 0.75,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                // личный манифест
              </div>
              <div
                className="font-display"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                }}
              >
                «{trainer.quote}»
              </div>
            </div>
          )}
        </div>

        {/* Right — meta */}
        <div className="p-8 md:p-11 flex flex-col justify-between gap-6">
          <div>
            <div className="eyebrow">
              амбассадор{trainer.sport ? ` · ${trainer.sport}` : ""}
            </div>
            <h1
              className="font-display"
              style={{
                fontWeight: 900,
                fontSize: "clamp(40px, 5vw, 64px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                margin: "12px 0 8px",
              }}
            >
              {trainer.full_name.split(" ").map((part, i) => (
                <span key={i}>
                  {part.toLowerCase()}
                  {i === 0 && trainer.full_name.split(" ").length > 1 ? <br /> : ""}
                  {i === trainer.full_name.split(" ").length - 1 ? "." : ""}
                </span>
              ))}
            </h1>
            <div
              className="font-mono"
              style={{
                fontSize: 12,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {age != null && `${age} лет`}
              {age != null && trainer.club ? " · " : ""}
              {trainer.club}
              {(age != null || trainer.club) ? " · Кишинёв" : "Кишинёв"}
            </div>

            {socials.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-6">
                {socials.map(([k, v]) => {
                  const href = socialUrl(k, v);
                  const label = SOCIAL_LABELS[k] ?? k;
                  const text = `@${v} · ${label}`;
                  if (!href) return <span key={k} className="chip">{text}</span>;
                  return (
                    <a
                      key={k}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip"
                    >
                      {text}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="grid grid-cols-3"
            style={{
              borderTop: "1px solid var(--om-ink-100)",
              borderBottom: "1px solid var(--om-ink-100)",
              padding: "20px 0",
            }}
          >
            <div
              className="pr-4"
              style={{ borderRight: "1px solid var(--om-ink-100)" }}
            >
              <div className="eyebrow eyebrow-ink">баллы</div>
              <div
                className="font-display mt-1"
                style={{
                  fontWeight: 900,
                  fontSize: 44,
                  letterSpacing: "-0.04em",
                  color: "var(--om-blue)",
                }}
              >
                {trainer.total_points}
              </div>
            </div>
            <div
              className="px-4"
              style={{ borderRight: "1px solid var(--om-ink-100)" }}
            >
              <div className="eyebrow eyebrow-ink">место</div>
              <div
                className="font-display mt-1"
                style={{
                  fontWeight: 900,
                  fontSize: 44,
                  letterSpacing: "-0.04em",
                }}
              >
                {rank != null ? `№${rank}` : "—"}
              </div>
            </div>
            <div className="pl-4">
              <div className="eyebrow eyebrow-ink">регалий</div>
              <div
                className="font-display mt-1"
                style={{
                  fontWeight: 900,
                  fontSize: 44,
                  letterSpacing: "-0.04em",
                }}
              >
                {achievements.length}
              </div>
            </div>
          </div>

          {shareSlot && <div className="flex gap-3">{shareSlot}</div>}
        </div>
      </div>

      {/* Body */}
      {(trainer.bio || trainer.story || trainer.intro_video_url || gallery.length > 0 || achievements.length > 0) && (
        <div
          className="grid md:grid-cols-[1.4fr_1fr] gap-12 p-8 md:p-11"
          style={{ borderTop: "1px solid var(--om-ink-100)" }}
        >
          <div>
            {(trainer.story || trainer.bio) && (
              <>
                <div className="eyebrow">история</div>
                <h2
                  className="font-display"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 3vw, 36px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    margin: "10px 0 24px",
                  }}
                >
                  путь к финишу — путь к себе.
                </h2>
                {trainer.story ? (
                  <div className="om-prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {trainer.story}
                    </ReactMarkdown>
                  </div>
                ) : trainer.bio ? (
                  <p
                    className="font-body whitespace-pre-line"
                    style={{
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: "var(--om-ink-900)",
                    }}
                  >
                    {trainer.bio}
                  </p>
                ) : null}
              </>
            )}

            {achievements.length > 0 && (
              <div className="mt-9">
                <div className="eyebrow">регалии</div>
                <ul
                  className="m-0 p-0 list-none flex flex-col mt-4 border border-[var(--om-ink-100)]"
                >
                  {achievements.map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-4 px-4 py-3 font-display"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        borderBottom:
                          i < achievements.length - 1
                            ? "1px solid var(--om-ink-100)"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          background: "var(--om-blue)",
                          marginTop: 8,
                          flexShrink: 0,
                        }}
                      />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            {trainer.intro_video_url && (
              <div className="mb-8">
                <div className="eyebrow">видео-интро</div>
                <div className="mt-3 border border-[var(--om-ink-100)]">
                  <VideoEmbed url={trainer.intro_video_url} />
                </div>
              </div>
            )}

            {gallery.length > 0 && (
              <div>
                <div className="eyebrow">галерея</div>
                <div
                  className="grid grid-cols-2 mt-3 border border-[var(--om-ink-100)]"
                >
                  {gallery.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="bg-img"
                      style={{
                        aspectRatio: "1/1",
                        backgroundImage: `url(${img})`,
                        borderRight:
                          i % 2 === 0 ? "1px solid var(--om-ink-100)" : "none",
                        borderBottom:
                          i < 2 && gallery.length > 2
                            ? "1px solid var(--om-ink-100)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
                {gallery.length > 4 && (
                  <div
                    className="font-mono mt-2"
                    style={{
                      fontSize: 11,
                      color: "var(--om-ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    + {gallery.length - 4} ещё
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slogan strip */}
      <div
        className="bg-[var(--om-blue)] text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4"
        style={{ padding: "24px 32px" }}
      >
        <div
          className="om-stripes-band"
          style={{ position: "absolute", inset: 0, opacity: 0.32 }}
        />
        <div className="relative flex items-center gap-3">
          <span
            className="font-mono"
            style={{
              fontSize: 12,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            амбассадор 2026
          </span>
        </div>
        <div
          className="relative font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(20px, 2.5vw, 28px)",
            letterSpacing: "-0.03em",
          }}
        >
          este decizia mea.
        </div>
      </div>
    </div>
  );
}
