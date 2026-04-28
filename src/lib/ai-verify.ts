const OPENAI_MODEL = "gpt-4o-mini";

export type AiVerdictPayload = {
  verdict: "approved" | "rejected";
  confidence: number;
  reasoning: string;
  model: string;
  ms: number;
};

export async function verifyMedia(prompt: string, imageUrl: string): Promise<AiVerdictPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY не сконфигурирован");

  const system = `Ты — модератор фитнес-челленджа OM. Проверь, соответствует ли загруженный материал условию челленджа.
Условие: ${prompt}
Ответь СТРОГО валидным JSON: {"verdict":"approved"|"rejected","confidence":<0..1>,"reasoning":"<коротко по-русски, до 200 символов>"}.
approved — материал явно соответствует. rejected — явно не соответствует. confidence — твоя уверенность.`;

  const t0 = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: "Оцени материал по условию. Верни JSON." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  const verdict = parsed.verdict === "approved" ? "approved" : "rejected";
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
  const reasoning = String(parsed.reasoning ?? "").slice(0, 500);
  return { verdict, confidence, reasoning, model: OPENAI_MODEL, ms: Date.now() - t0 };
}

export const AI_AUTO_APPLY_THRESHOLD = 0.7;
