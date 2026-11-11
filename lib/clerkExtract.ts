import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { CASE_FIELDS, DATED_FIELDS, FIELD_KEYS, isFieldKey, type Confidence, type FieldKey } from "@/lib/clerkWork";

/**
 * Reads a client's case PDF (or photo) and returns the case particulars, each
 * with the page it came from and how sure the reading is.
 *
 * Client case files go to Claude only (never the Gemini free tier, whose
 * inputs may be used to improve its models). There is no demo fallback: a
 * server without the Claude key says so instead of inventing particulars.
 */

export const EXTRACT_MODEL = "claude-opus-5-5";

export type ExtractedItem = { key: FieldKey; value: string; page: number | null; quote: string; confidence: Confidence };
export type Extraction = { documentKind: string; documentDate: string; items: ExtractedItem[] };

export class ExtractUnavailable extends Error {}

const SYSTEM = `You read Indian court papers for an advocate's office: plaints, petitions, orders, cause lists, vakalats, dockets, notices and annexures, printed or scanned, in English or Telugu.

Pull out the case particulars listed in the schema. Rules:
- Only what the document itself shows. Never guess, complete, or "correct" a value. If a field is not in the document, leave it out.
- Copy names, numbers and titles exactly as written (spelling, initials, punctuation). Do not translate case numbers or identifiers.
- page is the 1-based page of the PDF where the value appears. quote is the short exact text you read it from (under 160 characters).
- confidence: "high" for clear printed text; "medium" for faint, partly cut, or inferred-from-layout values; "low" for handwriting, poor scans, or any doubt. Handwriting is never "high".
- A cause-list item number, CNR, filing, SR or diary number is never the case number; put each in its own field.
- client_name and client_capacity only when the document shows which party this office represents (a vakalat, "counsel for", a docket "filed by"). Otherwise leave them out.
- Status fields (stage, hearing dates, directions, pending work) describe the case as of this document. Report them as written; do not assume they are current.
- Dates as written in the document.
- Give the document's own kind (e.g. "Plaint", "Order sheet", "Vakalatnama") and its date if it has one.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["document_kind", "document_date", "fields"],
  properties: {
    document_kind: { type: "string" },
    document_date: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "value", "page", "quote", "confidence"],
        properties: {
          key: { type: "string", enum: FIELD_KEYS },
          value: { type: "string" },
          page: { type: "integer" },
          quote: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
  },
} as const;

const FIELD_GUIDE = CASE_FIELDS.map((f) => `${f.key}: ${f.label}${f.hint ? ` (${f.hint})` : ""}`).join("\n");

type Raw = { document_kind?: unknown; document_date?: unknown; fields?: unknown };

/** Shapes the model's JSON: unknown keys dropped, blanks dropped, handwriting never above medium. */
export function shapeExtraction(raw: Raw, pageCount: number | null): Extraction {
  const s = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const items: ExtractedItem[] = [];
  for (const r of Array.isArray(raw.fields) ? raw.fields : []) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (!isFieldKey(o.key)) continue;
    const value = s(o.value);
    if (!value) continue;
    const page = typeof o.page === "number" && Number.isInteger(o.page) && o.page >= 1 && (!pageCount || o.page <= pageCount) ? o.page : null;
    let confidence: Confidence = o.confidence === "high" || o.confidence === "medium" ? o.confidence : "low";
    // A value with no page we can point to is not "high", however clear it seemed.
    if (page === null && confidence === "high") confidence = "medium";
    items.push({ key: o.key, value, page, quote: s(o.quote, 300), confidence });
  }
  return { documentKind: s(raw.document_kind, 200), documentDate: s(raw.document_date, 100), items };
}

export async function extractCaseParticulars(file: { mimeType: string; dataBase64: string }, pageCount: number | null): Promise<Extraction> {
  // Local testing only: a recorded model answer, never in production.
  const fixture = process.env.CLERK_EXTRACT_FIXTURE;
  if (fixture && process.env.NODE_ENV !== "production") {
    return shapeExtraction(JSON.parse(await readFile(fixture, "utf8")) as Raw, pageCount);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ExtractUnavailable("Reading case PDFs needs the Claude key on the server (ANTHROPIC_API_KEY).");

  const client = new Anthropic({ apiKey });
  const source =
    file.mimeType === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: file.dataBase64 } } as const)
      : ({ type: "image", source: { type: "base64", media_type: file.mimeType as "image/jpeg" | "image/png" | "image/webp", data: file.dataBase64 } } as const);

  const params = {
    model: EXTRACT_MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
    messages: [
      {
        role: "user",
        content: [source, { type: "text", text: `Fields to extract:\n${FIELD_GUIDE}\n\nStatus fields (${DATED_FIELDS.join(", ")}) are "as of" this document.` }],
      },
    ],
    // If Claude Opus 5.5 declines on a safety classifier, the API re-runs the
    // request on another Claude model inside the same call. The file still goes
    // only to Claude.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  };
  const response = await client.beta.messages.create(params as unknown as Parameters<typeof client.beta.messages.create>[0], { timeout: 280_000 }) as Anthropic.Beta.BetaMessage;

  if (response.stop_reason === "refusal") throw new Error("Claude declined to read this document.");
  if (response.stop_reason === "max_tokens") throw new Error("The document has more particulars than one reading can return.");
  const block = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text");
  if (!block) throw new Error("Claude returned no reading.");
  return shapeExtraction(JSON.parse(block.text) as Raw, pageCount);
}
