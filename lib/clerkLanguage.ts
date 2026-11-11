import Anthropic from "@anthropic-ai/sdk";
import type { PDFDocument } from "pdf-lib";
import { StandardFonts } from "pdf-lib";
import type { Block, ComposedDoc } from "@/lib/clerkDoc";
import type { OutputLanguage } from "@/lib/clerkWork";
import { ClerkError } from "@/lib/clerkCore";
import type { CauseStrings, Fonts } from "@/lib/clerkRender";
import { teluguFace } from "@/lib/clerkTelugu";

/**
 * Server-only. Telugu and bilingual output for the typed services.
 *
 * The English paper is composed first; every string on it (and the cause
 * title) is then translated in one call to Claude (client papers go to Claude
 * only), with names, addresses, case numbers, dates, article and enrolment
 * numbers and statutory citations kept exactly as written. The Telugu paper is
 * drawn with HarfBuzz-shaped Noto Sans Telugu. The translation is a draft for
 * the advocate to check line by line, and the report says so.
 */

export const TRANSLATE_MODEL = "claude-opus-5-5";

export type Translator = {
  mode: "te" | "bilingual";
  run: (doc: ComposedDoc, cause: CauseStrings) => Promise<{ doc: ComposedDoc; cause: CauseStrings; dictionary: Record<string, string> }>;
};

/** Fonts for a Telugu paper (Telugu and Latin in one shaped face). */
export async function teluguFonts(doc: PDFDocument): Promise<Fonts> {
  const regular = await teluguFace("regular");
  const bold = await teluguFace("bold");
  return { regular, bold, italic: regular, base: await doc.embedFont(StandardFonts.TimesRoman), docxFont: "Noto Sans Telugu" };
}

export const fontsFor = (lang: OutputLanguage) => (lang === "en" ? undefined : teluguFonts);

/** Every translatable string on a paper, in a fixed order, and a way to put translations back. */
function collect(doc: ComposedDoc, cause: CauseStrings) {
  const strings: string[] = [];
  const add = (s: string) => {
    if (s.trim()) strings.push(s);
    return s;
  };
  const causeKeys = ["heading", "place", "inLabel", "caseLine", "between", "pet", "petLabel", "and", "res", "resLabel", "placeLabel", "dateLabel"] as const;
  causeKeys.forEach((k) => add(cause[k]));
  add(doc.title);
  if (doc.subtitle) add(doc.subtitle);
  (doc.addressee ?? []).forEach(add);
  for (const b of doc.blocks) {
    if (b.type === "para" || b.type === "heading" || b.type === "note") add(b.text);
    else if (b.type === "lines") b.lines.forEach(add);
    else if (b.type === "kv") b.rows.forEach(([k, v]) => (add(k), add(v)));
    else if (b.type === "table") (b.columns.forEach(add), b.rows.forEach((r) => r.forEach(add)));
    else if (b.type === "space") add(b.label);
  }
  const unique = [...new Set(strings)];
  const rebuild = (map: Map<string, string>) => {
    const t = (s: string) => map.get(s) ?? s;
    const c = Object.fromEntries(causeKeys.map((k) => [k, t(cause[k])])) as CauseStrings;
    const blocks: Block[] = doc.blocks.map((b) => {
      switch (b.type) {
        case "para":
        case "heading":
        case "note":
          return { ...b, text: t(b.text) };
        case "lines":
          return { ...b, lines: b.lines.map(t) };
        case "kv":
          return { ...b, rows: b.rows.map(([k, v]) => [t(k), t(v)] as [string, string]) };
        case "table":
          return { ...b, columns: b.columns.map(t), rows: b.rows.map((r) => r.map(t)) };
        case "space":
          return { ...b, label: t(b.label) };
      }
    });
    return { doc: { ...doc, title: t(doc.title), subtitle: doc.subtitle ? t(doc.subtitle) : undefined, addressee: doc.addressee?.map(t), blocks }, cause: c };
  };
  return { unique, rebuild };
}

/** A translator over any string-translating function (Claude in production; tests pass their own). */
export function makeTranslator(mode: "te" | "bilingual", translateStrings: (s: string[]) => Promise<string[]>): Translator {
  return {
    mode,
    run: async (doc, cause) => {
      const { unique, rebuild } = collect(doc, cause);
      const out = await translateStrings(unique);
      if (out.length !== unique.length) throw new ClerkError(502, "The translation came back incomplete. Try again.");
      const pairs = unique.map((s, k) => [s, out[k] || s] as [string, string]);
      return { ...rebuild(new Map(pairs)), dictionary: Object.fromEntries(pairs) };
    },
  };
}

const SYSTEM = `You translate an Indian court paper prepared by an advocate's office from English into Telugu as used in the courts of Andhra Pradesh and Telangana.

Rules:
- Translate each input string into formal court Telugu. Return exactly one output string for each input string, in the same order.
- Keep EXACTLY as written, in English letters: personal names, addresses, place names, case numbers (e.g. "O.S. No. 125 of 2025"), CNR, filing / SR / article / enrolment / receipt numbers, dates, amounts, and statutory citations (sections, orders, rules, Acts). You may translate the words around them ("No.", "of", "dated").
- Do not add, drop or soften anything. Do not add legal provisions, facts, or prayers. Underscore blanks ("______") stay as they are.
- Short labels ("Between:", "AND", "Place", "Date", "DEPONENT", "Counsel for the Plaintiff") get their usual Telugu court equivalents.`;

async function claudeTranslate(strings: string[]): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClerkError(503, "Telugu output needs the Claude key on the server (ANTHROPIC_API_KEY).");
  const client = new Anthropic({ apiKey });
  const params = {
    model: TRANSLATE_MODEL,
    max_tokens: 32000,
    system: SYSTEM,
    output_config: { effort: "medium", format: { type: "json_schema", schema: { type: "object", additionalProperties: false, required: ["translations"], properties: { translations: { type: "array", items: { type: "string" } } } } } },
    messages: [{ role: "user", content: `Translate these ${strings.length} strings. Input (JSON array):\n${JSON.stringify(strings)}` }],
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  };
  const stream = client.beta.messages.stream(params as unknown as Parameters<typeof client.beta.messages.stream>[0], { timeout: 280_000 });
  const res = (await stream.finalMessage()) as Anthropic.Beta.BetaMessage;
  if (res.stop_reason === "refusal") throw new ClerkError(502, "Claude declined to translate this paper.");
  if (res.stop_reason === "max_tokens") throw new ClerkError(502, "The paper is too long to translate in one go.");
  const block = res.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text");
  if (!block) throw new ClerkError(502, "No translation came back.");
  const parsed = JSON.parse(block.text) as { translations?: unknown };
  return Array.isArray(parsed.translations) ? parsed.translations.map((x) => (typeof x === "string" ? x : "")) : [];
}

export const translateComposedHook = (lang: OutputLanguage): Translator | undefined => (lang === "en" ? undefined : makeTranslator(lang, claudeTranslate));

/** The translation a draft was made with, replayed exactly (approval must not re-translate). */
export const replayTranslator = (lang: OutputLanguage, dictionary: Record<string, string>): Translator | undefined =>
  lang === "en" ? undefined : makeTranslator(lang, async (strings) => strings.map((s) => dictionary[s] ?? s));
