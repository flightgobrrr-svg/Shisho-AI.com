import { AlignmentType, BorderStyle, Document, Footer, Header, Packer, PageBreak, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { DRAFT_LABEL, fieldLabel, isFieldKey, type FieldKey } from "@/lib/clerkWork";

/**
 * The form engine for Advocate Clerk Work. Deterministic: the same blank form
 * and the same confirmed values always give the same document.
 *
 *  1. analyseBlankForm  finds every blank (dotted line, underscores, empty
 *     brackets) on a text-layer PDF, with its label, and proposes which case
 *     field belongs there. Blanks in signature, seal, attestation, order and
 *     court/registry-use areas are marked protected and are never filled.
 *  2. fillBlankForm     writes the confirmed values onto the ORIGINAL pages
 *     (same size, printed text untouched), shrinking to fit and moving
 *     anything still too long to a continuation sheet instead of overlapping.
 *  3. docketPdfPage / buildDocx  the office-prepared front or backside docket
 *     and the editable typed (clean) version.
 *
 * No signature, seal, stamp or court endorsement is ever drawn.
 */

export type MapTarget = FieldKey | "filing_date" | "document_name" | "blank";
export const isMapTarget = (v: unknown): v is MapTarget => v === "filing_date" || v === "document_name" || v === "blank" || isFieldKey(v);
export const targetLabel = (t: MapTarget) => (t === "filing_date" ? "Filing date" : t === "document_name" ? "Document name" : t === "blank" ? "Leave blank" : fieldLabel(t));

export type Placeholder = {
  id: string;
  page: number; // 1-based
  x: number;
  y: number; // baseline, PDF user space (origin bottom-left)
  width: number;
  size: number; // the line's font size
  label: string;
  after: string;
  protected: boolean;
  suggested: MapTarget;
  reason: string;
};

export type FormLine = { page: number; y: number; text: string; spans: { id: string; start: number; end: number }[] };

export type FormAnalysis = {
  pages: { width: number; height: number }[];
  placeholders: Placeholder[];
  lines: FormLine[];
  /** False for a scanned form with no text layer: its blanks cannot be located. */
  hasText: boolean;
  /** True when one of the pages is itself a docket. */
  hasDocket: boolean;
};

const BLANK_RE = /(\.{4,}|…{2,}|_{3,}|-{6,}|\(\s{3,}\)|\[\s{2,}\])/g;

/** Areas a clerk must never fill. Checked on the label, the text after, and the area heading. */
const PROTECTED_RE =
  /court\s*use|registry|office\s*use|official\s*use|for\s+office|\bseal\b|\border\b|signature|\bsigned\b|\bsign\b|accepted|identified|attest|witness|notary|before\s+me|judge|magistrate|thumb|\bstamp\b|endorse|received\s+by|counter\s*sign/i;
const ZONE_RE = /(for\s+)?(court|registry|office|official)\s+use|for\s+the\s+use\s+of\s+the\s+court|endorsement|\border\b\s*$/i;

type Rule = { re: RegExp; on: "label" | "after" | "both"; target: MapTarget; why: string };
/** First match wins, so the specific rules come before the general ones. */
const RULES: Rule[] = [
  { re: /\bcnr\b/i, on: "label", target: "cnr", why: "label says CNR" },
  { re: /enrol|roll\s*no|bar\s*council/i, on: "label", target: "advocate_enrolment", why: "label says enrolment" },
  { re: /(advocate|counsel|pleader).*(address|office)|(address|office).*(advocate|counsel)/i, on: "label", target: "advocate_address", why: "advocate's address" },
  { re: /\b(advocate|counsel|pleader)s?\s+for\s*(the)?\s*$/i, on: "label", target: "client_capacity", why: "whom the advocate appears for" },
  { re: /\b(sri|smt|advocate|counsel|pleader)s?\b\s*[:,]?\s*$|filed\s+by\s*:?\s*$/i, on: "label", target: "advocate_name", why: "label names the advocate" },
  { re: /in\s+the\s+court|court\s+of|before\s+the|tribunal|commission|forum/i, on: "label", target: "court_name", why: "court heading" },
  { re: /\b(filing|diary|sr)\s*(no|number)/i, on: "label", target: "filing_number", why: "filing / SR number" },
  { re: /\b(o\.?\s?s|c\.?\s?c|m\.?\s?c|w\.?\s?p|i\.?\s?a|e\.?\s?p|a\.?\s?s|o\.?\s?p|crl|c\.?m\.?a|c\.?r\.?p|suit|case|petition|appeal|application)\.?\s*(no|number)\.?\s*$/i, on: "label", target: "case_number", why: "case number" },
  { re: /\bno\.?\s*$/i, on: "label", target: "case_number", why: "a number after the case type" },
  { re: /\bof\s*(20)?\s*$|\byear\b/i, on: "label", target: "case_year", why: "year of the case" },
  { re: /petitioner|plaintiff|appellant|complainant|applicant/i, on: "after", target: "petitioner_side", why: "followed by the petitioner side" },
  { re: /respondent|defendant|accused|opposite\s+part/i, on: "after", target: "respondent_side", why: "followed by the respondent side" },
  { re: /\b(s|d|w)\s*\/\s*o\b|son\s+of|daughter\s+of|wife\s+of|father/i, on: "label", target: "client_parentage", why: "parentage" },
  { re: /\baged?\b/i, on: "label", target: "client_age", why: "age" },
  { re: /occupation|profession/i, on: "label", target: "client_occupation", why: "occupation" },
  { re: /resid|\br\s*\/\s*o\b|address/i, on: "label", target: "client_address", why: "address" },
  { re: /\bdated?\b|\bdate\b|day\s+of|\bthis\s*$/i, on: "label", target: "filing_date", why: "date" },
  { re: /\bplace\b|\bat\s*$/i, on: "label", target: "court_place", why: "place" },
  { re: /\bas\s*$|capacity|being\s+the/i, on: "label", target: "client_capacity", why: "procedural capacity" },
  { re: /\bi\s*\/\s*we\b|\bwe\b|\bi\b|undersigned|executant|\bname\b/i, on: "label", target: "client_name", why: "executant's name" },
];

export function suggestTarget(label: string, after: string, zone: string): { target: MapTarget; protected: boolean; reason: string } {
  if (PROTECTED_RE.test(label) || PROTECTED_RE.test(after) || ZONE_RE.test(zone)) {
    return { target: "blank", protected: true, reason: "signature, seal, attestation, order or court-use space" };
  }
  for (const r of RULES) {
    const hit = r.on === "label" ? r.re.test(label) : r.on === "after" ? r.re.test(after) : r.re.test(`${label} ${after}`);
    if (hit) return { target: r.target, protected: false, reason: r.why };
  }
  return { target: "blank", protected: false, reason: "no rule matched; choose the field or leave it blank" };
}

type Item = { str: string; x: number; y: number; w: number; h: number };

/**
 * Relative glyph widths, so a blank's position inside a text run is placed
 * where it is printed: "IN THE COURT OF ....." has wide capitals and narrow
 * dots, and spreading the run's width evenly put values over the label.
 */
async function glyphWidths(): Promise<(ch: string) => number> {
  const tmp = await PDFDocument.create();
  const helv = await tmp.embedFont(StandardFonts.Helvetica);
  const cache = new Map<string, number>();
  return (ch) => {
    let w = cache.get(ch);
    if (w === undefined) {
      try {
        w = helv.widthOfTextAtSize(ch, 1) || 0.5;
      } catch {
        w = 0.5;
      }
      cache.set(ch, w);
    }
    return w;
  };
}

export async function analyseBlankForm(pdf: Uint8Array): Promise<FormAnalysis> {
  const { getDocumentProxy } = await import("unpdf");
  const doc = await getDocumentProxy(new Uint8Array(pdf));
  const widthOf = await glyphWidths();
  const pages: FormAnalysis["pages"] = [];
  const placeholders: Placeholder[] = [];
  const lines: FormLine[] = [];
  let anyText = false;
  let hasDocket = false;

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const [x0, y0, x1, y1] = page.view;
    pages.push({ width: x1 - x0, height: y1 - y0 });
    const content = await page.getTextContent();
    const items: Item[] = [];
    for (const it of content.items as { str?: string; transform?: number[]; width?: number; height?: number }[]) {
      if (!it.str || !it.transform) continue;
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width ?? 0, h: Math.abs(it.height || it.transform[3] || 10) });
    }
    if (items.some((i) => i.str.trim())) anyText = true;

    // Group into lines by baseline, top to bottom.
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const groups: Item[][] = [];
    for (const it of items) {
      const g = groups.find((gr) => Math.abs(gr[0].y - it.y) < 2.5);
      if (g) g.push(it);
      else groups.push([it]);
    }

    let zone = "";
    let zoneY = Infinity;
    let index = 0;
    const pageText = groups.map((g) => g.map((i) => i.str).join(" ")).join("\n");
    if (/\bdocket\b|filed\s+by|filed\s+on\s+behalf/i.test(pageText)) hasDocket = true;

    for (const g of groups) {
      g.sort((a, b) => a.x - b.x);
      // Rebuild the line's text, remembering each character's x position.
      let text = "";
      const xs: number[] = [];
      let lastEnd = -Infinity;
      for (const it of g) {
        if (text && it.x - lastEnd > 1.5) {
          text += " ";
          xs.push(lastEnd);
        }
        const chars = [...it.str];
        const total = chars.reduce((n, ch) => n + widthOf(ch), 0) || 1;
        let run = 0;
        for (const ch of chars) {
          xs.push(it.x + (it.w * run) / total);
          run += widthOf(ch);
          // A character outside the BMP is two UTF-16 units in `text`; keep the index aligned.
          if (ch.length === 2) xs.push(it.x + (it.w * run) / total);
        }
        text += it.str;
        lastEnd = it.x + it.w;
      }
      xs.push(lastEnd);
      const y = g[0].y;
      const size = Math.max(...g.map((i) => i.h));

      // A court-use heading protects what follows it on this page (about ten lines).
      if (ZONE_RE.test(text)) {
        zone = text;
        zoneY = y;
      }
      const activeZone = zoneY - y < 160 ? zone : "";

      const line: FormLine = { page: p, y, text, spans: [] };
      let prevEnd = 0;
      for (const m of text.matchAll(BLANK_RE)) {
        const start = m.index ?? 0;
        const end = start + m[0].length;
        const label = text.slice(prevEnd, start).replace(/[:\s]+$/, "").trim();
        const nextBlank = text.slice(end).search(BLANK_RE);
        const after = text.slice(end, nextBlank === -1 ? undefined : end + nextBlank).trim();
        const s = suggestTarget(label, after, activeZone);
        const id = `p${p}-${++index}`;
        placeholders.push({
          id,
          page: p,
          x: xs[start] ?? g[0].x,
          y,
          width: Math.max(12, (xs[end] ?? lastEnd) - (xs[start] ?? g[0].x)),
          size,
          label: label.slice(-80),
          after: after.slice(0, 80),
          protected: s.protected,
          suggested: s.target,
          reason: s.reason,
        });
        line.spans.push({ id, start, end });
        prevEnd = end;
      }
      lines.push(line);
    }
  }
  return { pages, placeholders, lines, hasText: anyText, hasDocket };
}

