import { AlignmentType, BorderStyle, Document, Footer, Header, Packer, PageBreak, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import type { Block, ComposedDoc } from "@/lib/clerkDoc";
import { DRAFT_LABEL } from "@/lib/clerkWork";
import { GREY, INK, docketData, printable, stampDraft, type FillReport, type Values } from "@/lib/clerkForms";

/**
 * Renders a composed clerk-work paper (lib/clerkDoc.ts) as an A4 PDF and an
 * editable Word file with the same content: the court heading and cause
 * title, numbered paragraphs, tables that run across pages with their header
 * repeated, and blank spaces for every signature, acceptance and attestation.
 * Nothing is ever written in those spaces.
 *
 * Text goes through a `Face`: the standard PDF fonts for English, or the
 * HarfBuzz-shaped Telugu face (lib/clerkTelugu.ts) for Telugu output.
 */

export type Face = {
  width(text: string, size: number): number;
  draw(page: PDFPage, text: string, x: number, y: number, size: number, color: RGB): void;
  /** Text made safe for this face; characters it cannot print are reported. */
  clean(text: string, report: FillReport): string;
};
export type Fonts = { regular: Face; bold: Face; italic: Face; /** For the draft label and page numbers. */ base: PDFFont; /** Word's font name. */ docxFont: string };

/** The cause title's words, so a translated paper can carry its own. */
export type CauseStrings = { heading: string; place: string; inLabel: string; caseLine: string; between: string; pet: string; petLabel: string; and: string; res: string; resLabel: string; placeLabel: string; dateLabel: string };

export function standardFace(font: PDFFont): Face {
  return {
    width: (t, size) => font.widthOfTextAtSize(t, size),
    draw: (page, t, x, y, size, color) => page.drawText(t, { x, y, size, font, color }),
    clean: (t, report) => printable(font, t, report),
  };
}

const A4: [number, number] = [595.28, 841.89];
const LEFT = 72;
const RIGHT = 54;
const TOP = 64;
const BOTTOM = 64;
const WIDTH = A4[0] - LEFT - RIGHT;
const SIZE = 12;
const LEAD = 18;

/** "IN THE COURT OF THE II ADDITIONAL SENIOR CIVIL JUDGE, GUNTUR" from however the court name was recorded. */
export function courtHeading(name: string): string {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) return "IN THE COURT OF ______________________";
  if (/^(in the|before the|before)\b/i.test(n)) return n.toUpperCase();
  if (/^court of\b/i.test(n)) return `IN THE ${n.toUpperCase()}`;
  if (/high court|supreme court|tribunal|commission|forum|board|authority/i.test(n)) return `${/tribunal|commission|forum|board|authority/i.test(n) ? "BEFORE THE" : "IN THE"} ${n.toUpperCase()}`;
  return `IN THE COURT OF THE ${n.toUpperCase()}`;
}

const showIso = (iso: string | undefined) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("-") : iso || "");

/** The English cause title for these particulars. */
export function causeStrings(v: Values): CauseStrings {
  const d = docketData(v, "");
  const full = (raw: string | undefined, short: string) => (raw?.trim() ? raw.trim().replace(/\s*\.{2,}\s*(petitioner|plaintiff|appellant|complainant|applicant|respondent|defendant|accused|opposite part\w*)s?\.?\s*$/i, "") : short);
  const place = v.court_place?.trim() && !(v.court_name ?? "").toLowerCase().includes(v.court_place.trim().toLowerCase()) ? `AT ${v.court_place.trim().toUpperCase()}` : "";
  return { heading: courtHeading(v.court_name ?? ""), place, inLabel: "IN", caseLine: d.caseLine, between: "Between:", pet: full(v.petitioner_side, d.shortTitle[0]), petLabel: d.shortTitle[1], and: "AND", res: full(v.respondent_side, d.shortTitle[2]), resLabel: d.shortTitle[3], placeLabel: "Place", dateLabel: "Date" };
}

