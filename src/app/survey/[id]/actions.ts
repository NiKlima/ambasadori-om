"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitSurvey(formData: FormData) {
  const challengeId = String(formData.get("challenge_id"));
  const ref = String(formData.get("ref") ?? "").trim();
  const trainee_email = String(formData.get("email") ?? "").trim().toLowerCase();
  const trainee_name = String(formData.get("name") ?? "").trim() || null;

  if (!challengeId || !ref) return { error: "Некорректная ссылка" };
  if (!EMAIL_RE.test(trainee_email)) return { error: "Введи корректный email" };
  if (formData.get("consent") !== "on") {
    return { error: "Нужно согласие на обработку персональных данных" };
  }

  const admin = createAdminClient();

  const { data: trainer } = await admin
    .from("profiles")
    .select("id")
    .eq("promo_code", ref)
    .eq("role", "trainer")
    .eq("is_active", true)
    .single();
  if (!trainer) return { error: "Тренер по ссылке не найден" };

  const { data: questions } = await admin
    .from("survey_questions")
    .select("id")
    .eq("challenge_id", challengeId);

  const answers = (questions ?? []).map((q) => ({
    question_id: q.id as string,
    answer: String(formData.get(`q_${q.id}`) ?? "").trim(),
  }));

  const { error } = await admin.from("survey_responses").insert({
    trainer_id: trainer.id,
    challenge_id: challengeId,
    trainee_email,
    trainee_name,
    answers,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Этот опрос уже пройден с этим email" };
    }
    return { error: error.message };
  }

  redirect("/survey/thanks");
}
