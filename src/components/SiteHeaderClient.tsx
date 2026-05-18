"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const NAV: { href: string; label: string }[] = [
  { href: "/#how", label: "how it works" },
  { href: "/challenges", label: "challenges" },
  { href: "/clubs", label: "clubs" },
  { href: "/trainers", label: "trainers" },
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  // active = только точное совпадение реального маршрута, без якорей.
  // на landing (`/`) никакая nav-ссылка не подсвечивается, кроме hover.
  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/leaderboard") return pathname.startsWith("/leaderboard");
    if (href === "/events") return pathname.startsWith("/events");
    if (href === "/clubs") return pathname.startsWith("/clubs");
    if (href === "/challenges") return pathname.startsWith("/challenges");
    if (href === "/trainers") return pathname === "/trainers" || pathname.startsWith("/trainers/");
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

        <div className="flex items-center gap-3 sm:gap-4">
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
              <form action="/auth/signout" method="post" className="hidden sm:block">
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

          {/* Burger button — mobile only */}
          <button
            type="button"
            aria-label={menuOpen ? "close menu" : "open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center"
            style={{
              width: 36, height: 36,
              border: `1px solid ${onBlue ? "rgba(255,255,255,.4)" : "var(--om-ink-200)"}`,
              background: "transparent",
              color: onBlue ? "#fff" : "var(--om-ink-900)",
              cursor: "pointer",
            }}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3 3 L15 15 M15 3 L3 15" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 5 L16 5 M2 9 L16 9 M2 13 L16 13" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: onBlue ? "var(--om-blue)" : "#fff",
            borderColor: onBlue ? "rgba(255,255,255,.2)" : "var(--om-ink-100)",
          }}
        >
          <nav className="container-om flex flex-col" style={{ padding: "12px 0 16px" }}>
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-extrabold text-[15px] tracking-[-0.005em] flex items-center justify-between"
                  style={{
                    padding: "14px 4px",
                    borderBottom: `1px solid ${onBlue ? "rgba(255,255,255,.12)" : "var(--om-ink-100)"}`,
                    color: onBlue
                      ? active ? "#fff" : "rgba(255,255,255,.8)"
                      : active ? "var(--om-blue)" : "var(--om-ink-900)",
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ opacity: 0.4, fontSize: 13 }}>→</span>
                </Link>
              );
            })}
            {user && (
              <form action="/auth/signout" method="post" style={{ marginTop: 14 }}>
                <button
                  type="submit"
                  className="font-display font-extrabold text-[13px] tracking-[-0.005em] w-full text-left"
                  style={{
                    padding: "10px 4px",
                    color: onBlue ? "rgba(255,255,255,.7)" : "var(--om-ink-500)",
                  }}
                >
                  log out →
                </button>
              </form>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
