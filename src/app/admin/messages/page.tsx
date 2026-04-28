import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";
import { toggleMessageRead } from "./actions";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (data ?? []) as ContactMessage[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Сообщения</h1>
        <p className="text-om-muted mt-2">Входящие из формы /contacts.</p>
      </div>

      <div className="space-y-3">
        {list.map((m) => (
          <div
            key={m.id}
            className={`rounded-3xl bg-white border border-black/5 p-6 ${m.is_read ? "opacity-70" : ""}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-semibold">{m.name}</div>
                <a href={`mailto:${m.email}`} className="text-sm text-om-blue-dark underline">
                  {m.email}
                </a>
                <div className="text-xs text-om-muted mt-1">{formatDate(m.created_at)}</div>
              </div>
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="is_read" value={String(m.is_read)} />
                <button className="text-xs rounded-full border border-black/10 px-3 py-1 hover:border-om-ink">
                  {m.is_read ? "Вернуть в новые" : "Отметить прочитанным"}
                </button>
              </form>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
          </div>
        ))}
        {list.length === 0 && <p className="text-om-muted text-sm">Сообщений пока нет.</p>}
      </div>
    </div>
  );
}
