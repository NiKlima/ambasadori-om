// Сидинг демо-пользователей и транзакций для MVP «Амбассадоры ОМ».
//
// Запуск:
//   node scripts/seed-users.mjs
//
// Требует в .env.local (или переменных окружения):
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (не путать с anon)
//
// Сервисный ключ брать только локально — НЕ коммитить.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// простой .env.local парсер
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const ADMIN = {
  email: "admin@demo.om",
  password: "demo-admin-2026",
  full_name: "Админ OM",
  role: "admin",
};

const TRAINERS = [
  { email: "alina@demo.om", password: "demo-trainer-2026", full_name: "Алина Руссу", club: "Bigsport", sport: "Бег", promo_code: "ALINA" },
  { email: "mihai@demo.om", password: "demo-trainer-2026", full_name: "Михаил Чобану", club: "Martz Fitness", sport: "Кроссфит", promo_code: "MIHAI" },
  { email: "irina@demo.om", password: "demo-trainer-2026", full_name: "Ирина Балан", club: "Jiva Yoga", sport: "Йога", promo_code: "IRINA" },
  { email: "victor@demo.om", password: "demo-trainer-2026", full_name: "Виктор Морару", club: "Premier Fitness", sport: "Силовой", promo_code: "VICTOR" },
  { email: "oxana@demo.om", password: "demo-trainer-2026", full_name: "Оксана Лупу", club: "Alexia", sport: "Пилатес", promo_code: "OXANA" },
  { email: "andrei@demo.om", password: "demo-trainer-2026", full_name: "Андрей Попеску", club: "Aquaterra", sport: "Триатлон", promo_code: "ANDREI" },
  { email: "natalia@demo.om", password: "demo-trainer-2026", full_name: "Наталья Гынку", club: "Bigsport", sport: "Функциональный", promo_code: "NATALIA" },
  { email: "dmitrii@demo.om", password: "demo-trainer-2026", full_name: "Дмитрий Унгуряну", club: "Martz Fitness", sport: "Бокс", promo_code: "DMITRII" },
  { email: "elena@demo.om", password: "demo-trainer-2026", full_name: "Елена Цуркан", club: "Jiva Yoga", sport: "Йога", promo_code: "ELENA" },
  { email: "sergei@demo.om", password: "demo-trainer-2026", full_name: "Сергей Врабие", club: "Pilates Club", sport: "Пилатес", promo_code: "SERGEI" },
];

const POINT_DISTRIBUTION = [145, 128, 110, 92, 84, 71, 60, 48, 35, 22];

async function upsertUser(email, password, role, full_name, club, sport, promo_code) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let existing = list?.users.find((u) => u.email === email);
  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) throw error;
    existing = data.user;
  }
  const id = existing.id;
  const { error: pErr } = await supabase.from("profiles").upsert({
    id, role, full_name, club, sport, promo_code,
  });
  if (pErr) throw pErr;
  return id;
}

async function main() {
  console.log("→ Админ…");
  await upsertUser(ADMIN.email, ADMIN.password, ADMIN.role, ADMIN.full_name, null, null, null);

  console.log("→ Тренеры…");
  const ids = [];
  for (const t of TRAINERS) {
    const id = await upsertUser(t.email, t.password, "trainer", t.full_name, t.club, t.sport, t.promo_code);
    ids.push(id);
    console.log("  ✓", t.full_name);
  }

  console.log("→ Транзакции (бэкфилл баллов для демо)…");
  const { data: admin } = await supabase.from("profiles").select("id").eq("role", "admin").single();
  for (let i = 0; i < ids.length; i++) {
    const total = POINT_DISTRIBUTION[i] ?? 10;
    await supabase.from("point_transactions").insert({
      trainer_id: ids[i],
      amount: total,
      reason: "Демо: стартовый баланс",
      created_by: admin?.id,
    });
  }

  console.log("\n✓ Готово.");
  console.log("Демо-доступы:");
  console.log("  Админ:   admin@demo.om / demo-admin-2026");
  console.log("  Тренер:  alina@demo.om / demo-trainer-2026  (+ ещё 9)");
}

main().catch((e) => { console.error(e); process.exit(1); });
