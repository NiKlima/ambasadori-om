import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import type { Profile } from "@/lib/types";
import { toggleTrainer, updateTrainer } from "./actions";

export default async function AdminTrainersPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "trainer")
    .order("created_at", { ascending: false });

  const list = (trainers ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Тренеры</h1>
          <p className="text-om-muted mt-2">Всего в программе: {list.length}</p>
        </div>
        <div className="rounded-2xl bg-om-blue-soft text-om-blue-dark px-4 py-3 text-sm">
          Создание тренера: Supabase → Auth → Add user → затем заполни профиль здесь.
        </div>
      </div>

      <div className="space-y-3">
        {list.map((t) => (
          <details key={t.id} className="rounded-3xl bg-white border border-black/5">
            <summary className="flex items-center gap-4 p-4 cursor-pointer list-none">
              <Avatar name={t.full_name} photoUrl={t.photo_url} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{t.full_name}</div>
                <div className="text-om-muted text-sm truncate">
                  {t.club ?? "—"}{t.sport ? ` · ${t.sport}` : ""} · {t.promo_code ?? "без промокода"}
                </div>
              </div>
              <span className={`text-xs rounded-full px-3 py-1 ${t.is_active ? "bg-om-green/15 text-om-green" : "bg-om-coral/15 text-om-coral"}`}>
                {t.is_active ? "активен" : "заблокирован"}
              </span>
            </summary>
            <div className="border-t border-black/5 p-6 grid md:grid-cols-2 gap-6">
              <form action={updateTrainer} className="space-y-3">
                <input type="hidden" name="id" value={t.id} />
                <div>
                  <label className="text-xs uppercase text-om-muted block mb-1">Имя</label>
                  <input name="full_name" defaultValue={t.full_name} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs uppercase text-om-muted block mb-1">Клуб</label>
                    <input name="club" defaultValue={t.club ?? ""} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-om-muted block mb-1">Спорт</label>
                    <input name="sport" defaultValue={t.sport ?? ""} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase text-om-muted block mb-1">Промокод</label>
                  <input name="promo_code" defaultValue={t.promo_code ?? ""} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-mono uppercase" />
                </div>
                <button className="rounded-full bg-om-ink text-om-cream px-4 py-2 text-sm">Сохранить</button>
              </form>

              <form action={toggleTrainer} className="flex items-start md:justify-end">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="active" value={String(t.is_active)} />
                <button className={`rounded-full px-4 py-2 text-sm ${t.is_active ? "bg-om-coral/15 text-om-coral hover:bg-om-coral/25" : "bg-om-green/15 text-om-green hover:bg-om-green/25"}`}>
                  {t.is_active ? "Заблокировать" : "Разблокировать"}
                </button>
              </form>
            </div>
          </details>
        ))}

        {list.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-om-muted text-center">
            Тренеров пока нет. Создай первого через Supabase → Authentication → Add user, затем добавь запись в таблицу profiles.
          </div>
        )}
      </div>
    </div>
  );
}
