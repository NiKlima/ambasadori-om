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
    admin.from("challenges").select("id,title,description,kind,active").eq("id", id).single(),
    promoCode
      ? admin
          .from("profiles")
          .select("full_name,club,sport,promo_code")
          .eq("promo_code", promoCode)
          .eq("role", "trainer")
          .eq("is_active", true)
          .single()
      : Promise.resolve({ data: null }),
    admin.from("survey_questions").select("*").eq("challenge_id", id).order("position"),
  ]);

  if (!challenge || challenge.kind !== "survey_trainee" || !challenge.active) {
    notFound();
  }

  if (!trainer) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Ссылка некорректна</h1>
        <p className="text-om-muted">
          Реф-код тренера не найден. Попроси у тренера актуальную ссылку на опрос.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl bg-om-ink text-om-cream p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-om-cream/60 mb-3">
          Опрос от {trainer.full_name}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">{challenge.title}</h1>
        {challenge.description && (
          <p className="mt-3 text-om-cream/70">{challenge.description}</p>
        )}
      </div>

      <SurveyForm
        challengeId={challenge.id}
        ref={promoCode}
        questions={(questions ?? []) as SurveyQuestion[]}
      />
    </div>
  );
}
