import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
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

  return (
    <header className="sticky top-0 z-40 bg-om-cream/85 backdrop-blur border-b border-black/5">
      <div className="container-xl flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block w-8 h-8 rounded-full bg-om-blue" aria-hidden />
          <span>
            OM<span className="text-om-muted font-normal">·</span>Амбассадоры
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-om-muted">
          <Link href="/#how" className="hover:text-om-ink transition">
            Как работает
          </Link>
          <Link href="/#challenges" className="hover:text-om-ink transition">
            Челленджи
          </Link>
          <Link href="/#clubs" className="hover:text-om-ink transition">
            Клубы
          </Link>
          <Link href="/#trainers" className="hover:text-om-ink transition">
            Тренеры
          </Link>
          <Link href="/leaderboard" className="hover:text-om-ink transition">
            Лидерборд
          </Link>
          <Link href="/events" className="hover:text-om-ink transition">
            События
          </Link>
          <Link href="/#faq" className="hover:text-om-ink transition">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={role === "admin" ? "/admin" : "/dashboard"}
                className="text-sm font-medium text-om-ink hover:text-om-blue-dark"
              >
                {role === "admin" ? "Админка" : "Кабинет"}
              </Link>
              <form action="/auth/signout" method="post">
                <button className="text-sm text-om-muted hover:text-om-ink">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-om-ink text-om-cream text-sm px-4 py-2 hover:bg-om-blue-dark transition"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
