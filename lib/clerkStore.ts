import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { authClient, bearerToken, isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/usageCounters";
import { can, isFieldKey, type Action, type FieldKey, type Role } from "@/lib/clerkWork";
import { ClerkError, chosenValues, type FieldRow } from "@/lib/clerkCore";

import type { AutoEntry, AutoHearing } from "@/lib/clerkDoc";
import { cleanEntry, isRegisterKind, parseIndianDate, showDate } from "@/lib/clerkRegisters";

export { ClerkError, chosenValues, conflicts, type FieldRow } from "@/lib/clerkCore";

/**
 * Server-only data access for Advocate Clerk Work.
 *
 * Every route goes through `clerkUser` (a signed-in person) and then
 * `requireMember` (that person's role in THAT office allows the action), so a
 * matter, file or document from one office can never be read through another
 * office's membership. The tables are service_role only (supabase/schema.sql);
 * these checks are the boundary.
 */

export const BUCKET = "clerk-files";


/**
 * Awaits a Supabase query and throws its error. supabase-js does not throw
 * when a write fails, it returns `{ error }`; a route that awaits a bare
 * update/insert/delete and then audits and answers `ok: true` reports a
 * change that never happened (a case marked confidential that stays
 * visible, an approval that leaves the document a draft). Every clerk
 * write goes through this, so a failed one becomes the 500 in clerkRoute.
 */
export async function must<T extends { error: unknown }>(query: PromiseLike<T>): Promise<T> {
  const result = await query;
  if (result.error) throw result.error;
  return result;
}

/**
 * An email as an `ilike` pattern that matches only itself. `%` and `_` are
 * wildcards to ilike and both are legal in an email address, so an
 * unescaped `a%@gmail.com` could match, and add to an office, someone the
 * administrator never named. ilike is kept (not eq) so the match stays
 * case-insensitive.
 */
export const exactEmail = (email: string) => email.trim().replace(/[\\%_]/g, "\\$&");

/** Runs a route body, turning a ClerkError into its JSON answer. */
export async function clerkRoute(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ClerkError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[api/mobile/clerk]", e);
    return NextResponse.json({ error: "Something went wrong on the server. Try again." }, { status: 500 });
  }
}

export type ClerkUser = { id: string; email: string };

