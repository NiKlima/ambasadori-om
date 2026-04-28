import { createClient } from "@/lib/supabase/server";
import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader({ onBlue = false }: { onBlue?: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = data?.role ?? null;
  }

  return <SiteHeaderClient user={user ? { id: user.id } : null} role={role} onBlue={onBlue} />;
}
