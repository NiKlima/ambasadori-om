"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authorised");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("No permission");
  return { supabase, user };
}

export async function toggleMessageRead(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const is_read = formData.get("is_read") === "true";
  if (!id) return;
  await supabase.from("contact_messages").update({ is_read: !is_read }).eq("id", id);
  revalidatePath("/admin/messages");
}
