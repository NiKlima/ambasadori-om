import Link from "next/link";
import Image from "next/image";

type Props = {
  coverUrl: string | null | undefined;
  title: string;
  subtitle?: string | null;
  meta?: string;
  href?: string;
  ctaLabel?: string;
  badge?: string;
  dimmed?: boolean;
};

export function HeroCard({
  coverUrl,
  title,
  subtitle,
  meta,
  href,
  ctaLabel,
  badge,
  dimmed,
}: Props) {
  const inner = (
    <article
      className={`group relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-om-ink ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="(min-width: 768px) 360px, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-om-blue-dark via-om-ink to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />

      {meta && (
        <span className="absolute top-4 right-4 rounded-full bg-white/95 text-om-ink text-xs font-semibold px-3 py-1 backdrop-blur">
          {meta}
        </span>
      )}
      {badge && (
        <span className="absolute top-4 left-4 rounded-full bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 backdrop-blur">
          {badge}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-xl font-semibold leading-tight">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-white/80 line-clamp-2">{subtitle}</p>
        )}
        {ctaLabel && (
          <span className="mt-4 inline-flex items-center rounded-full bg-white text-om-ink px-4 py-1.5 text-sm font-medium">
            {ctaLabel} →
          </span>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
