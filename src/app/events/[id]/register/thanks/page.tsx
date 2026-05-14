import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Params = Promise<{ id: string }>;

export default async function RegistrationThanksPage({ params }: { params: Params }) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <section className="bg-[var(--om-ink-50)]" style={{ padding: "120px 0" }}>
        <div className="container-om" style={{ maxWidth: 640, textAlign: "center" }}>
          <div className="eyebrow">you&apos;re registered</div>
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
            see you there.
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 16,
              color: "var(--om-ink-500)",
              lineHeight: 1.55,
              marginBottom: 32,
              maxWidth: 460,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            your registration is saved. we&apos;ll reach out with practical
            details closer to the date.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/events/${id}`} className="btn btn-ink">
              event details →
            </Link>
            <Link href="/events" className="btn btn-outline">
              all events
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
