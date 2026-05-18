// Full action-level audit: simulates the supabase layer of every server action
// using real auth sessions for admin/trainer + service-role for cleanup.
// Reports OK / ERROR / SILENT (action returns null/no error but DB unchanged).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const svc  = createClient(SUPA, SVC);

const results = [];
function rec(area, name, status, detail) {
  results.push({ area, name, status, detail });
  const dot = status === "OK" ? "\x1b[32m✓\x1b[0m" : status === "WARN" ? "\x1b[33m!\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`  ${dot} [${area}] ${name}${detail ? "  — " + detail : ""}`);
}

async function login(email, password) {
  const sb = createClient(SUPA, ANON);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return { client: sb, user: data.user };
}

const ADMIN_EMAIL = "admin@demo.om";
const ADMIN_PW = "demo-admin-2026";
const TRAINER_EMAIL = "alina@demo.om";
const TRAINER_PW = "demo-trainer-2026";

// ─── 1. fetch reference IDs from DB ─────────────────────────────────────────
const [{ data: refClub }, { data: refProduct }, { data: refChallenge }, { data: refSurveyChallenge }, { data: refQuestion }, { data: refEvent }, { data: refTrainer }] = await Promise.all([
  svc.from("clubs").select("id, name").limit(1).single(),
  svc.from("products").select("id, title, price_points").gt("price_points", 0).limit(1).single(),
  svc.from("challenges").select("id, kind, requires_moderation").not("kind","eq","survey_trainee").limit(1).single(),
  svc.from("challenges").select("id, kind").eq("kind","survey_trainee").limit(1).maybeSingle(),
  svc.from("survey_questions").select("id, challenge_id").limit(1).maybeSingle(),
  svc.from("events").select("id, registration_enabled, max_participants, status, active").eq("status","approved").eq("active",true).eq("registration_enabled",true).limit(1).single(),
  svc.from("profiles").select("id, full_name, promo_code").eq("role","trainer").eq("is_active",true).limit(1).single(),
]);
console.log("Reference IDs collected:", { club: refClub?.id?.slice(0,8), product: refProduct?.id?.slice(0,8), challenge: refChallenge?.id?.slice(0,8), event: refEvent?.id?.slice(0,8), trainer: refTrainer?.id?.slice(0,8) });

const { client: adminCli, user: adminUser } = await login(ADMIN_EMAIL, ADMIN_PW);
const { client: trainerCli, user: trainerUser } = await login(TRAINER_EMAIL, TRAINER_PW);
console.log("Logged in: admin=" + adminUser.email + " trainer=" + trainerUser.email);

const cleanups = [];
const addCleanup = fn => cleanups.push(fn);

// tiny png (1x1) for upload tests
const TINY_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=", "base64");

// ─── 2. AUTH/SESSION ────────────────────────────────────────────────────────
console.log("\n[Auth]");
{
  const sb = createClient(SUPA, ANON);
  const { error } = await sb.auth.signInWithPassword({ email: "wrong@demo.om", password: "x" });
  rec("auth", "signIn rejects bad credentials", error ? "OK" : "FAIL", error?.message);
}

// ─── 3. STORAGE / UPLOADS (RLS sanity) ──────────────────────────────────────
console.log("\n[Storage]");

// covers/events — admin uploads (should work)
{
  const path = `events/audit-${Date.now()}.png`;
  const { error } = await adminCli.storage.from("covers").upload(path, TINY_PNG, { contentType: "image/png" });
  if (error) rec("storage", "admin → covers/events upload", "FAIL", error.message);
  else { rec("storage", "admin → covers/events upload", "OK"); addCleanup(() => svc.storage.from("covers").remove([path])); }
}

