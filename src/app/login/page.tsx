import Link from "next/link";
import { signIn } from "./actions";

type SearchParams = Promise<{ error?: string; next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-om-cream">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-10">
          <span className="inline-block w-8 h-8 rounded-full bg-om-blue" />
          OM · Амбассадоры
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">Вход в кабинет</h1>
        <p className="text-om-muted mb-8">
          Введи email и пароль, которые прислала команда OM. Программа закрытая.
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-om-coral/15 border border-om-coral/30 text-om-coral px-4 py-3 text-sm">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 focus:outline-none focus:border-om-blue-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 focus:outline-none focus:border-om-blue-dark"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-om-ink text-om-cream px-6 py-3 font-medium hover:bg-om-blue-dark transition"
          >
            Войти
          </button>
        </form>

        <p className="mt-8 text-sm text-om-muted text-center">
          Нет доступа? Напиши в{" "}
          <a href="mailto:ambasadori@om.md" className="underline hover:text-om-ink">
            ambasadori@om.md
          </a>
        </p>
      </div>
    </main>
  );
}
