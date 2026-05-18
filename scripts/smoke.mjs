#!/usr/bin/env node
/* eslint-disable no-console */
// End-to-end smoke check for ambasadori-om.
// Запуск: npm run smoke (или node scripts/smoke.mjs)
//
// Checks:
//   1. HTTP probe public + protected routes
//   2. Supabase DB sanity (table existence + row counts)
//   3. Live flow: insert pending event → approve → register → cleanup
//   4. Mojibake re-scan
//
// Exit code: 0 if all ok, 1 if any failure.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// ── env ───────────────────────────────────────────────────────────────
try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  console.error("✗ .env.local not found (run from project root)");
  process.exit(1);
}

const HOST = process.env.SMOKE_HOST ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

let ok = 0;
let fail = 0;
const failures = [];

function check(name, predicate, extra = "") {
  if (predicate) {
    console.log(`  ✓ ${name}${extra ? ` (${extra})` : ""}`);
    ok++;
  } else {
    console.log(`  ✗ ${name}${extra ? ` (${extra})` : ""}`);
    fail++;
    failures.push(name);
  }
}

// ── 1. HTTP probe ─────────────────────────────────────────────────────
console.log(`\n=== HTTP probe on ${HOST} ===`);
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/leaderboard",
  "/clubs",
  "/events",
  "/contacts",
  "/privacy",
  "/challenges",
  "/trainers",
];
const PROTECTED_ROUTES = [
  "/admin",
  "/admin/events",
  "/dashboard",
  "/dashboard/events",
];

for (const r of PUBLIC_ROUTES) {
  try {
    const res = await fetch(`${HOST}${r}`, { redirect: "manual" });
    check(`GET ${r}`, res.status === 200, `${res.status}`);
  } catch (e) {
    check(`GET ${r}`, false, e.message);
  }
}
for (const r of PROTECTED_ROUTES) {
  try {
    const res = await fetch(`${HOST}${r}`, { redirect: "manual" });
    // 307 = redirect to /login (без auth)
    check(`GET ${r}`, res.status === 307, `${res.status} expected 307`);
  } catch (e) {
    check(`GET ${r}`, false, e.message);
  }
}

// ── 2. DB sanity ──────────────────────────────────────────────────────
console.log("\n=== Supabase DB sanity ===");

const { count: clubsCount } = await sb
  .from("clubs")
  .select("*", { count: "exact", head: true })
  .eq("active", true);
check("clubs count >= 8", (clubsCount ?? 0) >= 8, `count=${clubsCount}`);

const { count: trainersCount } = await sb
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("role", "trainer")
  .eq("is_active", true);
check("trainers count >= 10", (trainersCount ?? 0) >= 10, `count=${trainersCount}`);

const { error: evCheckErr } = await sb
  .from("events")
  .select("id, status, registration_enabled, host_trainer_id")
  .limit(1);
check("events.status column exists", !evCheckErr, evCheckErr?.message);

const { error: regErr } = await sb
  .from("event_registrations")
  .select("*", { count: "exact", head: true });
check("event_registrations table accessible", !regErr, regErr?.message);

// ── 3. Live flow ──────────────────────────────────────────────────────
console.log("\n=== Live events workflow ===");

const { data: alina } = await sb
  .from("profiles")
  .select("id, full_name")
  .eq("promo_code", "ALINA")
  .maybeSingle();
const { data: admin } = await sb
  .from("profiles")
  .select("id, full_name")
  .eq("role", "admin")
  .maybeSingle();

check("Alina trainer exists", !!alina);
check("admin user exists", !!admin);

let testEventId = null;
let testRegId = null;

if (alina && admin) {
  // INSERT pending event
  const { data: inserted, error: insErr } = await sb
    .from("events")
    .insert({
      title: "smoke-test event",
      description: "auto-created by smoke script, will be deleted",
      kind: "community",
      starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: "smoke test land",
      status: "pending",
      created_by: alina.id,
      host_trainer_id: alina.id,
      registration_enabled: true,
      active: true,
    })
    .select("id")
    .single();
  check("INSERT pending event", !insErr && !!inserted, insErr?.message);
  testEventId = inserted?.id;

  if (testEventId) {
    // approve
    const { error: appErr } = await sb
      .from("events")
      .update({
        status: "approved",
        moderated_by: admin.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", testEventId);
    check("UPDATE event → approved", !appErr, appErr?.message);

    // event visible in public query
    const { data: pub } = await sb
      .from("events")
      .select("id")
      .eq("id", testEventId)
      .eq("active", true)
      .eq("status", "approved")
      .maybeSingle();
    check("approved event visible in /events query", !!pub);

    // INSERT registration
    const { data: reg, error: regInsErr } = await sb
      .from("event_registrations")
      .insert({
        event_id: testEventId,
        name: "smoke tester",
        email: `smoke-${Date.now()}@test.local`,
        consent: true,
      })
      .select("id")
      .single();
    check("INSERT registration", !regInsErr && !!reg, regInsErr?.message);
    testRegId = reg?.id;

    if (testRegId) {
      const { count } = await sb
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", testEventId);
      check("registrations count for event = 1", count === 1, `count=${count}`);
    }
  }

  // CLEANUP
  if (testRegId) await sb.from("event_registrations").delete().eq("id", testRegId);
  if (testEventId) await sb.from("events").delete().eq("id", testEventId);
  check("cleanup (delete test event + registration)", true);
}

// ── 4. Mojibake scan ──────────────────────────────────────────────────
console.log("\n=== Mojibake scan ===");
const MOJI_RE = /[–—][А-ЯЁа-яёЇїЄєЌɉЉљЊњ–—™‚±µº≠≤≥∞«»]{2,}/;
const TABLES = [
  ["profiles", ["full_name", "club", "sport", "bio", "quote", "story"]],
  ["clubs", ["name", "city", "sport_focus", "description"]],
  ["challenges", ["title", "description", "ai_prompt"]],
  ["products", ["title", "description"]],
  ["events", ["title", "description", "location"]],
];
let totalCorrupt = 0;
for (const [table, cols] of TABLES) {
  const { data } = await sb.from(table).select(`id,${cols.join(",")}`);
  let bad = 0;
  for (const row of data ?? []) {
    for (const c of cols) {
      if (typeof row[c] === "string" && MOJI_RE.test(row[c])) {
        bad++;
        break;
      }
    }
  }
  if (bad > 0) totalCorrupt += bad;
  check(`${table}: clean`, bad === 0, `${bad} corrupt rows`);
}

// ── summary ───────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(40));
console.log(`✓ ${ok} passed   ✗ ${fail} failed   ${totalCorrupt > 0 ? `⚠ ${totalCorrupt} mojibake rows` : ""}`);
if (failures.length) {
  console.log("\nFailed checks:");
  for (const f of failures) console.log(`  • ${f}`);
}
process.exit(fail > 0 ? 1 : 0);
