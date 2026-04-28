"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    if (next) params.set("next", next);
    redirect(`/login?${params.toString()}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=unknown");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (next && next.startsWith("/")) redirect(next);
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}
