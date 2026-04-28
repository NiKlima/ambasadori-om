import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const alt = "OM Амбассадоры";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { id: string };

export default async function OG({ params }: { params: Params }) {
  let name = "Тренер";
  let sport: string | null = null;
  let club: string | null = null;
  let points = 0;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("leaderboard")
      .select("full_name,sport,club,total_points")
      .eq("id", params.id)
      .maybeSingle();
    if (data) {
      name = data.full_name as string;
      sport = (data.sport as string | null) ?? null;
      club = (data.club as string | null) ?? null;
      points = (data.total_points as number | null) ?? 0;
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #E8F0FF 0%, #F5F0E6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#1B3A5B" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: "#7AB3FF" }} />
          <div style={{ fontWeight: 600 }}>OM · Амбассадоры</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 86, fontWeight: 700, color: "#0F1B2A", lineHeight: 1.05 }}>{name}</div>
          <div style={{ display: "flex", gap: 16, fontSize: 32, color: "#3B5067" }}>
            {sport && <span>{sport}</span>}
            {sport && club && <span>·</span>}
            {club && <span>{club}</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 28, color: "#3B5067" }}>Лидерборд сезона 2026</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 120, fontWeight: 700, color: "#0F1B2A", lineHeight: 1 }}>{points}</div>
            <div style={{ fontSize: 28, color: "#3B5067", textTransform: "uppercase", letterSpacing: 2 }}>баллов</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
