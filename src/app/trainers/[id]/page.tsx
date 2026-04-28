import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrainerProfileBody } from "@/components/TrainerProfileBody";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function fetchTrainer(id: string): Promise<LeaderboardRow | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("leaderboard").select("*").eq("id", id).maybeSingle();
    return (data as LeaderboardRow | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const trainer = await fetchTrainer(id);
  if (!trainer) return { title: "Тренер не найден · OM Амбассадоры" };
  const title = `${trainer.full_name} — амбассадор ОМ`;
  const description = trainer.quote
    ? `«${trainer.quote}»`
    : trainer.bio ?? `${trainer.sport ?? "Тренер"}, ${trainer.club ?? "OM"}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function TrainerPage({ params }: { params: Params }) {
  const { id } = await params;
  const trainer = await fetchTrainer(id);
  if (!trainer) notFound();

  return (
    <>
      <SiteHeader />
      <section className="container-xl pt-10 pb-16">
        <Link href="/leaderboard" className="text-sm text-om-muted hover:text-om-ink">
          ← К лидерборду
        </Link>
        <div className="mt-6 bg-om-cream rounded-3xl shadow-sm overflow-hidden">
          <TrainerProfileBody trainer={trainer} />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
