import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Redirect to the same origin we were called from — works on prod, preview, localhost
  // without depending on a NEXT_PUBLIC_SITE_URL env var.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