// covers/events — trainer uploads (currently BLOCKED by RLS → silent fail in proposeEvent)
{
  const path = `events/audit-trainer-${Date.now()}.png`;
  const { error } = await trainerCli.storage.from("covers").upload(path, TINY_PNG, { contentType: "image/png" });
  if (error) rec("storage", "trainer → covers/events upload", "WARN", `RLS denies: ${error.message} → proposeEvent loses cover silently`);
  else { rec("storage", "trainer → covers/events upload", "OK"); addCleanup(() => svc.storage.from("covers").remove([path])); }
}

// avatars/<trainerId>/ — trainer uploads to own folder (should work)
{
  const path = `${trainerUser.id}/audit-${Date.now()}.png`;
  const { error } = await trainerCli.storage.from("avatars").upload(path, TINY_PNG, { contentType: "image/png" });
  if (error) rec("storage", "trainer → avatars/<self> upload", "FAIL", error.message);
  else { rec("storage", "trainer → avatars/<self> upload", "OK"); addCleanup(() => svc.storage.from("avatars").remove([path])); }
}

// avatars/<other>/ — trainer tries to upload to someone else's folder (should be blocked)
{
  const path = `00000000-0000-0000-0000-000000000000/audit-${Date.now()}.png`;
  const { error } = await trainerCli.storage.from("avatars").upload(path, TINY_PNG, { contentType: "image/png" });
  if (error) rec("storage", "trainer → avatars/<other> is blocked", "OK", "RLS denied as expected");
  else { rec("storage", "trainer → avatars/<other> is blocked", "FAIL", "leak"); addCleanup(() => svc.storage.from("avatars").remove([path])); }
}

// submissions — any authenticated trainer can upload anywhere (current loose RLS)
{
  const path = `${trainerUser.id}/photos/audit-${Date.now()}.png`;
  const { error } = await trainerCli.storage.from("submissions").upload(path, TINY_PNG, { contentType: "image/png" });
  if (error) rec("storage", "trainer → submissions upload", "FAIL", error.message);
  else { rec("storage", "trainer → submissions upload", "OK"); addCleanup(() => svc.storage.from("submissions").remove([path])); }
}

// ─── 4. ADMIN ACTIONS (DB layer) ────────────────────────────────────────────
console.log("\n[Admin actions]");

// createEvent (auto-approve)
let createdEventId;
{
  const { data, error } = await adminCli.from("events").insert({
    title: "audit-admin-event", kind: "community",
    starts_at: new Date(Date.now()+86400_000).toISOString(),
    sort_order: 0, status: "approved", active: true,
    created_by: adminUser.id, moderated_by: adminUser.id, moderated_at: new Date().toISOString(),
  }).select("id").single();
  if (error) rec("admin", "createEvent", "FAIL", error.message);
  else { createdEventId = data.id; rec("admin", "createEvent → approved", "OK"); addCleanup(() => svc.from("events").delete().eq("id", createdEventId)); }
}

// updateEvent
if (createdEventId) {
  const { error } = await adminCli.from("events").update({ title: "audit-admin-event-renamed" }).eq("id", createdEventId);
  rec("admin", "updateEvent", error ? "FAIL" : "OK", error?.message);
}

// approveEvent / rejectEvent / toggleEvent
if (createdEventId) {
  const { error: e1 } = await adminCli.from("events").update({ status: "rejected", moderator_note: "audit" }).eq("id", createdEventId);
  rec("admin", "rejectEvent (status→rejected)", e1 ? "FAIL" : "OK", e1?.message);
  const { error: e2 } = await adminCli.from("events").update({ status: "approved", moderator_note: null }).eq("id", createdEventId);
  rec("admin", "approveEvent (status→approved)", e2 ? "FAIL" : "OK", e2?.message);
  const { error: e3 } = await adminCli.from("events").update({ active: false }).eq("id", createdEventId);
  rec("admin", "toggleEvent (active=false)", e3 ? "FAIL" : "OK", e3?.message);
}

// createChallenge
let createdChallengeId;
{
  const { data, error } = await adminCli.from("challenges").insert({
    title: "audit-challenge", points: 10, kind: "manual",
    requires_moderation: false, ai_check: false, sort_order: 0,
  }).select("id").single();
  if (error) rec("admin", "createChallenge", "FAIL", error.message);
  else { createdChallengeId = data.id; rec("admin", "createChallenge", "OK"); addCleanup(() => svc.from("challenges").delete().eq("id", createdChallengeId)); }
}

