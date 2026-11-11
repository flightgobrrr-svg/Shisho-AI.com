import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { FillReport } from "@/lib/clerkForms";
import { standardFace, type Face } from "@/lib/clerkRender";
import { MSN_TEMPLATE_BASE64 } from "@/lib/msnTemplate";

/**
 * The MSN house format for downloaded drafts (Word and PDF).
 *
 * The layout follows the firm's DRT application exactly: court heading and
 * case number centred and bold; "Between" bold; party descriptions left, with
 * the "... Applicant" label on its own line; "And" centred bold; the short
 * cause title with "Versus" centred; capitals headings centred and bold; a
 * line ending in a colon as a section heading; numbered and other paragraphs
 * justified; DEPONENT bold; each new "BEFORE THE … / IN THE …" heading after
 * the first starts a new page. Times New Roman 12, the template's A4 margins,
 * page numbers centred at the foot.
 *
 * The words are never changed: every character of the input appears, in
 * order, in the output; only line breaks, spacing and emphasis are applied.
 */

export type MsnKind = "court" | "center_b" | "center" | "both_b" | "both" | "heading" | "party" | "split" | "lines";
/**
 * `party`: text, then the "... Applicant" label on its own line. `split`: text at the left margin, label at the
 * right ("Place: …  Date: …"). `lines`: one paragraph, a line break at each "\n" (a schedule's boundaries).
 */
export type MsnBlock = { kind: MsnKind; text: string; label?: string; pageBreak?: boolean };

const SIDE = String.raw`(?:the\s+)?(?:Applicant|Respondent|Petitioner|Plaintiff|Defendant|Appellant|Complainant|Accused|Claimant|Deponent|Opposite Part(?:y|ies))s?`;
const PARTY_LABEL = new RegExp(String.raw`^(.*\S)\s*(\.{2,}\s*${SIDE}\b.*)$`, "i");
const COURT = /^(BEFORE|IN)\s+THE\s+.*(COURT|TRIBUNAL|COMMISSION|FORUM|AUTHORITY|BOARD|JUDGE|MAGISTRATE)/;
const CASE_NO = /^((?:[A-Z]{1,6}\.?\s?){1,4}(?:\(\w+\)\s*)?)No\.?\s*[_\d]/;
const SIGN = new RegExp(String.raw`^(Counsel for .+?)\s+(${SIDE})$`, "i");
/** Labels that open a section of their own ("Main Prayer for Declaration: …"). */
const SECTION_LABEL = /prayer|relief|particulars|facts|grounds|jurisdiction|limitation|schedule|cause of action/i;
/** Single capitals words that head a section when the text runs straight on ("VERIFICATION I, …"). */
const CAPS_WORD = /^(VERIFICATION|SCHEDULE|PRAYER|AFFIDAVIT|MEMO|SYNOPSIS|ANNEXURE|INDEX)\s+(\S.*)$/;
const isCaps = (s: string) => /[A-Z]/.test(s) && s === s.toUpperCase() && s.replace(/[^A-Za-z]/g, "").length >= 3;

