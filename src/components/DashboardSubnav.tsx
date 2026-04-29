"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "dashboard" },
  { href: "/dashboard/challenges", label: "challenges" },
  { href: "/dashboard/shop", label: "shop" },
  { href: "/dashboard/orders", label: "orders" },
  { href: "/dashboard/surveys", label: "surveys" },
  { href: "/dashboard/history", label: "history" },
  { href: "/dashboard/profile", label: "profile" },
];

export function DashboardSubnav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[var(--om-ink-100)] bg-white">
      <div className="container-om flex flex-wrap gap-6 sm:gap-8 overflow-x-auto">
        {ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="font-display font-extrabold text-[13px] tracking-[-0.005em] py-4 whitespace-nowrap"
              style={{
                color: active ? "var(--om-blue)" : "var(--om-ink-500)",
                borderBottom: active
                  ? "3px solid var(--om-blue)"
                  : "3px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