class Writer {
  page!: PDFPage;
  y = 0;
  pages: PDFPage[] = [];
  report: FillReport = { filled: [], leftBlank: [], continued: [], unprintable: [] };
  doc: PDFDocument;
  f: Fonts;
  constructor(doc: PDFDocument, f: Fonts) {
    this.doc = doc;
    this.f = f;
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage(A4);
    this.pages.push(this.page);
    this.y = A4[1] - TOP;
  }
  need(h: number) {
    if (this.y - h < BOTTOM) this.newPage();
  }
  wrap(s: string, face: Face, size: number, width: number) {
    const words = face.clean(s, this.report).split(" ");
    const out: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (face.width(next, size) <= width || !line) line = next;
      else {
        out.push(line);
        line = w;
      }
    }
    if (line) out.push(line);
    // A single word wider than the column is broken by characters.
    return out.flatMap((l) => {
      if (face.width(l, size) <= width) return [l];
      const parts: string[] = [];
      let cur = "";
      for (const ch of l) {
        if (face.width(cur + ch, size) > width && cur) {
          parts.push(cur);
          cur = ch;
        } else cur += ch;
      }
      return cur ? [...parts, cur] : parts;
    });
  }
  lines(ls: string[], o: { face?: Face; size?: number; x?: number; width?: number; align?: "left" | "center" | "right"; lead?: number; color?: RGB }) {
    const face = o.face ?? this.f.regular;
    const size = o.size ?? SIZE;
    const lead = o.lead ?? LEAD;
    const x0 = o.x ?? LEFT;
    const w = o.width ?? WIDTH;
    for (const l of ls) {
      this.need(lead);
      const lw = face.width(l, size);
      const x = o.align === "center" ? x0 + (w - lw) / 2 : o.align === "right" ? x0 + w - lw : x0;
      face.draw(this.page, l, x, this.y - size, size, o.color ?? INK);
      this.y -= lead;
    }
  }
  para(s: string, o: Parameters<Writer["lines"]>[1] = {}) {
    this.lines(this.wrap(s, o.face ?? this.f.regular, o.size ?? SIZE, o.width ?? WIDTH), o);
  }
  gap(h: number) {
    this.y -= h;
  }
}

function causeTitle(w: Writer, cs: CauseStrings, inProceeding: string) {
  w.para(cs.heading, { face: w.f.bold, align: "center", size: 12.5 });
  if (cs.place) w.para(cs.place, { face: w.f.bold, align: "center" });
  w.gap(6);
  if (inProceeding) {
    w.para(inProceeding, { face: w.f.bold, align: "center" });
    w.para(cs.inLabel, { align: "center" });
  }
  w.para(cs.caseLine, { face: w.f.bold, align: "center" });
  w.gap(10);
  w.para(cs.between, {});
  const side = (text: string, label: string) => {
    w.lines(w.wrap(text, w.f.regular, SIZE, WIDTH - 110), { x: LEFT + 20, width: WIDTH - 110 });
    w.y += LEAD;
    w.lines([`... ${label}`], { align: "right" });
  };
  side(cs.pet, cs.petLabel);
  w.para(cs.and, { align: "center", face: w.f.bold });
  side(cs.res, cs.resLabel);
  w.gap(12);
}

function table(w: Writer, columns: string[], body: string[][], widths?: number[]) {
  const n = columns.length;
  const weights = widths && widths.length === n ? widths : columns.map((c, k) => (k === 0 && /s\.?\s?no/i.test(c) ? 0.6 : Math.max(1, Math.min(4, Math.max(c.length, ...body.map((r) => (r[k] ?? "").length)) / 12))));
  const total = weights.reduce((a, b) => a + b, 0);
  const cw = weights.map((x) => (x / total) * WIDTH);
  const size = n > 5 ? 9 : 10;
  const lead = size + 3;
  const pad = 3;
  const drawRow = (cells: string[], bold: boolean) => {
    const face = bold ? w.f.bold : w.f.regular;
    const wrapped = cells.map((c, k) => w.wrap(c || "", face, size, cw[k] - pad * 2));
    const h = Math.max(1, ...wrapped.map((l) => l.length)) * lead + pad * 2;
    if (w.y - h < BOTTOM) {
      w.newPage();
      if (!bold) drawRow(columns, true);
    }
    let x = LEFT;
    for (let k = 0; k < n; k++) {
      w.page.drawRectangle({ x, y: w.y - h, width: cw[k], height: h, borderColor: GREY, borderWidth: 0.5, color: bold ? rgb(0.94, 0.94, 0.92) : undefined });
      wrapped[k].forEach((l, j) => face.draw(w.page, l, x + pad, w.y - pad - size - j * lead + 1, size, INK));
      x += cw[k];
    }
    w.y -= h;
  };
  drawRow(columns, true);
  for (const r of body) drawRow(columns.map((_, k) => r[k] ?? ""), false);
  w.gap(10);
}

