import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Challenge, SurveyResponse } from "@/lib/types";
import { ShareLink } from "./ShareLink";

export default async function MySurveysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: challenges }, { data: responses }] = await Promise.all([
    supabase.from("profiles").select("promo_code").eq("id", user.id).single(),
    supabase
      .from("challenges")
      .select("*")
      .eq("kind", "survey_trainee")
      .eq("active", true)
      .order("points", { ascending: false }),
    supabase
      .from("survey_responses")
      .select("*")
      .eq("trainer_id", user.id)
      .order("submitted_at", { ascending: false }),
  ]);

  const promo = profile?.promo_code ?? null;

  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const list = (challenges ?? []) as Challenge[];
  const byChallenge = new Map<string, SurveyResponse[]>();
  for (const r of (responses ?? []) as SurveyResponse[]) {
    if (!byChallenge.has(r.challenge_id)) byChallenge.set(r.challenge_id, []);
    byChallenge.get(r.challenge_id)!.push(r);
  }

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-[var(--om-ink-900)] text-white"
        style={{ height: 360 }}
      >
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/brand/imagery/yoga-rooftop.jpg)",
            opacity: 0.32,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(35,31,32,0.7), rgba(0,71,185,0.4))",
          }}
        />
        <div
          className="container-om relative h-full flex flex-col justify-end"
          style={{ paddingBottom: 36 }}
        >
          <div className="eyebrow eyebrow-w">опросы для подопечных</div>
          <h1
            className="font-display"
            style={{
              fontWeight: 900,
              fontSize: "clamp(56px, 8vw, 120px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: "12px 0 0",
            }}
          >
            твоя ссылка.
            <br />
            их фидбек.
          </h1>
        </div>
      </section>

      <div
        className="container-om grid gap-4"
        style={{ padding: "32px 0 80px" }}
      >
        {!promo && (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "20px 24px" }}
          >
            <div className="eyebrow" style={{ color: "var(--om-magenta)" }}>
              нужен промокод
            </div>
            <p
              className="font-body mt-2"
              style={{
                fontSize: 14,
                color: "var(--om-ink-900)",
                lineHeight: 1.55,
              }}
            >
              без промокода ссылка не работает. зайди в{" "}
              <a className="lk" href="/dashboard/profile" style={{ display: "inline" }}>
                профиль
              </a>{" "}
              или попроси админа OM.
            </p>
          </div>
        )}

        {list.map((ch) => {
          const url = promo
            ? `${origin}/survey/${ch.id}?ref=${encodeURIComponent(promo)}`
            : "";
          const got = byChallenge.get(ch.id) ?? [];
          return (
            <div
              key={ch.id}
              className="bg-white border border-[var(--om-ink-100)] grid"
              style={{
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
                minHeight: 240,
              }}
            >
              {/* Left — content */}
              <div
                className="flex flex-col justify-between"
                style={{ padding: "32px 36px" }}
              >
                <div>
                  <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
                    <span className="chip">опрос</span>
                    <span className="chip chip-blue">+{ch.points} баллов за ответ</span>
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 900,
                      fontSize: 32,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.05,
                    }}
                  >
                    {ch.title}
                  </div>
                  {ch.description && (
                    <div
                      className="font-body mt-2"
                      style={{
                        fontSize: 14,
                        color: "var(--om-ink-500)",
                        lineHeight: 1.55,
                        maxWidth: 540,
                      }}
                    >
                      {ch.description}
                    </div>
                  )}
                </div>

                {url && (
                  <div
                    className="mt-6 pt-4"
                    style={{ borderTop: "1px solid var(--om-ink-100)" }}
                  >
                    <ShareLink url={url} />
                  </div>
                )}

                {got.length > 0 && (
                  <div
                    className="mt-5 pt-4"
                    style={{ borderTop: "1px solid var(--om-ink-100)" }}
                  >
                    <div className="eyebrow">
                      прошли ({got.length})
                    </div>
                    <div className="mt-3">
                      {got.slice(0, 5).map((r, i) => (
                        <div
                          key={r.id}
                          className="flex justify-between items-center"
                          style={{
                            padding: "8px 0",
                            borderBottom:
                              i < Math.min(got.length, 5) - 1
                                ? "1px solid var(--om-ink-100)"
                                : "none",
                          }}
                        >
                          <div>
                            <div
                              className="font-display"
                              style={{
                                fontWeight: 800,
                                fontSize: 14,
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {r.trainee_name ?? r.trainee_email}
                            </div>
                            <div
                              className="font-mono mt-0.5"
                              style={{
                                fontSize: 11,
                                color: "var(--om-ink-500)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {r.trainee_email}
                            </div>
                          </div>
                          <div
                            className="font-mono"
                            style={{
                              fontSize: 11,
                              color: "var(--om-ink-500)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {formatDate(r.submitted_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — responses panel (blue) */}
              <div
                className="bg-[var(--om-blue)] text-white relative overflow-hidden"
                style={{ padding: "32px 36px" }}
              >
                <div
                  className="om-stripes-band"
                  style={{ position: "absolute", inset: 0, opacity: 0.32 }}
                />
                <div className="relative">
                  <div className="eyebrow eyebrow-w">ответов</div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 900,
                      fontSize: 96,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      marginTop: 8,
                    }}
                  >
                    {got.length}
                  </div>
                  <div
                    className="font-mono mt-4"
                    style={{
                      fontSize: 11,
                      opacity: 0.85,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    +{got.length * ch.points} баллов заработано
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div
            className="bg-white border border-[var(--om-ink-100)]"
            style={{ padding: "40px 28px", textAlign: "center" }}
          >
            <div className="eyebrow">опросов нет</div>
            <p
              className="font-body mt-3"
              style={{ fontSize: 14, color: "var(--om-ink-500)" }}
            >
              админ может добавить опросы — следи за обновлениями.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
