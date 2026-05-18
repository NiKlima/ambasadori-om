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

async function fetchRank(id: string): Promise<number | undefined> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("leaderboard")
      .select("id, total_points")
      .order("total_points", { ascending: false });
    if (!data) return undefined;
    const idx = data.findIndex((r: { id: string }) => r.id === id);
    return idx >= 0 ? idx + 1 : undefined;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const trainer = await fetchTrainer(id);
  if (!trainer) return { title: "Trainer not found · OM Ambasadori" };
  const title = `${trainer.full_name} — OM ambassador`;
  const description = trainer.quote
    ? `«${trainer.quote}»`
    : trainer.bio ?? `${trainer.sport ?? "Coach"}, ${trainer.club ?? "OM"}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function TrainerPage({ params }: { params: Params }) {
  const { id } = await params;
  const [trainer, rank] = await Promise.all([fetchTrainer(id), fetchRank(id)]);
  if (!trainer) notFound();

  return (
    <>
      <SiteHeader />
      <section className="bg-[var(--om-ink-50)] py-10 md:py-16">
        <div className="container-om">
          <Link
            href="/leaderboard"
            className="font-mono inline-block mb-6"
            style={{
              fontSize: 11,
              color: "var(--om-ink-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
← back to leaderboard
          </Link>
          <TrainerProfileBody trainer={trainer} rank={rank} />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
