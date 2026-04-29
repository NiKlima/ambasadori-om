import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "privacy policy · OM Ambasadori",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <article
        className="container-om om-prose"
        style={{ padding: "72px 0", maxWidth: 760 }}
      >
        <div className="eyebrow">privacy policy</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 6vw, 72px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "16px 0 32px",
          }}
        >
          how we process
          <br />
          personal data.
        </h1>

        <p>
          the &laquo;ambasadori OM&raquo; programme (the &laquo;programme&raquo;) processes
          personal data of participating coaches and their clients in accordance with
          <strong> Law of the Republic of Moldova No. 133/2011</strong> &laquo;on the protection of personal data&raquo;.
        </p>

        <h2>data we collect</h2>
        <ul>
          <li>
            <strong>coaches:</strong> name, email, club, sport, date of birth,
            photo, social links, achievements, story and gallery, promo code.
          </li>
          <li>
            <strong>clients (surveys):</strong> name, email, answers. email is
            used only to prevent duplicate submissions.
          </li>
          <li>
            <strong>contact form:</strong> name, email, message text.
          </li>
        </ul>

        <h2>purposes of processing</h2>
        <ul>
          <li>tracking points in the programme and confirming challenge completion.</li>
          <li>publishing a public coach card on the programme website.</li>
          <li>handling enquiries via the contact form.</li>
        </ul>

        <h2>retention</h2>
        <p>
          data is retained throughout participation in the programme and up to 12
          months after it ends, after which it is deleted. survey-respondent emails
          are retained for 24 months for duplicate-control purposes.
        </p>

        <h2>third-party transfers</h2>
        <p>
          data is not shared with third parties except for technical providers who
          power the service (supabase — hosting and database; openai — anonymised
          processing of challenge-confirmation imagery).
        </p>

        <h2>your rights</h2>
        <p>
          you can request access to your data, its correction or deletion by
          contacting us via the <a href="/contacts">contacts page</a> or the email
          listed on the site.
        </p>

        <h2>consent</h2>
        <p>
          using the programme&apos;s forms (coach registration, client survey,
          message via /contacts) means consent to processing of personal data for
          the purposes listed above.
        </p>

        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--om-ink-500)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginTop: 48,
          }}
        >
          last updated: 2026
        </p>
      </article>
      <SiteFooter />
    </>
  );
}
