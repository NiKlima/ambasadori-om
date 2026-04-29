"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function placeOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authorised" };

  const productId = String(formData.get("product_id"));
  const note = String(formData.get("note") ?? "").trim() || null;

  const { error } = await supabase.rpc("create_order", {
    p_product_id: productId,
    p_note: note,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/shop");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return { ok: true };
}
