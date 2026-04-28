import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ContactsThanksPage() {
  return (
    <>
      <SiteHeader />
      <section
        className="bg-[var(--om-ink-50)]"
        style={{ padding: "120px 0" }}
      >
        <div
          className="container-om"
          style={{ maxWidth: 640, textAlign: "center" }}
        >
          <div className="eyebrow">сообщение отправлено</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(48px, 7vw, 88px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              margin: "16px 0 16px",
            }}
          >
            спасибо.
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--om-ink-500)",
              marginBottom: 32,
              maxWidth: 460,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            мы получили твоё сообщение и ответим в течение 1–2 рабочих дней.
          </p>
          <Link href="/" className="btn btn-ink" style={{ display: "inline-flex" }}>
            на главную →
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
