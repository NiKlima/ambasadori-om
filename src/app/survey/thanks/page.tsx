import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="max-w-xl mx-auto rounded-3xl bg-white p-10 text-center">
      <div className="text-5xl mb-4">✨</div>
      <h1 className="text-3xl md:text-4xl font-semibold mb-3">Спасибо!</h1>
      <p className="text-om-muted mb-8">
        Ответы получены — твой тренер автоматически получит баллы программы OM.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-full bg-om-ink text-om-cream px-6 py-3 text-sm font-medium hover:bg-om-blue-dark transition"
      >
        Узнать про OM →
      </Link>
    </div>
  );
}
