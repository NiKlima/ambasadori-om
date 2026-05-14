"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const NAV: { href: string; label: string }[] = [
  { href: "/#how", label: "how it works" },
  { href: "/#challenges", label: "challenges" },
  { href: "/clubs", label: "clubs" },
  { href: "/#trainers", label: "trainers" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/events", label: "events" },
];

type Props = {
  user: { id: string } | null;
  role: string | null;
  onBlue?: boolean;
};

export function SiteHeaderClient({ user, role, onBlue = false }: Props) {
  const pathname = usePathname();

  // active = только точное совпадение реального маршрута, без якорей.
  // на landing (`/`) никакая nav-ссылка не подсвечивается, кроме hover.
  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/leaderboard") return pathname.startsWith("/leaderboard");
    if (href === "/events") return pathname.startsWith("/events");
    if (href === "/clubs") return pathname.startsWith("/clubs");
    return pathname === href;
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b ${
        onBlue
          ? "bg-[var(--om-blue)] text-white border-white/20"
          : "bg-white/95 backdrop-blur text-[var(--om-ink-900)] border-[var(--om-ink-100)]"
      }`}
    >
      <div className="container-om flex items-center justify-between h-[72px]">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo variant={onBlue ? "white" : "blue"} size={22} />
            <span
              className={`hidden sm:inline-block w-px h-[22px] ${
                onBlue ? "bg-white/20" : "bg-[var(--om-ink-100)]"
              }`}
            />
            <span
              className="font-display font-extrabold text-[13px] tracking-[-0.01em] hidden sm:inline-block"
              style={{ opacity: 0.9 }}
            >
              ambasadori
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link font-display font-extrabold text-[13px] tracking-[-0.005em] pb-[2px] ${
                  active ? "is-active" : ""
                } ${onBlue ? "nav-link-on-blue" : "nav-link-on-white"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span
            className="font-mono text-[11px] hidden sm:inline-block"
            style={{ color: onBlue ? "rgba(255,255,255,.7)" : "var(--om-ink-500)" }}
          >
            <b style={{ color: onBlue ? "#fff" : "var(--om-ink-900)" }}>EN</b> / RO
          </span>
          {user ? (
            <>
              <Link
                href={role === "admin" ? "/admin" : "/dashboard"}
                className={`btn btn-sm ${onBlue ? "btn-white" : "btn-blue"}`}
              >
                {role === "admin" ? "admin" : "dashboard"}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  className="font-display font-extrabold text-[13px] tracking-[-0.005em]"
                  style={{ color: onBlue ? "rgba(255,255,255,.75)" : "var(--om-ink-500)" }}
                  type="submit"
                >
                  log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={`btn btn-sm ${onBlue ? "btn-white" : "btn-blue"}`}
            >
              log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
