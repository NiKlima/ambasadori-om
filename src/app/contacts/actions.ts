"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";

  if (!name) return { error: "Укажи имя" };
  if (!EMAIL_RE.test(email)) return { error: "Введи корректный email" };
  if (!message || message.length < 10) return { error: "Сообщение слишком короткое" };
  if (!consent) return { error: "Нужно согласие на обработку персональных данных" };

  const admin = createAdminClient();
  const { error } = await admin.from("contact_messages").insert({ name, email, message });
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  redirect("/contacts/thanks");
}
