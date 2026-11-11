import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { LANGUAGE_READY, OFFICE_WIDE_WORK, OUTPUT_FORMATS, OUTPUT_LANGUAGES, fieldLabel, getWork, isFieldKey, type FieldKey, type OutputFormat, type OutputLanguage, type Role } from "@/lib/clerkWork";
import { parseIndianDate, redact } from "@/lib/clerkRegisters";
import { cleanInputs, getService, type Inputs, type ServiceData } from "@/lib/clerkServices";
import { isMapTarget, type MapTarget } from "@/lib/clerkForms";
import { filenamesFor, generateDocument, type GenerateInput } from "@/lib/clerkGenerate";
import { serviceData } from "@/lib/clerkOffice";
import { fontsFor, replayTranslator, translateComposedHook } from "@/lib/clerkLanguage";
import { audit, chosenValues, conflicts, fileEntries, getFile, matterFields, putFile, recordHearing, str, ClerkError, type FieldRow, type MatterRow, must } from "@/lib/clerkStore";

/**
 * Server-only. Creates one clerk-work document, for a case or (the daily
 * sheets) for the office: checks, generation, version, private files, the
 * register rows and hearing the service records, the template library and
 * the audit entry. Both generate routes call this, so the rules are the same.
 */

type Body = Record<string, unknown>;

export type Created = { document: { id: string; version: number; status: "draft"; pdfName: string | null; docxName: string | null }; report: unknown; filed: { entries: number; skipped: string[]; hearing: boolean } };

/** Masks Aadhaar, PAN and account numbers in every value that goes into the paper. */
function redactAll(fields: Partial<Record<FieldKey, FieldRow>>, inputs: Inputs) {
  const f: Partial<Record<FieldKey, FieldRow>> = {};
  for (const [k, r] of Object.entries(fields)) if (r) f[k as FieldKey] = { ...r, value: redact(r.value) };
  const i: Inputs = {};
  for (const [k, v] of Object.entries(inputs)) i[k] = typeof v === "string" ? redact(v) : v.map((row) => row.map(redact));
  return { fields: f, inputs: i };
}

