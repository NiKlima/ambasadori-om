import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ContactsThanksPage() {
  return (
    <>
      <SiteHeader />
      <section className="container-xl pt-24 pb-32 text-center max-w-xl mx-auto">
        <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
          Сообщение отправлено
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold mb-6">Спасибо!</h1>
        <p className="text-om-muted mb-8">
          Мы получили твоё сообщение и ответим в течение 1–2 рабочих дней.
        </p>
        <Link href="/" className="inline-flex rounded-full bg-om-ink text-om-cream px-6 py-3 font-medium hover:bg-om-blue-dark transition">
          На главную
        </Link>
      </section>
      <SiteFooter />
    </>
  );
}