/* ------------------------------------------------------------- filling */

export type Values = Partial<Record<MapTarget, string>>;
export type FillReport = {
  filled: { id: string; target: MapTarget; value: string; page: number }[];
  leftBlank: { id: string; page: number; label: string; why: string }[];
  continued: { note: number; id: string; target: MapTarget; value: string }[];
  unprintable: string[];
};

const ASCII_MAP: Record<string, string> = { "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "…": "...", " ": " ", "₹": "Rs." };

/** The standard PDF fonts only cover Latin text; anything else is reported, never silently dropped. */
export function printable(font: PDFFont, text: string, report: FillReport): string {
  let out = "";
  for (const ch of text.replace(/\s+/g, " ")) {
    const c = ASCII_MAP[ch] ?? ch;
    try {
      font.encodeText(c);
      out += c;
    } catch {
      out += "?";
      if (!report.unprintable.includes(ch)) report.unprintable.push(ch);
    }
  }
  return out;
}

export function wrap(font: PDFFont, text: string, size: number, width: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

export const GREY = rgb(0.45, 0.45, 0.45);
export const INK = rgb(0.05, 0.08, 0.25);

export function stampDraft(page: PDFPage, font: PDFFont) {
  const { height } = page.getSize();
  page.drawText(`${DRAFT_LABEL.toUpperCase()} - NOT FOR EXECUTION OR FILING`, { x: 18, y: height - 12, size: 6.5, font, color: GREY });
}

export async function fillBlankForm(
  blank: Uint8Array,
  analysis: FormAnalysis,
  mapping: Record<string, MapTarget>,
  values: Values,
  opts: { draft: boolean },
): Promise<{ doc: PDFDocument; report: FillReport }> {
  const doc = await PDFDocument.load(blank);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const pages = doc.getPages();
  const report: FillReport = { filled: [], leftBlank: [], continued: [], unprintable: [] };

  for (const ph of analysis.placeholders) {
    const target = ph.protected ? "blank" : (mapping[ph.id] ?? "blank");
    const raw = target === "blank" ? "" : (values[target] ?? "").trim();
    if (!raw) {
      report.leftBlank.push({ id: ph.id, page: ph.page, label: ph.label, why: ph.protected ? "protected area" : target === "blank" ? "left blank" : "no confirmed value" });
      continue;
    }
    const page = pages[ph.page - 1];
    if (!page) continue;
    const text = printable(font, raw, report);
    const maxSize = Math.min(11, Math.max(8, ph.size));
    let size = maxSize;
    // Never below 8 pt: anything that would need smaller type goes to the continuation sheet.
    while (size > 8 && font.widthOfTextAtSize(text, size) > ph.width - 2) size -= 0.5;
    if (font.widthOfTextAtSize(text, size) <= ph.width - 2) {
      page.drawText(text, { x: ph.x + 1, y: ph.y + 1.5, size, font, color: INK });
      report.filled.push({ id: ph.id, target, value: raw, page: ph.page });
    } else {
      const note = report.continued.length + 1;
      const ref = `(see continuation sheet, ${note})`;
      const refSize = font.widthOfTextAtSize(ref, 7) <= ph.width - 2 ? 7 : 6;
      page.drawText(font.widthOfTextAtSize(ref, refSize) <= ph.width - 2 ? ref : `(contd. ${note})`, { x: ph.x + 1, y: ph.y + 1.5, size: refSize, font, color: INK });
      report.continued.push({ note, id: ph.id, target, value: raw });
    }
  }

  if (report.continued.length) {
    const { width, height } = pages[0].getSize();
    let page = doc.addPage([width, height]);
    let y = height - 60;
    page.drawText("CONTINUATION SHEET", { x: 60, y, size: 12, font: bold });
    y -= 26;
    for (const c of report.continued) {
      const head = `${c.note}. ${targetLabel(c.target)}`;
      for (const [i, l] of [head, ...wrap(font, printable(font, c.value, report), 11, width - 140)].entries()) {
        if (y < 60) {
          page = doc.addPage([width, height]);
          y = height - 60;
        }
        page.drawText(l, { x: i === 0 ? 60 : 78, y, size: i === 0 ? 10.5 : 11, font: i === 0 ? bold : font, color: i === 0 ? rgb(0, 0, 0) : INK });
        y -= 15;
      }
      y -= 8;
    }
  }

  if (opts.draft) for (const p of doc.getPages()) stampDraft(p, font);
  return { doc, report };
}

/* -------------------------------------------------------------- dockets */

export type DocketData = {
  court: string;
  caseLine: string;
  shortTitle: [string, string, string, string]; // petitioner, their label, respondent, their label
  documentName: string;
  onBehalfOf: string;
  advocate: string;
  enrolment: string;
  address: string;
  date: string;
};

const firstLine = (s: string) => s.split(/\n|;/)[0].replace(/\s+/g, " ").trim();
const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
const SIDE_WORD = /(petitioner|plaintiff|appellant|complainant|applicant|respondent|defendant|accused|opposite part(y|ies))s?/i;

/** How each side is described: as the papers say, else as the case type implies, else petitioner / respondent. */
function sideLabels(values: Values): [string, string] {
  const fromText = (s: string) => s.match(SIDE_WORD)?.[0];
  const type = (values.case_type ?? "").toLowerCase().replace(/[\s.]/g, "");
  const byType: [string, string] | null =
    /^(os|suit|oss|cs)/.test(type) ? ["Plaintiff", "Defendant"]
    : /^(cc|sc|crl|prc|str)/.test(type) ? ["Complainant", "Accused"]
    : /^(as|ra|cma|fa|sa|crla|appeal)/.test(type) ? ["Appellant", "Respondent"]
    : null;
  const pet = fromText(values.petitioner_side ?? "") ?? byType?.[0] ?? "Petitioner";
  const res = fromText(values.respondent_side ?? "") ?? byType?.[1] ?? "Respondent";
  return [cap(pet), cap(res)];
}

/** "First named … and others": the docket's short cause title, from the confirmed sides. */
export function docketData(values: Values, documentName: string): DocketData {
  const v = (k: MapTarget) => (values[k] ?? "").trim();
  const pet = v("petitioner_side");
  const res = v("respondent_side");
  const short = (side: string) => {
    const first = firstLine(side).replace(/^\d+\.\s*/, "").replace(/,?\s*(s|d|w)\/o.*$/i, "");
    const many = /\n\s*2\.|\band\s+(another|others)\b|\b2\)/i.test(side);
    return first ? `${first}${many && !/and\s+(another|others)/i.test(first) ? " and others" : ""}` : "";
  };
  let p = short(pet);
  let r = short(res);
  if ((!p || !r) && v("cause_title")) {
    const [a, b] = v("cause_title").split(/\s+(?:vs?\.?|versus)\s+/i);
    p ||= firstLine(a ?? "");
    r ||= firstLine(b ?? "");
  }
  const type = v("case_type");
  const number = v("case_number");
  const year = v("case_year");
  const [petLabel, resLabel] = sideLabels(values);
  return {
    court: v("court_name"),
    caseLine: `${type || "_______"} No. ${number || "__________"} of ${year || "20____"}`,
    shortTitle: [p || "______________________", petLabel, r || "______________________", resLabel],
    documentName: documentName || "______________________",
    onBehalfOf: [v("client_name"), v("client_capacity")].filter(Boolean).join(", "),
    advocate: v("advocate_name"),
    enrolment: v("advocate_enrolment"),
    address: v("advocate_address"),
    // Shown the way papers write it: 14-11-2026.
    date: /^\d{4}-\d{2}-\d{2}$/.test(v("filing_date")) ? v("filing_date").split("-").reverse().join("-") : v("filing_date"),
  };
}

/**
 * Draws a docket on a new A4 page. Spaces for the registry and the advocate's
 * signature are drawn as empty boxes and lines; nothing is ever written in them.
 */
export async function docketPdfPage(doc: PDFDocument, d: DocketData, kind: "front" | "back", opts: { draft: boolean }) {
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage([595.28, 841.89]);
  const report: FillReport = { filled: [], leftBlank: [], continued: [], unprintable: [] };
  const W = 595.28;
  const colX = kind === "back" ? 300 : 80; // the backside docket sits on the outer half when folded
  const colW = kind === "back" ? 240 : W - 160;
  let y = 770;
  const put = (text: string, o: { size?: number; b?: boolean; center?: boolean; gap?: number } = {}) => {
    const size = o.size ?? 11;
    const f = o.b ? bold : font;
    for (const l of wrap(f, printable(f, text, report), size, colW)) {
      const x = o.center ? colX + (colW - f.widthOfTextAtSize(l, size)) / 2 : colX;
      page.drawText(l, { x, y, size, font: f, color: INK });
      y -= size + 4;
    }
    y -= o.gap ?? 6;
  };

  if (kind === "back") page.drawLine({ start: { x: 290, y: 800 }, end: { x: 290, y: 40 }, thickness: 0.5, color: GREY, dashArray: [3, 3] });
  put(d.court || "IN THE COURT OF ______________________", { b: true, center: true, size: 12 });
  put(d.caseLine, { center: true, gap: 14 });
  put(`${d.shortTitle[0]}`, { center: true, gap: 0 });
  put(`... ${d.shortTitle[1]}`, { center: true, size: 10, gap: 6 });
  put("Vs.", { center: true, gap: 6 });
  put(`${d.shortTitle[2]}`, { center: true, gap: 0 });
  put(`... ${d.shortTitle[3]}`, { center: true, size: 10, gap: 18 });
  page.drawLine({ start: { x: colX + colW * 0.2, y: y + 8 }, end: { x: colX + colW * 0.8, y: y + 8 }, thickness: 0.6, color: GREY });
  y -= 6;
  put(d.documentName.toUpperCase(), { b: true, center: true, size: 13, gap: 16 });
  if (d.onBehalfOf) put(`Filed on behalf of: ${d.onBehalfOf}`, { size: 10.5 });
  put("Filed by:", { size: 10.5, gap: 2 });
  put(d.advocate || "________________________", { b: true, gap: 2 });
  if (d.enrolment) put(`Enrolment No. ${d.enrolment}`, { size: 10 , gap: 2});
  if (d.address) put(d.address, { size: 10 });
  put(`Date: ${d.date || "______________"}`, { size: 10.5, gap: 22 });
  // The advocate signs here by hand; Shisho never draws a signature.
  page.drawLine({ start: { x: colX + colW - 150, y }, end: { x: colX + colW, y }, thickness: 0.5, color: GREY });
  y -= 12;
  page.drawText("Advocate", { x: colX + colW - 110, y, size: 9, font, color: GREY });
  y -= 30;
  const boxH = Math.max(90, Math.min(160, y - 60));
  page.drawRectangle({ x: colX, y: y - boxH, width: colW, height: boxH, borderColor: GREY, borderWidth: 0.6 });
  page.drawText("FOR REGISTRY / COURT USE", { x: colX + 8, y: y - 14, size: 8, font: bold, color: GREY });
  if (opts.draft) stampDraft(page, font);
  return report;
}

/* ------------------------------------------------------------- typed */

/** The blank form's own wording, line by line, with the confirmed values in place of the blanks. */
export function typedLines(analysis: FormAnalysis, mapping: Record<string, MapTarget>, values: Values): { page: number; text: string }[] {
  const byId = new Map(analysis.placeholders.map((p) => [p.id, p]));
  return analysis.lines.map((l) => {
    let out = "";
    let at = 0;
    for (const s of l.spans) {
      out += l.text.slice(at, s.start);
      const ph = byId.get(s.id);
      const t = ph && !ph.protected ? (mapping[s.id] ?? "blank") : "blank";
      const v = t === "blank" ? "" : (values[t] ?? "").trim();
      out += v ? ` ${v} ` : "______________";
      at = s.end;
    }
    out += l.text.slice(at);
    return { page: l.page, text: out.replace(/[ \t]+/g, " ").trim() };
  });
}

/** The office docket as Word paragraphs; the registry box and signature line stay empty. */
export function docketDocxChildren(kind: "front" | "back", x: DocketData): Paragraph[] {
  const p = (text: string, opt: { bold?: boolean; center?: boolean; size?: number; after?: number } = {}) =>
    new Paragraph({
      alignment: opt.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: opt.after ?? 120 },
      children: [new TextRun({ text, bold: opt.bold, size: (opt.size ?? 12) * 2, font: "Times New Roman" })],
    });
  return [
    p(kind === "back" ? "BACKSIDE DOCKET" : "FRONT DOCKET", { center: true, size: 9 }),
    p(x.court || "IN THE COURT OF ______________________", { bold: true, center: true, size: 13 }),
    p(x.caseLine, { center: true, after: 240 }),
    p(x.shortTitle[0], { center: true, after: 0 }),
    p(`... ${x.shortTitle[1]}`, { center: true }),
    p("Vs.", { center: true }),
    p(x.shortTitle[2], { center: true, after: 0 }),
    p(`... ${x.shortTitle[3]}`, { center: true, after: 300 }),
    p(x.documentName.toUpperCase(), { bold: true, center: true, size: 14, after: 300 }),
    ...(x.onBehalfOf ? [p(`Filed on behalf of: ${x.onBehalfOf}`)] : []),
    p("Filed by:", { after: 40 }),
    p(x.advocate || "________________________", { bold: true, after: 40 }),
    ...(x.enrolment ? [p(`Enrolment No. ${x.enrolment}`, { after: 40 })] : []),
    ...(x.address ? [p(x.address)] : []),
    p(`Date: ${x.date || "______________"}`, { after: 480 }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "________________________", font: "Times New Roman", size: 20 }), new TextRun({ text: "Advocate", break: 1, font: "Times New Roman", size: 20 })] }),
    new Paragraph({
      spacing: { before: 480 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "777777" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "777777" }, left: { style: BorderStyle.SINGLE, size: 6, color: "777777" }, right: { style: BorderStyle.SINGLE, size: 6, color: "777777" } },
      children: [new TextRun({ text: "FOR REGISTRY / COURT USE", bold: true, size: 16, color: "777777", font: "Times New Roman" }), new TextRun({ break: 6, text: "" })],
    }),
  ];
}

