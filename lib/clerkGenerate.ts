import { PDFDocument } from "pdf-lib";
import { documentFilename, getWork, type ClerkWork, type FieldKey } from "@/lib/clerkWork";
import type { AutoEntry, AutoHearing } from "@/lib/clerkDoc";
import { getService, missingInputs, type Inputs, type ServiceData } from "@/lib/clerkServices";
import { causeStrings, composedDocx, composedDocxChildren, renderComposedPdf, type Fonts } from "@/lib/clerkRender";
import type { Translator } from "@/lib/clerkLanguage";
import {
  analyseBlankForm,
  buildDocx,
  docketData,
  docketDocxChildren,
  docketPdfPage,
  fillBlankForm,
  typedLines,
  type FillReport,
  type FormAnalysis,
  type MapTarget,
  type Values,
} from "@/lib/clerkForms";
import { ClerkError, type FieldRow } from "@/lib/clerkCore";

/**
 * Builds one clerk-work document from a matter's confirmed fields. Used both
 * for the draft and, after an advocate approves it, for the clean copy: the
 * same inputs give the same pages, only the draft label differs.
 */

export type GenerateInput = {
  work: ClerkWork;
  fields: Partial<Record<FieldKey, FieldRow>>;
  filingDate: string;
  blank: Uint8Array | null;
  mapping: Record<string, MapTarget> | null;
  draft: boolean;
  /** The paper a standalone docket covers ("Written Statement", "I.A. for …"). A vakalat's docket covers the vakalat. */
  documentName?: string;
  /** A typed service's own answers (lib/clerkServices.ts). */
  inputs?: Inputs;
  /** The registers / office day a typed service reads. */
  data?: ServiceData;
  /** Fonts for the translated (Telugu) paper. */
  fonts?: (doc: PDFDocument) => Promise<Fonts>;
  /** Telugu or bilingual output for a typed service (lib/clerkLanguage.ts). */
  translate?: Translator;
};

export type SourceLine = { field: MapTarget; value: string; source: string; page: number | null; confidence: string | null; status: string };

export type GenerateOutput = {
  pdf: Uint8Array;
  docx: Buffer;
  report: FillReport & { sources: SourceLine[]; docketAdded: boolean; pageCount: number; warnings: string[] };
  /** Register rows and a hearing the service records as it is generated. */
  entries: AutoEntry[];
  /** English → Telugu strings used, kept with the draft so approval reproduces it. */
  translation?: Record<string, string>;
  hearing: AutoHearing | null;
};

/** The name of the paper the document is, or the docket covers. */
export const documentNameFor = (work: ClerkWork, given?: string) => (given?.trim() || (work.generator === "vakalatnama" ? work.name : ""));

export function valuesFor(fields: GenerateInput["fields"], work: ClerkWork, filingDate: string, documentName?: string): Values {
  const values: Values = { filing_date: filingDate, document_name: documentNameFor(work, documentName) };
  for (const [k, row] of Object.entries(fields)) if (row) values[k as FieldKey] = row.value;
  return values;
}

function sourcesFor(keys: Iterable<MapTarget>, i: GenerateInput, values: Values, uploadNames: Map<string, string>): SourceLine[] {
  const sources: SourceLine[] = [];
  for (const t of new Set(keys)) {
    if (t === "filing_date" || t === "document_name" || t === "blank") {
      if (values[t]) sources.push({ field: t, value: values[t] ?? "", source: "Entered at generation", page: null, confidence: null, status: "confirmed" });
      continue;
    }
    const row = i.fields[t];
    if (!row) continue;
    sources.push({ field: t, value: row.value, source: row.upload_id ? (uploadNames.get(row.upload_id) ?? "Uploaded document") : "Entered by hand", page: row.page, confidence: row.confidence, status: row.status });
  }
  return sources;
}