export async function createDocument(o: { userId: string; role: Role; officeId: string; matter: MatterRow | null; body: Body }): Promise<Created> {
  const { body, matter, officeId, userId } = o;
  const work = getWork(Number(body.workNo));
  if (!work) throw new ClerkError(400, "Choose the clerk work (1–63).");
  const officeWide = OFFICE_WIDE_WORK.includes(work.no);
  if (!matter && !officeWide) throw new ClerkError(400, `${work.name} is prepared for a case. Choose the case first.`);

  const language = (OUTPUT_LANGUAGES as readonly string[]).includes(String(body.language)) ? (body.language as OutputLanguage) : "en";
  if (!LANGUAGE_READY[language]) throw new ClerkError(422, "That output language is not available on this server.");
  if (language !== "en" && work.generator !== "typed") throw new ClerkError(422, "A court's own blank form is filled in the language it is printed in. Choose English for this service.");
  const format = (OUTPUT_FORMATS as readonly string[]).includes(String(body.format)) ? (body.format as OutputFormat) : "both";
  const rawDate = str(body.filingDate, 20);
  const filingDate = rawDate ? parseIndianDate(rawDate) : "";
  if (rawDate && !filingDate) throw new ClerkError(400, "Give the filing date as DD-MM-YYYY.");

  // Case particulars: every field the service needs reviewed, none in conflict.
  let chosen: Partial<Record<FieldKey, FieldRow>> = {};
  let names = new Map<string, string>();
  if (matter) {
    const rows = await matterFields(matter.id);
    chosen = chosenValues(rows);
    const open = conflicts(rows);
    const clashing = work.needs.filter((k) => open.includes(k));
    const unreviewed = work.needs.filter((k) => !chosen[k] || chosen[k]!.status === "unverified");
    if (clashing.length) throw new ClerkError(422, `Choose between the conflicting values for: ${clashing.map(fieldLabel).join(", ")}.`);
    if (unreviewed.length) throw new ClerkError(422, `Confirm or correct these first: ${unreviewed.map(fieldLabel).join(", ")}.`);
    const { data: uploads } = await supabase().from("clerk_uploads").select("id, filename").eq("matter_id", matter.id);
    names = new Map((uploads ?? []).map((u) => [u.id, u.filename]));
  }

  // A typed service's own answers, pre-filled from confirmed particulars where the service says so.
  let inputs: Inputs = {};
  let data: ServiceData | undefined;
  const spec = work.generator === "typed" ? getService(work.no) : undefined;
  if (spec) {
    const raw = { ...((body.inputs ?? {}) as Record<string, unknown>) };
    for (const f of spec.inputs) {
      if (f.from && (raw[f.key] === undefined || raw[f.key] === "") && chosen[f.from]?.value) raw[f.key] = chosen[f.from]!.value;
    }
    const c = cleanInputs(spec, raw);
    if (typeof c === "string") throw new ClerkError(400, c);
    inputs = c;
    if (spec.data) data = await serviceData({ officeId, matterId: matter?.id ?? null, date: typeof inputs.date === "string" ? inputs.date : null, userId, role: o.role, kind: spec.data });
  }

  let blank: Uint8Array | null = null;
  let upload: { id: string; sha256: string; filename: string } | null = null;
  if (body.uploadId && matter) {
    if (!isUuid(body.uploadId)) throw new ClerkError(400, "Unknown blank form.");
    const { data: u } = await supabase().from("clerk_uploads").select("id, sha256, filename, storage_path").eq("id", body.uploadId).eq("matter_id", matter.id).eq("kind", "blank_form").is("deleted_at", null).maybeSingle();
    if (!u) throw new ClerkError(404, "That blank form was not found.");
    upload = u;
    blank = new Uint8Array(await getFile(u.storage_path));
  }
  const mapping: Record<string, MapTarget> = {};
  if (body.mapping && typeof body.mapping === "object") for (const [k, v] of Object.entries(body.mapping as Record<string, unknown>)) if (/^p\d+-\d+$/.test(k) && isMapTarget(v)) mapping[k] = v;

  const doRedact = body.redact === true;
  const useFields = doRedact ? redactAll(chosen, inputs).fields : chosen;
  const useInputs = doRedact ? redactAll(chosen, inputs).inputs : inputs;
  const documentName = str(body.documentName, 200);
  const gin: GenerateInput = { work, fields: useFields, filingDate: filingDate || "", blank, mapping, draft: true, documentName, inputs: useInputs, data, fonts: fontsFor(language), translate: translateComposedHook(language) };
  const out = await generateDocument(gin, names);

  let q = supabase().from("clerk_documents").select("version").eq("office_id", officeId).eq("work_no", work.no).order("version", { ascending: false }).limit(1);
  q = matter ? q.eq("matter_id", matter.id) : q.is("matter_id", null);
  const { data: last } = await q.maybeSingle();
  const version = (last?.version ?? 0) + 1;
  const today = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
  const files = filenamesFor({ serial: matter?.serial_no ?? null, fields: chosen, workNo: work.no, date: today, version });

  let templateId: string | null = null;
  if (upload && body.saveTemplate === true && Object.keys(mapping).length) {
    const { data: tpl } = await supabase().from("clerk_templates").select("id, version, mapping, approved_at").eq("office_id", officeId).eq("sha256", upload.sha256).order("version", { ascending: false }).limit(1).maybeSingle();
    if (tpl && JSON.stringify(tpl.mapping) === JSON.stringify(mapping)) templateId = tpl.id;
    else {
      // An approved mapping is never overwritten; a changed one becomes a new version.
      const { data: created, error } = await supabase()
        .from("clerk_templates")
        .insert({ office_id: officeId, work_no: work.no, name: `${work.name}: ${upload.filename}`, sha256: upload.sha256, forum: chosen.court_name?.value ?? null, state: chosen.state?.value ?? null, district: chosen.district?.value ?? null, proceeding_type: chosen.case_type?.value ?? null, mapping, version: (tpl?.version ?? 0) + 1, created_by: userId })
        .select("id")
        .single();
      if (error) throw error;
      templateId = created.id;
      if (tpl && !tpl.approved_at) await must(supabase().from("clerk_templates").update({ status: "archived" }).eq("id", tpl.id));
    }
  }

  const { data: doc, error } = await supabase()
    .from("clerk_documents")
    .insert({
      office_id: officeId,
      matter_id: matter?.id ?? null,
      work_no: work.no,
      version,
      status: "draft",
      upload_id: upload?.id ?? null,
      template_id: templateId,
      field_values: Object.fromEntries(Object.entries(chosen).map(([k, r]) => [k, { id: r!.id, value: r!.value, status: r!.status }])),
      inputs,
      mapping,
      // The service data is kept as drafted, so the approved copy is exactly what was reviewed.
      options: { filingDate: filingDate || "", language, format, documentName, redact: doRedact, instructions: str(body.instructions, 2000), serviceData: data ?? null, translation: out.translation ?? null },
      report: out.report,
      pdf_name: format === "docx" ? null : files.pdf,
      docx_name: format === "pdf" ? null : files.docx,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw error;

  const base = `offices/${officeId}/${matter ? `matters/${matter.id}` : "office"}/documents/${doc.id}`;
  const update: Record<string, string> = {};
  if (format !== "docx") {
    await putFile(`${base}/draft.pdf`, Buffer.from(out.pdf), "application/pdf");
    update.pdf_path = `${base}/draft.pdf`;
  }
  if (format !== "pdf") {
    await putFile(`${base}/draft.docx`, out.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    update.docx_path = `${base}/draft.docx`;
  }
  await must(supabase().from("clerk_documents").update(update).eq("id", doc.id));

  const skipped = out.entries.length ? await fileEntries(officeId, matter?.id ?? null, userId, out.entries, doc.id) : [];
  let hearing = false;
  if (out.hearing && matter) {
    await recordHearing(officeId, matter.id, userId, out.hearing);
    hearing = true;
  }
  await audit(officeId, matter?.id ?? null, userId, "document.generated", { document: doc.id, work: work.no, version, language, redacted: doRedact, entries: out.entries.length - skipped.length, hearing });

  return {
    document: { id: doc.id, version, status: "draft", pdfName: update.pdf_path ? files.pdf : null, docxName: update.docx_path ? files.docx : null },
    report: out.report,
    filed: { entries: out.entries.length - skipped.length, skipped, hearing },
  };
}

/** Re-renders a draft exactly from what was stored with it (approval). */
export async function rerender(doc: Record<string, unknown> & { work_no: number; options: Record<string, unknown> | null; field_values: unknown; mapping: unknown; inputs: unknown; upload_id: string | null; matter_id: string | null }) {
  const work = getWork(doc.work_no)!;
  const fields: Partial<Record<FieldKey, FieldRow>> = {};
  const stored = (doc.field_values ?? {}) as Record<string, { id: string; value: string; status: FieldRow["status"] }>;
  const ids = Object.values(stored).map((f) => f.id);
  const { data: srcRows } = ids.length ? await supabase().from("clerk_fields").select("*").in("id", ids) : { data: [] };
  const byId = new Map((srcRows ?? []).map((r) => [r.id, r as FieldRow]));
  for (const [k, v] of Object.entries(stored)) if (isFieldKey(k)) fields[k] = { ...(byId.get(v.id) ?? ({} as FieldRow)), id: v.id, key: k, value: v.value, status: v.status };
  const mapping: Record<string, MapTarget> = {};
  for (const [k, v] of Object.entries((doc.mapping ?? {}) as Record<string, unknown>)) if (isMapTarget(v)) mapping[k] = v;
  const opts = doc.options ?? {};
  const inputs = (doc.inputs ?? {}) as Inputs;
  const doRedact = opts.redact === true;
  const red = doRedact ? redactAll(fields, inputs) : { fields, inputs };
  let blank: Uint8Array | null = null;
  if (doc.upload_id) {
    const { data: up } = await supabase().from("clerk_uploads").select("storage_path").eq("id", doc.upload_id).maybeSingle();
    if (!up) throw new ClerkError(409, "The blank form this draft used has been removed; generate a new version.");
    blank = new Uint8Array(await getFile(up.storage_path));
  }
  const { data: uploads } = doc.matter_id ? await supabase().from("clerk_uploads").select("id, filename").eq("matter_id", doc.matter_id) : { data: [] };
  const language = (opts.language as OutputLanguage) ?? "en";
  return generateDocument(
    { work, fields: red.fields, filingDate: String(opts.filingDate ?? ""), blank, mapping, draft: false, documentName: String(opts.documentName ?? ""), inputs: red.inputs, data: (opts.serviceData as ServiceData | null) ?? undefined, fonts: fontsFor(language), translate: replayTranslator(language, (opts.translation as Record<string, string> | null) ?? {}) },
    new Map((uploads ?? []).map((u) => [u.id, u.filename])),
  );
}