export async function clerkUser(request: Request): Promise<ClerkUser> {
  if (!isSupabaseConfigured()) throw new ClerkError(503, "Clerk Work is not set up on this server yet.");
  const token = bearerToken(request);
  if (!token) throw new ClerkError(401, "Sign in to use Clerk Work.");
  const client = authClient();
  const { data, error } = client ? await client.auth.getUser(token) : { data: null, error: true };
  if (error || !data?.user) throw new ClerkError(401, "Your session has ended. Sign in again.");
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function roleIn(userId: string, officeId: string): Promise<Role | null> {
  const { data } = await supabase()
    .from("clerk_members")
    .select("role")
    .eq("office_id", officeId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  return (data?.role as Role | undefined) ?? null;
}

export async function requireMember(userId: string, officeId: string, action: Action): Promise<Role> {
  if (!isUuid(officeId)) throw new ClerkError(400, "Unknown office.");
  const role = await roleIn(userId, officeId);
  // Not a member answers the same as "no such office": nothing leaks.
  if (!role) throw new ClerkError(404, "That office was not found.");
  if (!can(role, action)) throw new ClerkError(403, "Your role in this office does not allow that.");
  return role;
}

export type MatterRow = {
  id: string;
  office_id: string;
  serial_no: number;
  file_code: string | null;
  parent_id: string | null;
  cause_title: string | null;
  case_label: string | null;
  court: string | null;
  cnr: string | null;
  client: string | null;
  advocate: string | null;
  next_hearing: string | null;
  next_hearing_on: string | null;
  restricted: boolean;
  created_at: string;
  updated_at: string;
};

/** Roles that see every matter in the office, restricted or not. */
const SEE_ALL: Role[] = ["office_admin", "senior_advocate"];

/** Whether this member may see a restricted matter. */
export async function mayOpen(userId: string, role: Role, matter: { id: string; restricted: boolean }): Promise<boolean> {
  if (!matter.restricted || SEE_ALL.includes(role)) return true;
  const { data } = await supabase().from("clerk_matter_access").select("user_id").eq("matter_id", matter.id).eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

/** Ids of the restricted matters in an office that this member may NOT see. */
export async function hiddenMatterIds(userId: string, role: Role, officeId: string): Promise<string[]> {
  if (SEE_ALL.includes(role)) return [];
  const { data: restricted } = await supabase().from("clerk_matters").select("id").eq("office_id", officeId).eq("restricted", true);
  if (!restricted?.length) return [];
  const { data: allowed } = await supabase().from("clerk_matter_access").select("matter_id").eq("user_id", userId).in("matter_id", restricted.map((m) => m.id));
  const ok = new Set((allowed ?? []).map((a) => a.matter_id));
  return restricted.map((m) => m.id).filter((id) => !ok.has(id));
}

/** The matter, after checking the person may do `action` in its office. */
export async function loadMatter(userId: string, matterId: string, action: Action): Promise<{ matter: MatterRow; role: Role }> {
  if (!isUuid(matterId)) throw new ClerkError(404, "That case was not found.");
  const { data } = await supabase().from("clerk_matters").select("*").eq("id", matterId).is("deleted_at", null).maybeSingle();
  if (!data) throw new ClerkError(404, "That case was not found.");
  const role = await requireMember(userId, data.office_id, action);
  // A restricted matter answers like a missing one to those not on its list.
  if (!(await mayOpen(userId, role, data))) throw new ClerkError(404, "That case was not found.");
  return { matter: data as MatterRow, role };
}

export async function audit(officeId: string, matterId: string | null, actor: string, action: string, detail: Record<string, unknown> = {}) {
  const { error } = await supabase().from("clerk_audit").insert({ office_id: officeId, matter_id: matterId, actor, action, detail });
  if (error) console.error("[clerk audit]", error.message);
}

/* ------------------------------------------------------------ fields */

export async function matterFields(matterId: string): Promise<FieldRow[]> {
  const { data, error } = await supabase().from("clerk_fields").select("*").eq("matter_id", matterId).order("created_at");
  if (error) throw error;
  return (data ?? []).filter((r) => isFieldKey(r.key)) as FieldRow[];
}

/** Refreshes the register's searchable summary from the chosen fields. */
export async function syncMatterSummary(matterId: string) {
  const v = chosenValues(await matterFields(matterId));
  const get = (k: FieldKey) => v[k]?.value?.trim() || null;
  const caseLabel = [get("case_type"), [get("case_number"), get("case_year")].filter(Boolean).join("/")].filter(Boolean).join(" ") || null;
  await must(supabase()
    .from("clerk_matters")
    .update({
      cause_title: get("cause_title"),
      case_label: caseLabel,
      court: get("court_name"),
      cnr: get("cnr"),
      client: get("client_name"),
      advocate: get("advocate_name"),
      next_hearing: get("next_hearing_date"),
      next_hearing_on: parseIndianDate(get("next_hearing_date")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", matterId));
}

/* ------------------------------------------------------------ files */

export const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

export async function putFile(path: string, body: Buffer, contentType: string) {
  const { error } = await supabase().storage.from(BUCKET).upload(path, body, { contentType, upsert: true });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
}

export async function getFile(path: string): Promise<Buffer> {
  const { data, error } = await supabase().storage.from(BUCKET).download(path);
  if (error || !data) throw new ClerkError(404, "That file is no longer stored.");
  return Buffer.from(await data.arrayBuffer());
}

/* ------------------------------------------------------------ input */

export async function readJson(request: Request, maxBytes = 100_000): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new ClerkError(413, "That is too large to send.");
  const text = await request.text();
  if (text.length > maxBytes) throw new ClerkError(413, "That is too large to send.");
  try {
    const v = JSON.parse(text || "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new ClerkError(400, "Malformed request.");
  }
}

export const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ------------------------------------------------- registers, hearings */

/** Files the register rows a service produced. Rows that do not validate are skipped and reported. */
export async function fileEntries(officeId: string, matterId: string | null, actor: string, entries: AutoEntry[], documentId: string | null): Promise<string[]> {
  const skipped: string[] = [];
  const rows = [];
  for (const e of entries) {
    if (!isRegisterKind(e.kind)) continue;
    const c = cleanEntry(e.kind, e.data);
    if (typeof c === "string") {
      skipped.push(`${e.kind}: ${c}`);
      continue;
    }
    rows.push({ office_id: officeId, matter_id: matterId, kind: e.kind, entry_date: c.date, status: c.status, amount: c.amount, data: c.data, document_id: documentId, created_by: actor });
  }
  if (rows.length) {
    const { error } = await supabase().from("clerk_entries").insert(rows);
    if (error) throw error;
  }
  return skipped;
}

/**
 * Records a hearing. A court's order with a next date also becomes the case's
 * next hearing (entered by hand, so marked corrected); a clerk's report waits
 * for confirmation and changes nothing yet.
 */
export async function recordHearing(officeId: string, matterId: string, actor: string, h: AutoHearing): Promise<string> {
  const { data, error } = await supabase()
    .from("clerk_hearings")
    .insert({ office_id: officeId, matter_id: matterId, hearing_on: h.hearing_on, purpose: h.purpose ?? null, result: h.result, source: h.source, next_on: h.next_on ?? null, next_purpose: h.next_purpose || null, directions: h.directions || null, entered_by: actor, ...(h.source === "court_order" ? { confirmed_by: actor, confirmed_at: new Date().toISOString() } : {}) })
    .select("id")
    .single();
  if (error) throw error;
  if (h.source === "court_order") await applyHearing(matterId, actor, h);
  await audit(officeId, matterId, actor, "hearing.recorded", { hearing: data.id, on: h.hearing_on, source: h.source, next: h.next_on ?? null });
  return data.id;
}

/** Puts a confirmed hearing's next date, purpose and directions on the case sheet. */
export async function applyHearing(matterId: string, actor: string, h: { next_on?: string | null; next_purpose?: string | null; directions?: string | null; hearing_on: string; result: string }) {
  const now = new Date().toISOString();
  const set = async (key: string, value: string) => {
    await must(supabase().from("clerk_fields").update({ chosen: false }).eq("matter_id", matterId).eq("key", key));
    await must(supabase().from("clerk_fields").insert({ matter_id: matterId, key, value, status: "corrected", chosen: true, as_of: showDate(h.hearing_on), decided_by: actor, decided_at: now }));
  };
  await set("last_hearing_date", showDate(h.hearing_on));
  await set("last_hearing_proceedings", h.result);
  if (h.next_on) await set("next_hearing_date", showDate(h.next_on));
  if (h.next_purpose) await set("next_hearing_purpose", h.next_purpose);
  if (h.directions) await set("court_directions", h.directions);
  await syncMatterSummary(matterId);
}
