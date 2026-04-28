"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const NAV: { href: string; label: string }[] = [
  { href: "/#how", label: "как работает" },
  { href: "/#challenges", label: "челленджи" },
  { href: "/#clubs", label: "клубы" },
  { href: "/#trainers", label: "тренеры" },
  { href: "/leaderboard", label: "лидерборд" },
  { href: "/events", label: "события" },
];

type Props = {
  user: { id: string } | null;
  role: string | null;
  onBlue?: boolean;
};

export function SiteHeaderClient({ user, role, onBlue = false }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    if (href === "/leaderboard") return pathname.startsWith("/leaderboard");
    if (href === "/events") return pathname.startsWith("/events");
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
                className="font-display font-extrabold text-[13px] tracking-[-0.005em] pb-[2px]"
                style={{
                  color: active
                    ? onBlue
                      ? "#fff"
                      : "var(--om-blue)"
                    : onBlue
                    ? "rgba(255,255,255,.75)"
                    : "var(--om-ink-900)",
                  borderBottom: active
                    ? `2px solid ${onBlue ? "#fff" : "var(--om-blue)"}`
                    : "2px solid transparent",
                }}
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
            <b style={{ color: onBlue ? "#fff" : "var(--om-ink-900)" }}>RU</b> / RO
          </span>
          {user ? (
            <>
              <Link
                href={role === "admin" ? "/admin" : "/dashboard"}
                className={`btn btn-sm ${onBlue ? "btn-white" : "btn-blue"}`}
              >
                {role === "admin" ? "админка" : "кабинет"}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  className="font-display font-extrabold text-[13px] tracking-[-0.005em]"
                  style={{ color: onBlue ? "rgba(255,255,255,.75)" : "var(--om-ink-500)" }}
                  type="submit"
                >
                  выйти
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={`btn btn-sm ${onBlue ? "btn-white" : "btn-blue"}`}
            >
              войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
