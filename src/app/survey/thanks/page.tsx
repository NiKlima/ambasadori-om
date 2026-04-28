import Link from "next/link";

export default function ThanksPage() {
  return (
    <div
      className="container-om"
      style={{ padding: "120px 0", maxWidth: 640 }}
    >
      <div
        className="bg-white border border-[var(--om-ink-100)]"
        style={{ padding: "48px 32px", textAlign: "center" }}
      >
        <div className="eyebrow">ответы получены</div>
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
            color: "var(--om-ink-500)",
            lineHeight: 1.55,
            marginBottom: 32,
            maxWidth: 460,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          твой тренер автоматически получит баллы программы OM.
        </p>
        <Link href="/" className="btn btn-blue" style={{ display: "inline-flex" }}>
          узнать про OM →
        </Link>
      </div>
    </div>
  );
}