// updateChallenge / toggleChallenge
if (createdChallengeId) {
  const { error: e1 } = await adminCli.from("challenges").update({ title: "audit-challenge-2" }).eq("id", createdChallengeId);
  rec("admin", "updateChallenge", e1 ? "FAIL" : "OK", e1?.message);
  const { error: e2 } = await adminCli.from("challenges").update({ active: false }).eq("id", createdChallengeId);
  rec("admin", "toggleChallenge", e2 ? "FAIL" : "OK", e2?.message);
}

// createProduct
let createdProductId;
{
  const { data, error } = await adminCli.from("products").insert({
    title: "audit-product", kind: "merch", price_points: 50, sort_order: 0,
  }).select("id").single();
  if (error) rec("admin", "createProduct", "FAIL", error.message);
  else { createdProductId = data.id; rec("admin", "createProduct", "OK"); addCleanup(() => svc.from("products").delete().eq("id", createdProductId)); }
}

// updateProduct / toggleProduct
if (createdProductId) {
  const { error: e1 } = await adminCli.from("products").update({ price_points: 60 }).eq("id", createdProductId);
  rec("admin", "updateProduct", e1 ? "FAIL" : "OK", e1?.message);
  const { error: e2 } = await adminCli.from("products").update({ active: false }).eq("id", createdProductId);
  rec("admin", "toggleProduct", e2 ? "FAIL" : "OK", e2?.message);
}

// createClub
let createdClubId;
{
  const { data, error } = await adminCli.from("clubs").insert({
    name: "audit-club", city: "Chișinău", sort_order: 0,
  }).select("id").single();
  if (error) rec("admin", "createClub", "FAIL", error.message);
  else { createdClubId = data.id; rec("admin", "createClub", "OK"); addCleanup(() => svc.from("clubs").delete().eq("id", createdClubId)); }
}

// updateClub / toggleClub
if (createdClubId) {
  const { error: e1 } = await adminCli.from("clubs").update({ description: "audited" }).eq("id", createdClubId);
  rec("admin", "updateClub", e1 ? "FAIL" : "OK", e1?.message);
  const { error: e2 } = await adminCli.from("clubs").update({ active: false }).eq("id", createdClubId);
  rec("admin", "toggleClub", e2 ? "FAIL" : "OK", e2?.message);
}

// awardPoints
{
  const { data, error } = await adminCli.from("point_transactions").insert({
    trainer_id: refTrainer.id, amount: 5, reason: "audit", created_by: adminUser.id,
  }).select("id").single();
  if (error) rec("admin", "awardPoints", "FAIL", error.message);
  else { rec("admin", "awardPoints", "OK"); addCleanup(() => svc.from("point_transactions").delete().eq("id", data.id)); }
}

// updateTrainer (profile fields)
{
  const before = (await svc.from("profiles").select("full_name").eq("id", refTrainer.id).single()).data.full_name;
  const { error } = await adminCli.from("profiles").update({ full_name: before }).eq("id", refTrainer.id);
  rec("admin", "updateTrainer", error ? "FAIL" : "OK", error?.message);
}

// toggleTrainer
{
  const { data: cur } = await svc.from("profiles").select("is_active").eq("id", refTrainer.id).single();
  const { error: e1 } = await adminCli.from("profiles").update({ is_active: !cur.is_active }).eq("id", refTrainer.id);
  const { error: e2 } = await adminCli.from("profiles").update({ is_active: cur.is_active }).eq("id", refTrainer.id);
  rec("admin", "toggleTrainer (flip+revert)", (e1||e2) ? "FAIL" : "OK", (e1?.message||e2?.message));
}

