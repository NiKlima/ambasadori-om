import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Контакты · OM Амбассадоры" };

export default function ContactsPage() {
  return (
    <>
      <SiteHeader />
      <section className="container-xl pt-16 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-om-blue-dark mb-4">
              Связаться
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
              Напиши нам.
            </h1>
            <p className="text-om-muted text-lg max-w-md">
              Партнёрство, вопросы программы, идеи. Отвечаем в течение 1–2 рабочих
              дней.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