/** Lines of a draft, each classified. A line may become several blocks; no character is added or dropped. */
export function classify(text: string): MsnBlock[] {
  const out: MsnBlock[] = [];
  let courts = 0;
  let prev: MsnKind | null = null;
  const push = (b: MsnBlock) => {
    out.push(b);
    prev = b.kind;
  };
  // A document title: centred bold on the first paper, a section heading on the papers after it (as in the DRT set).
  const title = (line: string) => {
    const pageBreak = /^LIST OF\b/.test(line) && out.length > 0 && prev !== "court";
    push({ kind: courts >= 2 || pageBreak ? "heading" : "center_b", text: line, pageBreak });
  };
  const labelled = (label: string, rest: string) => {
    push({ kind: "heading", text: label });
    // "(i) … (ii) …" run together: one paragraph each.
    for (const part of rest.split(/\s+(?=\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)\s)/)) body(part);
  };
  // A schedule's boundaries ("bounded by: East: … West: …") go below it, one side to a line.
  const body = (line: string) => {
    const b = line.match(/^(.*?\bbounded (?:by|as follows)\s*:?)\s+(East\s*:.*)$/i);
    if (!b) return push({ kind: "both", text: line });
    push({ kind: "both", text: b[1] });
    push({ kind: "lines", text: b[2].split(/\s+(?=(?:West|North|South)\s*:)/).join("\n") });
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (COURT.test(line) && isCaps(line.replace(/[^A-Za-z ]/g, ""))) {
      push({ kind: "court", text: line, pageBreak: courts > 0 });
      courts++;
      continue;
    }
    if ((prev === "court" || prev === "center_b") && line.length <= 90 && CASE_NO.test(line)) {
      push({ kind: "center_b", text: line });
      continue;
    }
    if (/^between:?$/i.test(line)) {
      push({ kind: "both_b", text: line });
      continue;
    }
    if (/^(and|versus|vs\.?|v\/s\.?)$/i.test(line)) {
      push({ kind: /^and$/i.test(line) ? "center_b" : "center", text: line });
      continue;
    }
    if (/^deponent$/i.test(line)) {
      push({ kind: "both_b", text: line });
      continue;
    }
    // The short cause title on one line: "X ... Applicant Versus Y ... Respondents".
    const sc = line.match(/^(.+?\.{2,}\s*\S.*?)\s+(Versus|Vs\.?)\s+(.+\.{2,}.*)$/);
    if (sc) {
      for (const [k, side] of [[0, sc[1]], [1, sc[2]], [2, sc[3]]] as const) {
        const m = k === 1 ? null : side.match(/^(.*?\S)\s*(\.{2,}.*)$/);
        push(m ? { kind: "split", text: m[1], label: m[2] } : { kind: "center", text: side });
      }
      continue;
    }
    const party = line.match(PARTY_LABEL);
    if (party && party[1].length > 25) {
      push({ kind: "party", text: party[1], label: party[2] });
      continue;
    }
    const placeDate = line.match(/^(Place:\s*.*?\S)\s+(Date:.*)$/i);
    if (placeDate) {
      push({ kind: "split", text: placeDate[1], label: placeDate[2] });
      continue;
    }
    const sign = line.match(SIGN);
    if (sign) {
      push({ kind: "split", text: sign[1], label: sign[2] });
      continue;
    }
    if (line.length <= 90 && /:$/.test(line) && !/^\d/.test(line)) {
      push({ kind: "heading", text: line });
      continue;
    }
    if (isCaps(line) && line.length <= 160 && !/^\d+\./.test(line)) {
      title(line);
      continue;
    }
    // A capitals title with its provision run on: "PETITION FOR … Under Sections …".
    const under = line.match(/^([A-Z][A-Z0-9 ,.&()'’/-]+[A-Z)])\s+(Under\s.*|U\/s\.?\s.*)$/);
    if (under && under[1].split(/\s+/).length >= 2) {
      title(under[1]);
      push({ kind: prev === "heading" ? "both" : "center_b", text: under[2] });
      continue;
    }
    const capsWord = line.match(CAPS_WORD);
    if (capsWord) {
      labelled(capsWord[1], capsWord[2]);
      continue;
    }
    const schedule = line.match(/^(Schedule of (?:the )?Propert(?:y|ies))\s+(\S.*)$/i);
    if (schedule) {
      labelled(schedule[1], schedule[2]);
      continue;
    }
    const lab = line.match(/^([A-Z][^:.\d]{1,60}:)\s+(\S.*)$/);
    if (lab && lab[1].split(/\s+/).length <= 7 && SECTION_LABEL.test(lab[1])) {
      labelled(lab[1], lab[2]);
      continue;
    }
    body(line);
  }
  return out;
}

/* ------------------------------------------------------------------ docx */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (s: string) => `<w:t xml:space="preserve">${esc(s)}</w:t>`;

function para(b: MsnBlock): string {
  const pb = b.pageBreak ? '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' : "";
  if (b.kind === "heading") return `${pb}<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r>${t(b.text)}</w:r></w:p>`;
  const jc = b.kind === "court" || b.kind === "center_b" || b.kind === "center" ? "center" : b.kind === "party" ? "left" : "both";
  const bold = b.kind === "court" || b.kind === "center_b" || b.kind === "both_b";
  const rpr = bold ? "<w:rPr><w:b/></w:rPr>" : '<w:rPr><w:b w:val="0"/></w:rPr>';
  if (b.kind === "lines") return `${pb}<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r>${rpr}${b.text.split("\n").map(t).join("<w:br/>")}</w:r></w:p>`;
  if (b.kind === "party") return `${pb}<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r>${rpr}${t(b.text)}<w:br/>${t(b.label ?? "")}</w:r></w:p>`;
  // The template's text width (11952 − 1656 − 1224 twips): the label sits against the right margin.
  if (b.kind === "split") return `${pb}<w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9072"/></w:tabs><w:jc w:val="left"/></w:pPr><w:r>${rpr}${t(b.text)}<w:tab/>${t(b.label ?? "")}</w:r></w:p>`;
  return `${pb}<w:p><w:pPr><w:jc w:val="${jc}"/></w:pPr><w:r>${rpr}${t(b.text)}</w:r></w:p>`;
}

export async function msnDocx(blocks: MsnBlock[], opts: { telugu?: boolean } = {}): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(Buffer.from(MSN_TEMPLATE_BASE64, "base64"));
  const doc = await zip.file("word/document.xml")!.async("string");
  let body = blocks.map(para).join("");
  // Telugu text needs a Telugu-capable font in Word; the template's Times New Roman has none.
  if (opts.telugu) body = body.replace(/<w:r>(<w:rPr>)?/g, (_m, rp) => (rp ? '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Noto Sans Telugu"/>' : '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Noto Sans Telugu"/></w:rPr>'));
  zip.file("word/document.xml", doc.replace("{{BODY}}", body));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/* ------------------------------------------------------------------- pdf */

// The template's page: 11952 × 16848 twips, margins T/B 1152, L 1656, R 1224 (twips ÷ 20 = points).
const PAGE: [number, number] = [597.6, 842.4];
const M = { top: 57.6, bottom: 57.6, left: 82.8, right: 61.2 };
const WIDTH = PAGE[0] - M.left - M.right;
const SIZE = 12;
const LEAD = 16.5; // Normal: line 283/240 of single
const AFTER = 7; // Normal: 140 twips after
const INK = rgb(0, 0, 0);

export type MsnFonts = { regular: Face; bold: Face; base: PDFFont };

/** Times, keeping curly quotes and dashes as typed (Times has them); only a character Times lacks is substituted. */
function timesFace(font: PDFFont): Face {
  const face = standardFace(font);
  return {
    ...face,
    clean: (text, report) =>
      [...text.replace(/\s+/g, " ")]
        .map((ch) => {
          try {
            font.encodeText(ch);
            return ch;
          } catch {
            return face.clean(ch, report);
          }
        })
        .join(""),
  };
}

export async function msnStandardFonts(doc: PDFDocument): Promise<MsnFonts> {
  const base = await doc.embedFont(StandardFonts.TimesRoman);
  return { regular: timesFace(base), bold: timesFace(await doc.embedFont(StandardFonts.TimesRomanBold)), base };
}

/** `fonts` makes the faces for the document (e.g. teluguFonts for Telugu text); Times by default. */
export async function msnPdf(blocks: MsnBlock[], fonts: (doc: PDFDocument) => Promise<MsnFonts> = msnStandardFonts): Promise<{ pdf: Uint8Array; report: FillReport }> {
  const doc = await PDFDocument.create();
  const f = await fonts(doc);
  const report: FillReport = { filled: [], leftBlank: [], continued: [], unprintable: [] };
  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;
  const newPage = () => {
    page = doc.addPage(PAGE);
    pages.push(page);
    y = PAGE[1] - M.top;
  };
  newPage();

  type Run = { text: string; face: Face };
  /** Words with their faces, wrapped to the width; each line keeps its words for justification. */
  const wrap = (runs: Run[]) => {
    const words: Run[] = [];
    for (const r of runs) for (const w of r.face.clean(r.text, report).split(" ").filter(Boolean)) words.push({ text: w, face: r.face });
    const lines: Run[][] = [];
    let cur: Run[] = [];
    let width = 0;
    const space = f.regular.width(" ", SIZE);
    for (const w of words) {
      const ww = w.face.width(w.text, SIZE);
      if (cur.length && width + space + ww > WIDTH) {
        lines.push(cur);
        cur = [];
        width = 0;
      }
      width += (cur.length ? space : 0) + ww;
      cur.push(w);
    }
    if (cur.length) lines.push(cur);
    return lines;
  };
  const draw = (line: Run[], align: "left" | "center" | "both", last: boolean) => {
    if (y - LEAD < M.bottom) newPage();
    const space = f.regular.width(" ", SIZE);
    const natural = line.reduce((n, w) => n + w.face.width(w.text, SIZE), 0) + space * (line.length - 1);
    let x = align === "center" ? M.left + (WIDTH - natural) / 2 : M.left;
    const gap = align === "both" && !last && line.length > 1 ? space + (WIDTH - natural) / (line.length - 1) : space;
    for (const w of line) {
      w.face.draw(page, w.text, x, y - SIZE, SIZE, INK);
      x += w.face.width(w.text, SIZE) + gap;
    }
    y -= LEAD;
  };
  const paragraph = (runs: Run[], align: "left" | "center" | "both") => {
    const lines = wrap(runs);
    lines.forEach((l, k) => draw(l, align, k === lines.length - 1));
  };

  for (const b of blocks) {
    if (b.pageBreak) newPage();
    switch (b.kind) {
      case "court":
      case "center_b":
        paragraph([{ text: b.text, face: f.bold }], "center");
        break;
      case "center":
        paragraph([{ text: b.text, face: f.regular }], "center");
        break;
      case "both_b":
        paragraph([{ text: b.text, face: f.bold }], "left");
        break;
      case "heading":
        y -= Math.min(14, Math.max(0, y - M.bottom - LEAD * 3));
        paragraph([{ text: b.text, face: f.bold }], "left");
        break;
      case "party":
        paragraph([{ text: b.text, face: f.regular }], "left");
        paragraph([{ text: b.label ?? "", face: f.regular }], "left");
        break;
      case "split": {
        const left = f.regular.clean(b.text, report);
        const right = f.regular.clean(b.label ?? "", report);
        const rw = f.regular.width(right, SIZE);
        if (f.regular.width(left, SIZE) + rw + 18 > WIDTH) {
          paragraph([{ text: b.text, face: f.regular }], "left");
          paragraph([{ text: b.label ?? "", face: f.regular }], "left");
          break;
        }
        if (y - LEAD < M.bottom) newPage();
        f.regular.draw(page, left, M.left, y - SIZE, SIZE, INK);
        f.regular.draw(page, right, M.left + WIDTH - rw, y - SIZE, SIZE, INK);
        y -= LEAD;
        break;
      }
      case "lines":
        for (const l of b.text.split("\n")) paragraph([{ text: l, face: f.regular }], "left");
        break;
      default:
        paragraph([{ text: b.text, face: f.regular }], "both");
    }
    y -= AFTER;
  }

  pages.forEach((p, k) => {
    const label = String(k + 1);
    p.drawText(label, { x: PAGE[0] / 2 - f.base.widthOfTextAtSize(label, 10) / 2, y: 30, size: 10, font: f.base, color: INK });
  });
  return { pdf: await doc.save(), report };
}

/** Every character of `text` (ignoring whitespace) appears in the blocks, in order: nothing added, dropped or changed. */
export function sameText(text: string, blocks: MsnBlock[]): boolean {
  const a = text.replace(/\s+/g, "");
  const b = blocks.map((x) => (x.kind === "party" || x.kind === "split" ? `${x.text}${x.label}` : x.text)).join("").replace(/\s+/g, "");
  return a === b;
}
