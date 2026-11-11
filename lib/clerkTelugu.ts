import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PDFPage, RGB } from "pdf-lib";
import type { FillReport } from "@/lib/clerkForms";
import type { Face } from "@/lib/clerkRender";

/**
 * Server-only. Telugu (and mixed Telugu–English) text for the PDF writer.
 *
 * Telugu needs real shaping: conjuncts, vowel signs and their positions. The
 * PDF library cannot do that, so HarfBuzz (the shaping engine browsers and
 * Android use) shapes each line, and every glyph is drawn as its own vector
 * outline at the position HarfBuzz gives. The font is Noto Sans Telugu
 * (SIL Open Font License), which also covers Latin letters and digits, so
 * names and case numbers kept in English sit in the same line.
 */

type HB = typeof import("harfbuzzjs");
type Loaded = { hb: HB; font: InstanceType<HB["Font"]>; upem: number; paths: Map<number, string>; shapes: Map<string, { gid: number; ax: number; dx: number; dy: number }[]> };

const FONT_DIR = path.join(process.cwd(), "node_modules", "@expo-google-fonts", "noto-sans-telugu");
const FILES = { regular: "400Regular/NotoSansTelugu_400Regular.ttf", bold: "700Bold/NotoSansTelugu_700Bold.ttf" } as const;
const cache = new Map<keyof typeof FILES, Promise<Loaded>>();

async function load(weight: keyof typeof FILES): Promise<Loaded> {
  let p = cache.get(weight);
  if (!p) {
    p = (async () => {
      const hb = await import("harfbuzzjs");
      const buf = await readFile(path.join(FONT_DIR, FILES[weight]));
      const face = new hb.Face(new hb.Blob(new Uint8Array(buf)));
      return { hb, font: new hb.Font(face), upem: face.upem, paths: new Map(), shapes: new Map() };
    })();
    cache.set(weight, p);
  }
  return p;
}

function shape(f: Loaded, text: string) {
  let s = f.shapes.get(text);
  if (!s) {
    const b = new f.hb.Buffer();
    b.addText(text);
    b.guessSegmentProperties();
    f.hb.shape(f.font, b);
    const pos = b.getGlyphPositions();
    s = b.getGlyphInfos().map((g, i) => ({ gid: g.codepoint, ax: pos[i].xAdvance, dx: pos[i].xOffset, dy: pos[i].yOffset }));
    if (f.shapes.size > 4000) f.shapes.clear();
    f.shapes.set(text, s);
  }
  return s;
}

/** The glyph's outline with y negated, because drawSvgPath assumes SVG's downward y. */
function glyphPath(f: Loaded, gid: number): string {
  let p = f.paths.get(gid);
  if (p === undefined) {
    const raw = f.font.glyphToPath(gid);
    p = raw.replace(/([MLQCZ])([^MLQCZ]*)/g, (_m, cmd: string, args: string) => {
      const nums = args.trim() ? args.trim().split(/[ ,]+/).map(Number) : [];
      return cmd + nums.map((n, k) => (k % 2 === 1 ? -n : n)).join(",");
    });
    f.paths.set(gid, p);
  }
  return p;
}

export async function teluguFace(weight: keyof typeof FILES): Promise<Face> {
  const f = await load(weight);
  return {
    width: (text, size) => (shape(f, text).reduce((n, g) => n + g.ax, 0) / f.upem) * size,
    draw: (page: PDFPage, text: string, x: number, y: number, size: number, color: RGB) => {
      const scale = size / f.upem;
      let pen = 0;
      for (const g of shape(f, text)) {
        const d = glyphPath(f, g.gid);
        if (d) page.drawSvgPath(d, { x: x + (pen + g.dx) * scale, y: y + g.dy * scale, scale, color, borderWidth: 0 });
        pen += g.ax;
      }
    },
    clean: (text: string, report: FillReport) => {
      const t = text.replace(/\s+/g, " ");
      // Report characters the font has no glyph for (glyph 0); they print as boxes.
      for (const ch of new Set(t)) {
        if (ch === " ") continue;
        if (shape(f, ch).some((g) => g.gid === 0) && !report.unprintable.includes(ch)) report.unprintable.push(ch);
      }
      return t;
    },
  };
}