/** A typed service: composed from the case and the service's answers, then rendered. */
async function generateTyped(i: GenerateInput, uploadNames: Map<string, string>): Promise<GenerateOutput> {
  const spec = getService(i.work.no);
  if (!spec) throw new ClerkError(422, `${i.work.name} has no document builder.`);
  const inputs = i.inputs ?? {};
  const missing = missingInputs(spec, inputs);
  if (missing.length) throw new ClerkError(422, `Fill in: ${missing.join(", ")}.`);
  const values = valuesFor(i.fields, i.work, i.filingDate, i.documentName);
  const composed = spec.compose({ v: values, i: inputs, data: i.data ?? { entries: [] }, date: i.filingDate });
  const inProceeding = typeof inputs.in_proceeding === "string" ? inputs.in_proceeding : "";

  const pdf = await PDFDocument.create();
  const warnings = [...composed.doc.warnings];
  const parts: ReturnType<typeof composedDocxChildren>[] = [];
  let report: FillReport = { filled: [], leftBlank: [], continued: [], unprintable: [] };
  // English paper, unless Telugu only.
  if (!i.translate || i.translate.mode === "bilingual") {
    report = await renderComposedPdf(pdf, composed.doc, values, { draft: i.draft, inProceeding });
    parts.push(composedDocxChildren(composed.doc, values, { inProceeding }));
  }
  let translation: Record<string, string> | undefined;
  if (i.translate) {
    const t = await i.translate.run(composed.doc, causeStrings(values));
    translation = t.dictionary;
    const fonts = i.fonts ? await i.fonts(pdf) : undefined;
    const tr = await renderComposedPdf(pdf, t.doc, values, { draft: i.draft, inProceeding, fonts, cause: t.cause });
    report.unprintable.push(...tr.unprintable.filter((ch) => !report.unprintable.includes(ch)));
    parts.push(composedDocxChildren(t.doc, values, { inProceeding, cause: t.cause, font: fonts?.docxFont }));
    warnings.push("The Telugu text is a machine translation by Claude. Check every line against the English before use.");
  }
  let docketAdded = false;
  if (composed.doc.docket) {
    const dk = docketData(values, composed.doc.title);
    const r = await docketPdfPage(pdf, dk, "back", { draft: i.draft });
    report.unprintable.push(...r.unprintable.filter((ch) => !report.unprintable.includes(ch)));
    parts.push(docketDocxChildren("back", dk));
    docketAdded = true;
  }
  const docx = await composedDocx(parts, { title: composed.doc.title, draft: i.draft });
  const keys: MapTarget[] = [...i.work.needs, "filing_date"];
  return {
    pdf: await pdf.save(),
    docx,
    report: { ...report, sources: sourcesFor(keys, i, values, uploadNames), docketAdded, pageCount: pdf.getPageCount(), warnings },
    entries: composed.entries ?? [],
    hearing: composed.hearing ?? null,
    translation,
  };
}

export async function generateDocument(i: GenerateInput, uploadNames: Map<string, string>): Promise<GenerateOutput> {
  if (i.work.generator === "typed") return generateTyped(i, uploadNames);
  const values = valuesFor(i.fields, i.work, i.filingDate, i.documentName);
  const docket = docketData(values, values.document_name ?? "");
  let analysis: FormAnalysis | null = null;
  let pdf: PDFDocument;
  let report: FillReport;
  let docketAdded = false;
  const dockets: { kind: "front" | "back"; data: typeof docket }[] = [];

  if (i.blank) {
    analysis = await analyseBlankForm(i.blank);
    if (!analysis.hasText) {
      throw new ClerkError(422, "This blank form is a scan with no text layer, so its blanks cannot be located. Upload the court's fillable or text PDF of the form.");
    }
    const filled = await fillBlankForm(i.blank, analysis, i.mapping ?? {}, values, { draft: i.draft });
    pdf = filled.doc;
    report = filled.report;
  } else {
    if (i.work.blankForm === "required") {
      throw new ClerkError(422, `Upload the prescribed blank ${i.work.name} for this court. Shisho does not substitute a format it has not been given.`);
    }
    pdf = await PDFDocument.create();
    report = { filled: [], leftBlank: [], continued: [], unprintable: [] };
  }

  // The vakalat goes with its backside docket. If the uploaded form has none, the office docket is added.
  const wantDocket: "front" | "back" | null =
    i.work.generator === "docket-front" ? "front" : i.work.generator === "docket-back" || i.work.generator === "vakalatnama" ? "back" : null;
  if (wantDocket && !(analysis?.hasDocket)) {
    const r = await docketPdfPage(pdf, docket, wantDocket, { draft: i.draft });
    report.unprintable.push(...r.unprintable.filter((c) => !report.unprintable.includes(c)));
    dockets.push({ kind: wantDocket, data: docket });
    docketAdded = true;
  }

  const used = new Set<MapTarget>([...report.filled.map((f) => f.target), ...report.continued.map((c) => c.target)]);
  if (docketAdded) for (const k of ["court_name", "case_type", "case_number", "case_year", "petitioner_side", "respondent_side", "cause_title", "client_name", "client_capacity", "advocate_name", "advocate_enrolment", "advocate_address"] as const) if (values[k]) used.add(k);
  const sources = sourcesFor(used, i, values, uploadNames);

  const typed = analysis ? typedLines(analysis, i.mapping ?? {}, values) : null;
  const docx = await buildDocx({ title: i.work.name, draft: i.draft, typed, dockets });
  const bytes = await pdf.save();
  return { pdf: bytes, docx, report: { ...report, sources, docketAdded, pageCount: pdf.getPageCount(), warnings: [] }, entries: [], hearing: null };
}

export function filenamesFor(o: { serial: number | null; fields: GenerateInput["fields"]; workNo: number; date: string; version: number }) {
  const work = getWork(o.workNo)!;
  const base = { serial: o.serial, caseType: o.fields.case_type?.value, caseNumber: o.fields.case_number?.value, caseYear: o.fields.case_year?.value, work: work.name, date: o.date, version: o.version };
  return { pdf: documentFilename({ ...base, ext: "pdf" }), docx: documentFilename({ ...base, ext: "docx" }) };
}