function block(w: Writer, b: Block, counter: { n: number }) {
  switch (b.type) {
    case "heading":
      w.gap(4);
      w.para(b.text, { face: w.f.bold, align: "center" });
      w.gap(4);
      return;
    case "para": {
      if (b.numbered) {
        counter.n += 1;
        const body = w.wrap(b.text, w.f.regular, SIZE, WIDTH - 28);
        w.need(LEAD);
        w.f.regular.draw(w.page, `${counter.n}.`, LEFT, w.y - SIZE, SIZE, INK);
        w.lines(body, { x: LEFT + 28, width: WIDTH - 28 });
      } else {
        w.para(b.text, { x: b.indent ? LEFT + 28 : LEFT, width: b.indent ? WIDTH - 28 : WIDTH });
      }
      w.gap(6);
      return;
    }
    case "lines":
      w.lines(b.lines.flatMap((l) => w.wrap(l, w.f.regular, SIZE, WIDTH - 60)), { x: LEFT + 60, width: WIDTH - 60 });
      w.gap(8);
      return;
    case "kv":
      for (const [k, v] of b.rows) {
        const lw = WIDTH * 0.32;
        const kl = w.wrap(k, w.f.bold, 10.5, lw - 8);
        const vl = w.wrap(v || "—", w.f.regular, 10.5, WIDTH - lw);
        const h = Math.max(kl.length, vl.length) * 15;
        w.need(h);
        kl.forEach((l, j) => w.f.bold.draw(w.page, l, LEFT, w.y - 10.5 - j * 15, 10.5, INK));
        vl.forEach((l, j) => w.f.regular.draw(w.page, l, LEFT + lw, w.y - 10.5 - j * 15, 10.5, INK));
        w.y -= h + 3;
      }
      w.gap(8);
      return;
    case "table":
      table(w, b.columns, b.rows, b.widths);
      return;
    case "note":
      w.para(b.text, { face: w.f.italic, size: 10, lead: 14, color: GREY });
      w.gap(4);
      return;
    case "space": {
      const h = b.height ?? 46;
      w.need(h + 20);
      const boxW = b.height ? WIDTH * 0.6 : 190;
      const x = b.align === "left" ? LEFT : LEFT + WIDTH - boxW;
      if (b.height) {
        w.page.drawRectangle({ x, y: w.y - h, width: boxW, height: h, borderColor: GREY, borderWidth: 0.5, borderDashArray: [3, 3] });
        w.f.italic.draw(w.page, w.f.italic.clean(b.label, w.report), x + 6, w.y - 12, 9, GREY);
        w.y -= h + 10;
      } else {
        // A line for the hand, with the label beneath it.
        w.y -= h - 10;
        w.page.drawLine({ start: { x, y: w.y }, end: { x: x + boxW, y: w.y }, thickness: 0.5, color: GREY });
        w.f.regular.draw(w.page, w.f.regular.clean(b.label, w.report), x, w.y - 13, 10, INK);
        w.y -= 24;
      }
      return;
    }
  }
}

export async function standardFonts(doc: PDFDocument): Promise<Fonts> {
  const regular = await doc.embedFont(StandardFonts.TimesRoman);
  return {
    regular: standardFace(regular),
    bold: standardFace(await doc.embedFont(StandardFonts.TimesRomanBold)),
    italic: standardFace(await doc.embedFont(StandardFonts.TimesRomanItalic)),
    base: regular,
    docxFont: "Times New Roman",
  };
}

