"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const ITEMS: { href: string; label: string }[] = [
  { href: "/admin", label: "trainers" },
  { href: "/admin/clubs", label: "clubs" },
  { href: "/admin/moderation", label: "moderation" },
  { href: "/admin/challenges", label: "challenges" },
  { href: "/admin/products", label: "shop" },
  { href: "/admin/orders", label: "orders" },
  { href: "/admin/surveys", label: "surveys" },
  { href: "/admin/points", label: "points" },
  { href: "/admin/events", label: "events" },
  { href: "/admin/messages", label: "messages" },
];

export function AdminTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-[var(--om-ink-900)] text-white border-b border-white/10">
      <div className="container-om flex items-center justify-between h-[72px] gap-6">
        <div className="flex items-center gap-3">
          <Logo variant="white" size={22} />
          <span className="hidden sm:inline-block w-px h-[22px] bg-white/20" />
          <span
            className="font-display font-extrabold text-[13px] tracking-[-0.01em] uppercase"
            style={{ letterSpacing: "0.08em", opacity: 0.6 }}
          >
            admin
          </span>
        </div>

        <nav className="flex flex-wrap gap-5 overflow-x-auto">
          {ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="font-display font-extrabold text-[12px] tracking-[-0.005em] py-1 whitespace-nowrap"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,.55)",
                  borderBottom: active
                    ? "2px solid var(--om-blue)"
                    : "2px solid transparent",
                  paddingBottom: 4,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="font-display font-extrabold text-[12px] tracking-[-0.005em]"
            style={{ color: "rgba(255,255,255,.6)" }}
          >
            log out
          </button>
        </form>
      </div>
    </header>
  );
}
