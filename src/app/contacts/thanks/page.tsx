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
          <div className="eyebrow">message sent</div>
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
            thanks.
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
            we got your message and will reply within 1–2 business days.
          </p>
          <Link href="/" className="btn btn-ink" style={{ display: "inline-flex" }}>
            home →
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