// addSurveyQuestion / deleteSurveyQuestion (need a survey-kind challenge)
let surveyChId = refSurveyChallenge?.id;
if (!surveyChId) {
  const { data: ch } = await adminCli.from("challenges").insert({
    title: "audit-survey", kind: "survey_trainee", points: 5, requires_moderation: false, ai_check: false,
  }).select("id").single();
  if (ch) { surveyChId = ch.id; addCleanup(() => svc.from("challenges").delete().eq("id", surveyChId)); }
}
if (surveyChId) {
  const { data: q, error: e1 } = await adminCli.from("survey_questions").insert({
    challenge_id: surveyChId, text: "audit Q?", options: [{label:"a"},{label:"b"}], position: 99,
  }).select("id").single();
  if (e1) rec("admin", "addSurveyQuestion", "FAIL", e1.message);
  else {
    rec("admin", "addSurveyQuestion", "OK");
    const { error: e2 } = await adminCli.from("survey_questions").delete().eq("id", q.id);
    rec("admin", "deleteSurveyQuestion", e2 ? "FAIL" : "OK", e2?.message);
  }
}

// moderateSubmission — need a submission. Skip if none exists.
{
  const { data: sub } = await svc.from("submissions").select("id, status").limit(1).maybeSingle();
  if (!sub) rec("admin", "moderateSubmission", "WARN", "no submissions in DB to test against — skipped");
  else {
    const oldStatus = sub.status;
    const { error: e1 } = await adminCli.from("submissions").update({ status: "approved", moderator_comment: "audit", moderated_by: adminUser.id, moderated_at: new Date().toISOString() }).eq("id", sub.id);
    const { error: e2 } = await adminCli.from("submissions").update({ status: oldStatus, moderator_comment: null, moderated_by: null, moderated_at: null }).eq("id", sub.id);
    rec("admin", "moderateSubmission (approve+revert)", (e1||e2) ? "FAIL" : "OK", (e1?.message||e2?.message));
  }
}

// updateOrderStatus — need an order
{
  const { data: ord } = await svc.from("orders").select("id, status").limit(1).maybeSingle();
  if (!ord) rec("admin", "updateOrderStatus", "WARN", "no orders to test — skipped");
  else {
    const { error: e1 } = await adminCli.from("orders").update({ status: "approved" }).eq("id", ord.id);
    const { error: e2 } = await adminCli.from("orders").update({ status: ord.status }).eq("id", ord.id);
    rec("admin", "updateOrderStatus", (e1||e2) ? "FAIL" : "OK", (e1?.message||e2?.message));
  }
}

// toggleMessageRead — need a contact message
{
  const { data: m } = await svc.from("contact_messages").select("id, is_read").limit(1).maybeSingle();
  if (!m) rec("admin", "toggleMessageRead", "WARN", "no contact_messages — skipped");
  else {
    const { error: e1 } = await adminCli.from("contact_messages").update({ is_read: !m.is_read }).eq("id", m.id);
    const { error: e2 } = await adminCli.from("contact_messages").update({ is_read: m.is_read }).eq("id", m.id);
    rec("admin", "toggleMessageRead", (e1||e2) ? "FAIL" : "OK", (e1?.message||e2?.message));
  }
}

// reorderEntity — needs 2+ events to swap. Create one if needed (we have audit-event).
if (createdEventId) {
  // need another event to swap with
  const { data: other } = await svc.from("events").select("id, sort_order").neq("id", createdEventId).limit(1).single();
  if (other) {
    const { data: cur } = await adminCli.from("events").select("sort_order").eq("id", createdEventId).single();
    const { error: e1 } = await adminCli.from("events").update({ sort_order: other.sort_order }).eq("id", createdEventId);
    const { error: e2 } = await adminCli.from("events").update({ sort_order: cur.sort_order }).eq("id", other.id);
    const { error: e3 } = await adminCli.from("events").update({ sort_order: other.sort_order }).eq("id", other.id);
    rec("admin", "reorderEntity (swap+revert)", (e1||e2||e3) ? "FAIL" : "OK", (e1?.message||e2?.message||e3?.message));
  }
}

