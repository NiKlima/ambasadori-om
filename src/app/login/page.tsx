import Link from "next/link";
import { signIn } from "./actions";
import { Logo } from "@/components/ui/Logo";

type SearchParams = Promise<{ error?: string; next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen grid md:grid-cols-[1.2fr_1fr] bg-white">
      {/* LEFT — photo + brand panel */}
      <div className="relative overflow-hidden bg-[var(--om-ink-900)] hidden md:block">
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/runner-asphalt-line.jpg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,71,185,0.55), rgba(35,31,32,0.85))",
          }}
        />
        <div
          className="om-stripes-band"
          style={{ position: "absolute", inset: 0, opacity: 0.18 }}
        />
        <Link href="/" className="absolute left-14 top-14 z-10 inline-block">
          <Logo variant="white" size={24} />
        </Link>
        <div
          className="absolute left-14 right-14 bottom-14 text-white"
          style={{ zIndex: 1 }}
        >
          <div className="eyebrow eyebrow-w">closed programme · invite only</div>
          <div
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(56px, 7vw, 88px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: "16px 0 0",
            }}
          >
            welcome back,
            <br />
            ambassador.
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8 sm:p-14">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="md:hidden mb-8 inline-block">
            <Logo variant="blue" size={22} />
          </Link>
          <div className="eyebrow">log in</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: 56,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              margin: "12px 0 12px",
            }}
          >
            your dashboard.
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--om-ink-500)",
              lineHeight: 1.55,
              marginBottom: 28,
            }}
          >
            use the email and password sent by the OM team. the programme is closed.
          </p>

          {error && (
            <div
              className="mb-6 px-4 py-3 text-sm"
              style={{
                background: "color-mix(in oklab, var(--om-magenta) 12%, white)",
                border: "1px solid color-mix(in oklab, var(--om-magenta) 30%, white)",
                color: "var(--om-magenta)",
              }}
            >
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signIn} className="grid gap-3">
            {next && <input type="hidden" name="next" value={next} />}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="email"
              className="input"
            />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="password"
              className="input"
            />
            <button type="submit" className="btn btn-ink mt-1">
              log in →
            </button>
          </form>

          <div
            className="font-mono mt-7"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            no access?{" "}
            <a href="mailto:ambasadori@om.md" style={{ color: "var(--om-blue)" }}>
              ambasadori@om.md
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
