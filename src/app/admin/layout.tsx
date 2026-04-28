import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="container-xl pt-10 pb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
          Админка OM
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Тренеры</Link>
          <Link href="/admin/challenges" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Челленджи</Link>
          <Link href="/admin/products" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Шоп</Link>
          <Link href="/admin/orders" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Заказы</Link>
          <Link href="/admin/surveys" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Опросы</Link>
          <Link href="/admin/moderation" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Модерация</Link>
          <Link href="/admin/points" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Ручные начисления</Link>
          <Link href="/admin/events" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">События</Link>
          <Link href="/admin/messages" className="rounded-full bg-white border border-black/10 px-4 py-2 hover:border-om-ink">Сообщения</Link>
        </nav>
      </div>
      <main className="container-xl pb-16">{children}</main>
      <SiteFooter />
    </>
  );
}
