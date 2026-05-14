// Сканирует всю БД на mojibake.
// Признаки повреждения: символы вроде «–», «—», «—Б», «—А», «—В», «—Љ», «—∞», «–±», «–µ»
// (двойное UTF-8 кодирование кириллицы).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Mojibake-detector: ищет последовательности байт, специфичные для
// double-encoded UTF-8 → win1252/Mac Roman → UTF-8.
// Признак: 2+ подряд символов из диапазона U+2013, U+2014, U+0490-U+04FF, U+2122, U+201A
const MOJI_RE = /[–—][А-ЯЁа-яёЇїЄєЌɉЉљЊњ–—™‚±µº≠≤≥∞«»]{2,}/;

function isCorrupt(value) {
  if (typeof value !== "string" || !value) return false;
  return MOJI_RE.test(value);
}

const TABLES = [
  { name: "profiles",       cols: ["full_name", "club", "sport", "bio", "quote", "story", "achievements"] },
  { name: "clubs",          cols: ["name", "city", "sport_focus", "description"] },
  { name: "challenges",     cols: ["title", "description", "ai_prompt"] },
  { name: "products",       cols: ["title", "description"] },
  { name: "events",         cols: ["title", "description", "location"] },
  { name: "survey_questions", cols: ["text", "options"] },
  { name: "contact_messages", cols: ["name", "message"] },
];

let total = 0;
for (const t of TABLES) {
  const { data, error } = await sb.from(t.name).select(`id,${t.cols.join(",")}`);
  if (error) {
    console.log(`${t.name}: ${error.message}`);
    continue;
  }
  const bad = [];
  for (const row of data ?? []) {
    for (const col of t.cols) {
      const v = row[col];
      if (typeof v === "string" && isCorrupt(v)) {
        bad.push({ id: row.id, col, sample: v.slice(0, 60) });
      } else if (Array.isArray(v)) {
        for (const item of v) {
          if (typeof item === "string" && isCorrupt(item)) {
            bad.push({ id: row.id, col, sample: item.slice(0, 60) });
            break;
          }
        }
      } else if (v && typeof v === "object") {
        // jsonb (achievements, options)
        const json = JSON.stringify(v);
        if (isCorrupt(json)) bad.push({ id: row.id, col, sample: json.slice(0, 60) });
      }
    }
  }
  if (bad.length === 0) {
    console.log(`✓ ${t.name}: clean (${(data ?? []).length} rows)`);
  } else {
    console.log(`✗ ${t.name}: ${bad.length} corrupt rows`);
    for (const b of bad.slice(0, 3)) console.log(`    ${b.col}: "${b.sample}..." (id=${b.id})`);
    total += bad.length;
  }
}
console.log(`\nTotal corrupt rows: ${total}`);