/** Writes the paper into `doc` (new pages at the end). Returns characters the font could not print. */
export async function renderComposedPdf(doc: PDFDocument, c: ComposedDoc, v: Values, o: { draft: boolean; inProceeding?: string; fonts?: Fonts; cause?: CauseStrings }): Promise<FillReport> {
  const fonts = o.fonts ?? (await standardFonts(doc));
  const cs = o.cause ?? causeStrings(v);
  const w = new Writer(doc, fonts);
  const firstPage = w.pages.length - 1;
  if (c.addressee?.length) {
    w.lines(c.addressee.flatMap((l) => w.wrap(l, fonts.regular, SIZE, WIDTH)), {});
    w.gap(10);
  }
  if (c.causeTitle) causeTitle(w, cs, o.inProceeding ?? "");
  // An exported draft carries no added title: the text is printed as it is.
  if (c.title) {
    w.para(c.title, { face: fonts.bold, align: "center", size: 13 });
    if (c.subtitle) w.para(c.subtitle, { face: fonts.italic, align: "center", size: 11 });
    w.gap(10);
  }

  // Place and date go just before the closing signature spaces.
  let tail = c.blocks.length;
  while (tail > 0 && c.blocks[tail - 1].type === "space") tail--;
  const counter = { n: 0 };
  c.blocks.slice(0, tail).forEach((b) => block(w, b, counter));
  if (c.placeDate) {
    w.gap(6);
    w.lines([`${cs.placeLabel}: ${v.court_place?.trim() || "______________"}`, `${cs.dateLabel}: ${showIso(v.filing_date) || "______________"}`], {});
  }
  c.blocks.slice(tail).forEach((b) => block(w, b, counter));

  const mine = w.pages.slice(firstPage);
  const total = mine.length;
  mine.forEach((p, k) => {
    if (total > 1) {
      const label = `Page ${k + 1} of ${total}`;
      p.drawText(label, { x: A4[0] - RIGHT - fonts.base.widthOfTextAtSize(label, 8), y: 30, size: 8, font: fonts.base, color: GREY });
    }
    if (o.draft) stampDraft(p, fonts.base);
  });
  return w.report;
}

/* -------------------------------------------------------------- docx */

