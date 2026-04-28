import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SurveyQuestion } from "@/lib/types";
import { SurveyForm } from "./SurveyForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
};

export default async function SurveyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ref } = await searchParams;
  const promoCode = (ref ?? "").trim();

  const admin = createAdminClient();

  const [{ data: challenge }, { data: trainer }, { data: questions }] = await Promise.all([
    admin
      .from("challenges")
      .select("id,title,description,kind,active")
      .eq("id", id)
      .single(),
    promoCode
      ? admin
          .from("profiles")
          .select("full_name,club,sport,promo_code")
          .eq("promo_code", promoCode)
          .eq("role", "trainer")
          .eq("is_active", true)
          .single()
      : Promise.resolve({ data: null }),
    admin
      .from("survey_questions")
      .select("*")
      .eq("challenge_id", id)
      .order("position"),
  ]);

  if (!challenge || challenge.kind !== "survey_trainee" || !challenge.active) {
    notFound();
  }

  if (!trainer) {
    return (
      <div
        className="container-om"
        style={{ padding: "120px 0", maxWidth: 600 }}
      >
        <div
          className="bg-white border border-[var(--om-ink-100)]"
          style={{ padding: "40px 32px", textAlign: "center" }}
        >
          <div className="eyebrow" style={{ color: "var(--om-magenta)" }}>
            ссылка некорректна
          </div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: "-0.03em",
              margin: "12px 0 12px",
            }}
          >
            реф-код тренера не найден.
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--om-ink-500)",
              lineHeight: 1.55,
            }}
          >
            попроси у тренера актуальную ссылку на опрос.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-om grid gap-4"
      style={{ padding: "48px 0 80px", maxWidth: 720 }}
    >
      <div
        className="bg-[var(--om-ink-900)] text-white relative overflow-hidden"
        style={{ padding: "32px 36px" }}
      >
        <div
          className="om-stripes-white-soft"
          style={{ position: "absolute", inset: 0 }}
        />
        <div className="relative">
          <div className="eyebrow eyebrow-w">опрос от {trainer.full_name?.toLowerCase()}</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 48px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              margin: "12px 0 0",
            }}
          >
            {challenge.title}
          </h1>
          {challenge.description && (
            <p
              className="font-body mt-3"
              style={{
                fontSize: 14,
                opacity: 0.75,
                lineHeight: 1.55,
              }}
            >
              {challenge.description}
            </p>
          )}
        </div>
      </div>

      <SurveyForm
        challengeId={challenge.id}
        ref={promoCode}
        questions={(questions ?? []) as SurveyQuestion[]}
      />
    </div>
  );
}
