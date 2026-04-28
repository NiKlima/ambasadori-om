import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { moderateSubmission } from "../actions";

type Row = {
  id: string;
  photo_url: string | null;
  link: string | null;
  note: string | null;
  status: string;
  created_at: string;
  trainer: { id: string; full_name: string; club: string | null; sport: string | null } | null;
  challenge: { id: string; title: string; points: number } | null;
};

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, photo_url, link, note, status, created_at, trainer:profiles!submissions_trainer_id_fkey(id, full_name, club, sport), challenge:challenges(id, title, points)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const list = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Модерация</h1>
        <p className="text-om-muted mt-2">Очередь: {list.length}</p>
      </div>

      <div className="space-y-4">
        {list.map((s) => (
          <div key={s.id} className="rounded-3xl bg-white border border-black/5 p-6 grid md:grid-cols-[200px_1fr_auto] gap-6">
            <div className="relative rounded-2xl overflow-hidden bg-om-blue-soft aspect-square">
              {s.photo_url ? (
                <Image src={s.photo_url} alt="подтверждение" fill className="object-cover" sizes="200px" unoptimized />
              ) : (
                <div className="h-full flex items-center justify-center text-om-muted text-sm p-4 text-center">
                  Без фото
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-sm text-om-muted">{formatDate(s.created_at)}</div>
              <div className="font-semibold mt-1">
                {s.trainer?.full_name ?? "Неизвестный"} — {s.challenge?.title ?? "—"}{" "}
                <span className="text-om-blue-dark">+{s.challenge?.points ?? 0}</span>
              </div>
              {s.trainer && (
                <div className="text-om-muted text-sm">{s.trainer.club ?? ""}{s.trainer.sport ? ` · ${s.trainer.sport}` : ""}</div>
              )}
              {s.note && <p className="text-sm mt-3">{s.note}</p>}
              {s.link && (
                <p className="mt-2 text-sm">
                  <Link href={s.link} target="_blank" className="text-om-blue-dark underline break-all">
                    {s.link}
                  </Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <form action={moderateSubmission}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="action" value="approve" />
                <button className="w-full rounded-full bg-om-green text-white px-5 py-2 text-sm hover:opacity-90">
                  Одобрить +{s.challenge?.points ?? 0}
                </button>
              </form>
              <form action={moderateSubmission} className="space-y-2">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="action" value="reject" />
                <input
                  name="comment"
                  placeholder="Причина (необязательно)"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                />
                <button className="w-full rounded-full bg-om-coral/15 text-om-coral px-5 py-2 text-sm hover:bg-om-coral/25">
                  Отклонить
                </button>
              </form>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center text-om-muted">
            Очередь пуста. Все подтверждения разобраны ✨
          </div>
        )}
      </div>
    </div>
  );
}