export function composedDocxChildren(c: ComposedDoc, v: Values, o: { inProceeding?: string; cause?: CauseStrings; font?: string }): (Paragraph | Table)[] {
  const font = o.font ?? "Times New Roman";
  const run = (text: string, r: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) => new TextRun({ text, bold: r.bold, italics: r.italics, size: (r.size ?? 12) * 2, color: r.color, font });
  const para = (children: TextRun[], p: { align?: "left" | "center" | "right"; after?: number; indent?: number; hanging?: number } = {}) =>
    new Paragraph({
      alignment: p.align === "center" ? AlignmentType.CENTER : p.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: p.after ?? 120, line: 360 },
      indent: p.indent || p.hanging ? { left: p.indent ?? 0, hanging: p.hanging } : undefined,
      children,
    });
  const cell = (text: string, bold = false) => new TableCell({ children: [new Paragraph({ children: [run(text, { bold, size: 10 })] })], margins: { top: 60, bottom: 60, left: 80, right: 80 } });
  const grid = (columns: string[], body: string[][]) =>
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: columns.map((x) => cell(x, true)) }), ...body.map((r) => new TableRow({ children: columns.map((_, k) => cell(r[k] ?? "")) }))] });

  const cs = o.cause ?? causeStrings(v);
  const out: (Paragraph | Table)[] = [];
  if (c.addressee?.length) {
    for (const l of c.addressee) out.push(para([run(l)], { after: 0 }));
    out.push(para([run("")]));
  }
  if (c.causeTitle) {
    out.push(para([run(cs.heading, { bold: true })], { align: "center", after: 0 }));
    if (cs.place) out.push(para([run(cs.place, { bold: true })], { align: "center", after: 0 }));
    if (o.inProceeding) {
      out.push(para([run(o.inProceeding, { bold: true })], { align: "center", after: 0 }));
      out.push(para([run(cs.inLabel)], { align: "center", after: 0 }));
    }
    out.push(para([run(cs.caseLine, { bold: true })], { align: "center", after: 200 }));
    out.push(para([run(cs.between)], { after: 60 }));
    out.push(para([run(cs.pet)], { indent: 360, after: 0 }));
    out.push(para([run(`... ${cs.petLabel}`)], { align: "right" }));
    out.push(para([run(cs.and, { bold: true })], { align: "center" }));
    out.push(para([run(cs.res)], { indent: 360, after: 0 }));
    out.push(para([run(`... ${cs.resLabel}`)], { align: "right", after: 240 }));
  }
  if (c.title) {
    out.push(para([run(c.title, { bold: true, size: 13 })], { align: "center", after: c.subtitle ? 0 : 200 }));
    if (c.subtitle) out.push(para([run(c.subtitle, { italics: true, size: 11 })], { align: "center", after: 200 }));
  }

  let tail = c.blocks.length;
  while (tail > 0 && c.blocks[tail - 1].type === "space") tail--;
  let n = 0;
  const emit = (b: Block) => {
    switch (b.type) {
      case "heading":
        out.push(para([run(b.text, { bold: true })], { align: "center" }));
        break;
      case "para":
        if (b.numbered) {
          n += 1;
          out.push(para([run(`${n}.\t${b.text}`)], { indent: 567, hanging: 567 }));
        } else out.push(para([run(b.text)], { indent: b.indent ? 567 : 0 }));
        break;
      case "lines":
        for (const l of b.lines) out.push(para([run(l)], { indent: 1134, after: 0 }));
        out.push(para([run("")]));
        break;
      case "kv":
        out.push(grid(["", ""], b.rows.map(([k, v2]) => [k, v2 || "—"])));
        out.push(para([run("")]));
        break;
      case "table":
        out.push(grid(b.columns, b.rows));
        out.push(para([run("")]));
        break;
      case "note":
        out.push(para([run(b.text, { italics: true, size: 10, color: "777777" })]));
        break;
      case "space":
        out.push(
          b.height
            ? new Paragraph({
                spacing: { before: 240, after: 240 },
                border: { top: { style: BorderStyle.DASHED, size: 4, color: "999999" }, bottom: { style: BorderStyle.DASHED, size: 4, color: "999999" }, left: { style: BorderStyle.DASHED, size: 4, color: "999999" }, right: { style: BorderStyle.DASHED, size: 4, color: "999999" } },
                children: [run(b.label, { italics: true, size: 9, color: "777777" }), new TextRun({ break: 4, text: "" })],
              })
            : new Paragraph({ alignment: b.align === "left" ? AlignmentType.LEFT : AlignmentType.RIGHT, spacing: { before: 480, after: 200 }, children: [run("________________________"), new TextRun({ text: b.label, break: 1, font, size: 22 })] }),
        );
        break;
    }
  };
  c.blocks.slice(0, tail).forEach(emit);
  if (c.placeDate) {
    out.push(para([run(`${cs.placeLabel}: ${v.court_place?.trim() || "______________"}`)], { after: 0 }));
    out.push(para([run(`${cs.dateLabel}: ${showIso(v.filing_date) || "______________"}`)]));
  }
  c.blocks.slice(tail).forEach(emit);
  return out;
}

/** One Word file from several parts (paper, translation, docket), each starting on a new page. */
export async function composedDocx(parts: (Paragraph | Table)[][], o: { title: string; draft: boolean }): Promise<Buffer> {
  const small = (text: string) => new Paragraph({ children: [new TextRun({ text, size: 14, color: "777777", font: "Times New Roman" })] });
  const children: (Paragraph | Table)[] = [];
  parts.forEach((p, k) => {
    if (k > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...p);
  });
  const doc = new Document({
    title: o.title,
    creator: "Shisho AI",
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { left: 1440, right: 1080, top: 1280, bottom: 1280 } } },
        headers: o.draft ? { default: new Header({ children: [small(`${DRAFT_LABEL.toUpperCase()} - NOT FOR EXECUTION OR FILING`)] }) } : undefined,
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: "777777", font: "Times New Roman" })] })] }) },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