export async function buildDocx(o: { title: string; draft: boolean; typed: { page: number; text: string }[] | null; dockets: { kind: "front" | "back"; data: DocketData }[] }): Promise<Buffer> {
  const children: Paragraph[] = [];
  const p = (text: string, opt: { bold?: boolean; center?: boolean; size?: number; after?: number } = {}) =>
    new Paragraph({
      alignment: opt.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: opt.after ?? 120 },
      children: [new TextRun({ text, bold: opt.bold, size: (opt.size ?? 12) * 2, font: "Times New Roman" })],
    });

  if (o.typed) {
    let page = o.typed[0]?.page ?? 1;
    for (const l of o.typed) {
      if (l.page !== page) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
        page = l.page;
      }
      if (l.text) children.push(p(l.text));
    }
  }
  for (const [i, d] of o.dockets.entries()) {
    if (children.length || i > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...docketDocxChildren(d.kind, d.data));
  }

  const draftRun = (text: string) => new Paragraph({ children: [new TextRun({ text, size: 14, color: "777777", font: "Times New Roman" })] });
  const doc = new Document({
    title: o.title,
    creator: "Shisho AI",
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 } } },
        headers: o.draft ? { default: new Header({ children: [draftRun(`${DRAFT_LABEL.toUpperCase()} - NOT FOR EXECUTION OR FILING`)] }) } : undefined,
        footers: { default: new Footer({ children: [draftRun("Prepared with Shisho AI. Execution, identification, acceptance, attestation and court-use spaces are left blank.")] }) },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
