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
    <div className="grid gap-6">
      <div>
        <div className="eyebrow">messages</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 5vw, 56px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "8px 0 0",
          }}
        >
          incoming from /contacts.
        </h1>
      </div>

      <div className="grid gap-3">
        {list.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-[var(--om-ink-100)]"
            style={{
              padding: "24px 28px",
              opacity: m.is_read ? 0.7 : 1,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.name}
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="lk mt-1 inline-block"
                  style={{ fontSize: 13 }}
                >
                  {m.email} →
                </a>
                <div
                  className="font-mono mt-2"
                  style={{
                    fontSize: 11,
                    color: "var(--om-ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {formatDate(m.created_at)}
                </div>
              </div>
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="is_read" value={String(m.is_read)} />
                <button type="submit" className="btn btn-outline btn-sm">
                  {m.is_read ? "mark unread" : "mark read"}
                </button>
              </form>
            </div>
            <p
              className="font-body whitespace-pre-line mt-4"
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--om-ink-900)",
              }}
            >
              {m.message}
            </p>
          </div>
        ))}
        {list.length === 0 && (
          <p
            className="font-mono"
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "var(--om-ink-500)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            no messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