// deleteChallenge protection — must throw because of submissions referencing
{
  const { count } = await svc.from("submissions").select("*", { count: "exact", head: true }).eq("challenge_id", refChallenge.id);
  rec("admin", "deleteChallenge guard against existing submissions", count > 0 ? "OK" : "WARN", `${count} submissions block delete as designed`);
}

// ─── 5. TRAINER ACTIONS (DB layer) ──────────────────────────────────────────
console.log("\n[Trainer actions]");

// proposeEvent (no cover)
let proposedEventId;
{
  const { data, error } = await trainerCli.from("events").insert({
    title: "audit-trainer-event", kind: "community",
    starts_at: new Date(Date.now()+172800_000).toISOString(),
    status: "pending", active: true, created_by: trainerUser.id, host_trainer_id: trainerUser.id,
  }).select("id").single();
  if (error) rec("trainer", "proposeEvent (no cover)", "FAIL", error.message);
  else { proposedEventId = data.id; rec("trainer", "proposeEvent", "OK"); addCleanup(() => svc.from("events").delete().eq("id", proposedEventId)); }
}

// trainer tries to insert event with status=approved (RLS should block)
{
  const { error } = await trainerCli.from("events").insert({
    title: "audit-trainer-tries-approved", kind: "community",
    starts_at: new Date(Date.now()+86400_000).toISOString(),
    status: "approved", active: true, created_by: trainerUser.id, host_trainer_id: trainerUser.id,
  });
  rec("trainer", "cannot insert approved event (RLS)", error ? "OK" : "FAIL", error?.message || "leak: insert succeeded");
}

// updateMyEvent — change title of own event
if (proposedEventId) {
  const { error } = await trainerCli.from("events").update({ title: "audit-trainer-event-edited", status: "pending", moderator_note: null }).eq("id", proposedEventId);
  rec("trainer", "updateMyEvent (own pending)", error ? "FAIL" : "OK", error?.message);
}

// withdrawMyEvent — set active=false
if (proposedEventId) {
  const { error } = await trainerCli.from("events").update({ active: false }).eq("id", proposedEventId);
  rec("trainer", "withdrawMyEvent (active=false)", error ? "FAIL" : "OK", error?.message);
}

// updateProfile — own profile
{
  const { data: cur } = await svc.from("profiles").select("full_name").eq("id", trainerUser.id).single();
  const { error } = await trainerCli.from("profiles").update({ full_name: cur.full_name }).eq("id", trainerUser.id);
  rec("trainer", "updateProfile (own)", error ? "FAIL" : "OK", error?.message);
}

// updateProfile — someone else's profile (should be blocked)
{
  const { data: other } = await svc.from("profiles").select("id").eq("role","trainer").neq("id", trainerUser.id).limit(1).single();
  if (other) {
    // Postgrest typically returns ok with 0 rows updated when RLS filters
    const { error, data } = await trainerCli.from("profiles").update({ full_name: "HACKED" }).eq("id", other.id).select();
    const blocked = !data || data.length === 0;
    rec("trainer", "cannot update other trainer profile (RLS)", blocked ? "OK" : "FAIL", blocked ? "0 rows affected" : "leak");
  }
}

// submitChallenge — insert submission (without upload)
let submissionId;
{
  const { data, error } = await trainerCli.from("submissions").insert({
    trainer_id: trainerUser.id, challenge_id: refChallenge.id, note: "audit submission",
  }).select("id").single();
  if (error) rec("trainer", "submitChallenge insert", "FAIL", error.message);
  else { submissionId = data.id; rec("trainer", "submitChallenge insert", "OK"); addCleanup(() => svc.from("submissions").delete().eq("id", submissionId)); }
}

