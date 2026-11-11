import { PDFDocument } from "pdf-lib";
import { supabase } from "@/lib/supabase";
import { isTrialPlan } from "@/lib/entitlements";
import { getUserPlan } from "@/lib/profile";
import { FREE_MONTHLY_TOOL_RUNS } from "@/lib/toolTypes";
import { consumeUsage, refundUsage } from "@/lib/usageCounters";
import { extractCaseParticulars, ExtractUnavailable } from "@/lib/clerkExtract";
import { ClerkError, audit, matterFields, syncMatterSummary, type FieldRow, must } from "@/lib/clerkStore";

/**
 * Reading an uploaded case PDF into candidate fields. The upload row records
 * the state (processing → extracted / failed) so the app can show it and offer
 * a retry; the source file itself is never changed.
 *
 * A value that agrees with the one already chosen is kept as a second source.
 * A value that disagrees is stored beside it, and NEITHER stays chosen: the
 * person must pick, so a rival reading never silently replaces a confirmed one.
 */

export const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 15_000_000;

export async function pageCount(buf: Buffer, mimeType: string): Promise<number | null> {
  if (mimeType !== "application/pdf") return 1;
  try {
    return (await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false })).getPageCount();
  } catch {
    return null;
  }
}

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

export async function runExtraction(o: { uploadId: string; officeId: string; matterId: string; userId: string; mimeType: string; buf: Buffer; pages: number | null; filename: string }) {
  // Trial plans share the monthly tool allowance; paid plans are not counted.
  const plan = await getUserPlan(o.userId);
  const counted = isTrialPlan(plan) ? await consumeUsage(o.userId, "tool", FREE_MONTHLY_TOOL_RUNS) : null;
  if (counted && !counted.allowed) {
    throw new ClerkError(402, `You have used all ${FREE_MONTHLY_TOOL_RUNS} free readings this month. Core, Proficient and the Shisho plan have no limit.`);
  }

  await must(supabase().from("clerk_uploads").update({ status: "processing", error: null }).eq("id", o.uploadId));
  let extraction;
  try {
    extraction = await extractCaseParticulars({ mimeType: o.mimeType, dataBase64: o.buf.toString("base64") }, o.pages);
  } catch (e) {
    if (counted) await refundUsage(o.userId, "tool");
    const message = e instanceof ExtractUnavailable ? e.message : "Shisho could not read this file. Try again, or enter the details by hand.";
    console.error("[clerk extract]", e);
    const { error: markError } = await supabase().from("clerk_uploads").update({ status: "failed", error: message }).eq("id", o.uploadId);
    if (markError) console.error("[clerk extract] could not mark the upload failed:", markError.message);
    throw new ClerkError(e instanceof ExtractUnavailable ? 503 : 502, message);
  }

  // A retry replaces this upload's own earlier readings, never anyone's decisions on other sources.
  await must(supabase().from("clerk_fields").delete().eq("upload_id", o.uploadId).eq("status", "unverified"));
  const existing = await matterFields(o.matterId);
  const rows: Partial<FieldRow>[] = [];
  const unchoose: string[] = [];
  for (const item of extraction.items) {
    const same = existing.filter((r) => r.key === item.key);
    const agrees = same.some((r) => norm(r.value) === norm(item.value));
    const chosenRow = same.find((r) => r.chosen);
    let chosen = false;
    if (same.length === 0 && !rows.some((r) => r.key === item.key && r.chosen)) chosen = true;
    else if (!agrees && chosenRow) unchoose.push(chosenRow.id); // a conflict: the person decides
    rows.push({
      matter_id: o.matterId,
      upload_id: o.uploadId,
      key: item.key,
      value: item.value,
      page: item.page,
      quote: item.quote || null,
      confidence: item.confidence,
      status: "unverified",
      chosen,
      as_of: extraction.documentDate || null,
    });
  }
  // Two readings of the same key within this one document that disagree: none is chosen.
  for (const r of rows) {
    const rivals = rows.filter((x) => x.key === r.key);
    if (new Set(rivals.map((x) => norm(x.value ?? ""))).size > 1) r.chosen = false;
  }
  if (unchoose.length) await must(supabase().from("clerk_fields").update({ chosen: false }).in("id", unchoose));
  if (rows.length) {
    const { error } = await supabase().from("clerk_fields").insert(rows);
    if (error) throw error;
  }
  await must(supabase().from("clerk_uploads").update({ status: "extracted", pages: o.pages }).eq("id", o.uploadId));
  await syncMatterSummary(o.matterId);
  await audit(o.officeId, o.matterId, o.userId, "upload.extracted", { upload: o.uploadId, filename: o.filename, fields: rows.length, kind: extraction.documentKind, documentDate: extraction.documentDate });
  return { fields: rows.length, documentKind: extraction.documentKind, documentDate: extraction.documentDate };
}
