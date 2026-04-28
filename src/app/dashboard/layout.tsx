import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="container-xl pt-10 pb-6">
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Дашборд
          </Link>
          <Link href="/dashboard/challenges" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Челленджи
          </Link>
          <Link href="/dashboard/shop" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Шоп
          </Link>
          <Link href="/dashboard/orders" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Заказы
          </Link>
          <Link href="/dashboard/surveys" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Опросы
          </Link>
          <Link href="/dashboard/history" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            История
          </Link>
          <Link href="/dashboard/profile" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">
            Профиль
          </Link>
        </nav>
      </div>
      <main className="container-xl pb-16">{children}</main>
      <SiteFooter />
    </>
  );
}
