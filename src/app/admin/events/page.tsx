import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { createEvent, toggleEvent, deleteEvent } from "./actions";

const KIND_LABEL: Record<string, string> = {
  race: "Забег",
  live: "Live",
  workshop: "Воркшоп",
  community: "Комьюнити",
};

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
  const list = (data ?? []) as Event[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">События</h1>
        <p className="text-om-muted mt-2">Забеги, лайвы, воркшопы — всё, что попадёт в публичный календарь.</p>
      </div>

      <form action={createEvent} className="rounded-3xl bg-white border border-black/5 p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Название</label>
          <input name="title" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-om-muted block mb-1">Описание</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Тип</label>
          <select name="kind" defaultValue="community" className="w-full rounded-lg border border-black/10 px-3 py-2">
            {Object.entries(KIND_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Локация</label>
          <input name="location" className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Старт</label>
          <input name="starts_at" type="datetime-local" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Конец (опц.)</label>
          <input name="ends_at" type="datetime-local" className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Ссылка</label>
          <input name="link" type="url" placeholder="https://..." className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div>
          <label className="text-xs uppercase text-om-muted block mb-1">Cover URL</label>
          <input name="cover_url" type="url" placeholder="https://..." className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <button className="rounded-full bg-om-ink text-om-cream px-5 py-2 text-sm">Добавить</button>
        </div>
      </form>

      <div className="space-y-3">
        {list.map((ev) => (
          <div key={ev.id} className={`rounded-3xl bg-white border border-black/5 p-5 flex items-start justify-between gap-4 ${ev.active ? "" : "opacity-60"}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-lg font-semibold truncate">{ev.title}</div>
                <span className="rounded-full bg-om-blue-soft text-om-blue-dark text-xs px-2 py-0.5">{KIND_LABEL[ev.kind]}</span>
                {!ev.active && <span className="rounded-full bg-black/10 text-om-muted text-xs px-2 py-0.5">скрыто</span>}
              </div>
              <div className="text-sm text-om-muted mt-1">
                {formatDate(ev.starts_at)} {ev.location ? `· ${ev.location}` : ""}
              </div>
              {ev.description && <p className="text-sm mt-2 line-clamp-2">{ev.description}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <form action={toggleEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <input type="hidden" name="active" value={String(ev.active)} />
                <button className="text-xs rounded-full border border-black/10 px-3 py-1 hover:border-om-ink">
                  {ev.active ? "Скрыть" : "Показать"}
                </button>
              </form>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <button className="text-xs rounded-full border border-om-coral/40 text-om-coral px-3 py-1 hover:bg-om-coral/10">
                  Удалить
                </button>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-om-muted text-sm">Событий пока нет.</p>}
      </div>
    </div>
  );
}