// placeOrder — via RPC `create_order`
{
  // sufficient points?
  const { data: ptsRows } = await svc.from("point_transactions").select("amount").eq("trainer_id", trainerUser.id);
  const balance = (ptsRows ?? []).reduce((s,r)=>s+r.amount,0);
  if (balance < refProduct.price_points) {
    // top up via service-role
    const { data: topup } = await svc.from("point_transactions").insert({ trainer_id: trainerUser.id, amount: refProduct.price_points - balance + 1, reason: "audit-topup", created_by: adminUser.id }).select("id").single();
    addCleanup(() => svc.from("point_transactions").delete().eq("id", topup.id));
  }
  const { error } = await trainerCli.rpc("create_order", { p_product_id: refProduct.id, p_note: "audit order" });
  if (error) rec("trainer", "placeOrder (RPC create_order)", "FAIL", error.message);
  else {
    rec("trainer", "placeOrder (RPC create_order)", "OK");
    addCleanup(async () => {
      const { data: o } = await svc.from("orders").select("id").eq("trainer_id", trainerUser.id).eq("product_id", refProduct.id).order("created_at",{ascending:false}).limit(1).single();
      if (o) await svc.from("orders").delete().eq("id", o.id);
    });
  }
}

// ─── 6. PUBLIC / ANONYMOUS ACTIONS ──────────────────────────────────────────
console.log("\n[Public actions]");
const anon = createClient(SUPA, ANON);

// submitContact — direct INSERT not allowed by anon (uses service_role server-side). Validate via service-role insert path.
{
  const { data, error } = await svc.from("contact_messages").insert({ name: "audit", email: "audit@demo.om", message: "audit message long enough" }).select("id").single();
  if (error) rec("public", "submitContact (server uses service_role)", "FAIL", error.message);
  else { rec("public", "submitContact insert path", "OK"); addCleanup(() => svc.from("contact_messages").delete().eq("id", data.id)); }
}

// registerForEvent
{
  if (!refEvent) rec("public", "registerForEvent", "WARN", "no open event with registration to test");
  else {
    const { data, error } = await svc.from("event_registrations").insert({
      event_id: refEvent.id, name: "audit-reg", email: `audit-${Date.now()}@demo.om`, consent: true,
    }).select("id").single();
    if (error) rec("public", "registerForEvent insert", "FAIL", error.message);
    else { rec("public", "registerForEvent insert", "OK"); addCleanup(() => svc.from("event_registrations").delete().eq("id", data.id)); }
  }
}

// submitSurvey — insert directly with service_role to mimic action path
if (refTrainer && surveyChId) {
  const { data, error } = await svc.from("survey_responses").insert({
    trainer_id: refTrainer.id, challenge_id: surveyChId,
    trainee_email: `audit-${Date.now()}@demo.om`, trainee_name: "audit",
    answers: [{ question_id: null, answer: "audit" }],
  }).select("id").single();
  if (error) rec("public", "submitSurvey insert", "FAIL", error.message);
  else { rec("public", "submitSurvey insert", "OK"); addCleanup(() => svc.from("survey_responses").delete().eq("id", data.id)); }
}

// ─── 7. CLEANUP ─────────────────────────────────────────────────────────────
console.log("\n[Cleanup]");
for (const fn of cleanups.reverse()) {
  try { await fn(); } catch (e) { console.log("cleanup error:", e.message); }
}
console.log("Cleanup done.");

// ─── 8. SUMMARY ─────────────────────────────────────────────────────────────
const ok    = results.filter(r => r.status === "OK").length;
const fail  = results.filter(r => r.status === "FAIL").length;
const warn  = results.filter(r => r.status === "WARN").length;
console.log(`\n──────────── SUMMARY ────────────`);
console.log(`  ${ok} OK · ${warn} WARN · ${fail} FAIL`);
if (fail || warn) {
  console.log(`\nIssues:`);
  for (const r of results.filter(r => r.status !== "OK")) {
    console.log(`  [${r.status}] [${r.area}] ${r.name}` + (r.detail ? ` — ${r.detail}` : ""));
  }
}
process.exit(fail > 0 ? 1 : 0);
