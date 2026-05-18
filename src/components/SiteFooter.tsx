import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "programme",
    items: [
      { label: "how it works", href: "/#how" },
      { label: "challenges", href: "/challenges" },
      { label: "leaderboard", href: "/leaderboard" },
      { label: "events", href: "/events" },
      { label: "trainers", href: "/trainers" },
    ],
  },
  {
    title: "for coaches",
    items: [
      { label: "log in", href: "/login" },
      { label: "become an ambassador", href: "/login" },
      { label: "partner clubs", href: "/clubs" },
    ],
  },
  {
    title: "contact",
    items: [
      { label: "ambasadori@om.md", href: "mailto:ambasadori@om.md" },
      { label: "Chișinău, Moldova" },
      { label: "privacy policy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--om-ink-900)] text-white pt-20">
      <div className="container-om">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-14 border-b border-white/10">
          <div>
            <Logo variant="white" size={32} />
            <div
              className="font-display font-extrabold text-[14px] tracking-[-0.01em] mt-4"
              style={{ opacity: 0.8 }}
            >
              ambasadori — loyalty programme for coaches
            </div>
            <div
              className="font-display mt-8"
              style={{
                fontWeight: 900,
                fontSize: 48,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              este
              <br />
              decizia
              <br />
              mea.
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div
                className="font-display"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.5,
                  marginBottom: 14,
                }}
              >
                {col.title}
              </div>
              <ul className="flex flex-col gap-[10px] list-none p-0 m-0">
                {col.items.map((item) => (
                  <li key={item.label} className="text-sm" style={{ opacity: 0.85 }}>
                    {item.href ? (
                      <Link href={item.href} className="hover:opacity-100" style={{ opacity: 0.85 }}>
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 pb-8">
          <span className="font-mono text-[11px]" style={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} OM water · Chișinău
          </span>
        </div>
      </div>
    </footer>
  );
}
