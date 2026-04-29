import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "contact · OM Ambasadori" };

export default function ContactsPage() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-blue)] text-white"
        style={{ height: 520 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
            opacity: 0.45,
          }}
        />
        <div
          className="om-stripes-band"
          style={{ position: "absolute", inset: 0, opacity: 0.18 }}
        />
        <div
          className="container-om relative h-full flex flex-col justify-end"
          style={{ paddingBottom: 56 }}
        >
          <div className="eyebrow eyebrow-w">contact</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(72px, 10vw, 168px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              margin: "16px 0 0",
            }}
          >
write us.
          </h1>
        </div>
      </section>

      <section
        className="container-om grid md:grid-cols-2 gap-14 items-start"
        style={{ padding: "72px 0" }}
      >
        <div>
          <div className="eyebrow">about</div>
          <p
            className="font-body mt-3"
            style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 460 }}
          >
            partnerships, programme questions, ideas. we reply within 1–2 business days.
          </p>
          <div
            className="grid mt-8 border border-[var(--om-ink-100)]"
            style={{ gap: 0 }}
          >
            {[
              ["email", "ambasadori@om.md"],
              ["office", "Chișinău, str. Albișoara 4"],
              ["hours", "mon — fri · 9:00 — 18:00"],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className="grid"
                style={{
                  gridTemplateColumns: "120px 1fr",
                  padding: "16px 20px",
                  borderBottom:
                    i < arr.length - 1
                      ? "1px solid var(--om-ink-100)"
                      : "none",
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  {k}
                </div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
        <ContactForm />
      </section>
      <SiteFooter />
    </>
  );
}
