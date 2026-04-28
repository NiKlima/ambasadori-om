import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "./Avatar";
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
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
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
      <video controls className="w-full rounded-2xl bg-black" preload="metadata">
        <source src={url} />
      </video>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-om-blue-dark underline">
      Открыть видео →
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
    <>
      <div className="relative bg-om-blue-soft px-8 pt-12 pb-8 md:px-14 md:pt-16 md:pb-10 rounded-t-3xl">
        {rank != null && (
          <div className="absolute top-6 left-6 md:top-8 md:left-10 text-xs font-mono uppercase tracking-[0.2em] text-om-blue-dark">
            #{String(rank).padStart(2, "0")} в лидерборде
          </div>
        )}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
          <Avatar name={trainer.full_name} photoUrl={trainer.photo_url} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              {trainer.full_name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {trainer.sport && (
                <span className="rounded-full bg-om-ink text-om-cream text-xs uppercase tracking-wider px-3 py-1.5">
                  {trainer.sport}
                </span>
              )}
              {trainer.club && (
                <span className="rounded-full bg-white/80 text-om-ink text-xs uppercase tracking-wider px-3 py-1.5">
                  {trainer.club}
                </span>
              )}
              {age != null && (
                <span className="rounded-full bg-white/80 text-om-ink text-xs uppercase tracking-wider px-3 py-1.5">
                  {age} {pluralRu(age, ["год", "года", "лет"])}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-5xl md:text-6xl font-semibold tabular-nums leading-none">
              {trainer.total_points}
            </div>
            <div className="text-xs uppercase tracking-wider text-om-muted mt-2">
              {pluralRu(trainer.total_points, ["балл", "балла", "баллов"])}
            </div>
            {shareSlot && <div className="mt-3">{shareSlot}</div>}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 md:px-14 md:py-10 space-y-10">
        {trainer.quote && (
          <section>
            <blockquote className="text-2xl md:text-3xl font-semibold leading-snug italic text-om-ink border-l-4 border-om-blue-dark pl-6">
              «{trainer.quote}»
            </blockquote>
          </section>
        )}

        {trainer.intro_video_url && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Видео-интро
            </div>
            <VideoEmbed url={trainer.intro_video_url} />
          </section>
        )}

        {trainer.bio && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-3">
              О себе
            </div>
            <p className="text-om-ink leading-relaxed whitespace-pre-line">
              {trainer.bio}
            </p>
          </section>
        )}

        {trainer.story && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-3">
              История
            </div>
            <div className="prose prose-neutral max-w-none text-om-ink leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{trainer.story}</ReactMarkdown>
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Галерея
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-2xl"
                />
              ))}
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Регалии
            </div>
            <ul className="space-y-2">
              {achievements.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3"
                >
                  <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-om-blue-dark shrink-0" />
                  <span className="text-sm leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {socials.length > 0 && (
          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Соцсети
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map(([k, v]) => {
                const href = socialUrl(k, v);
                const label = SOCIAL_LABELS[k] ?? k;
                if (!href) {
                  return (
                    <span
                      key={k}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
                    >
                      {label}: {v}
                    </span>
                  );
                }
                return (
                  <a
                    key={k}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:border-om-ink transition"
                  >
                    {label} →
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {!trainer.bio &&
          !trainer.quote &&
          !trainer.story &&
          !trainer.intro_video_url &&
          gallery.length === 0 &&
          achievements.length === 0 &&
          socials.length === 0 && (
            <div className="text-om-muted text-sm">
              Тренер ещё не заполнил публичный профиль.
            </div>
          )}
      </div>
    </>
  );
}
