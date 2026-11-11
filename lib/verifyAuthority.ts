import { PREVIEW_CASES } from "@/lib/library";
import { ACTS, PROVISIONS } from "@/lib/acts";
import type { CheckedAuthority } from "@/lib/toolTypes";

/**
 * Checks an authority a model named against what Shisho has verified:
 * the Library's judgments (lib/library.ts) and the Bare Acts collection
 * (lib/acts.ts). It never vouches for anything outside those two lists; an
 * unmatched authority comes back `verified: false` and the app labels it
 * "Check before relying", which is the product's `unread` rule (PRODUCT.md:
 * never present a guess as settled).
 *
 * A match needs the citation itself, or both sides of the cause title, so a
 * shared surname alone never counts.
 */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\bvs?\.?\b/g, " v ")
    .replace(/[^a-z0-9()\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP = new Set(["the", "state", "of", "union", "india", "and", "ors", "others", "anr", "another", "ltd", "co", "m s", "in", "re"]);

/** The distinctive words of one side of a cause title. */
function sideWords(side: string): string[] {
  return norm(side)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const CASES = PREVIEW_CASES.map((c) => {
  const [left = "", right = ""] = c.title.split(/\s+v\.?\s+/i);
  return { c, citation: norm(c.citation), left: sideWords(left), right: sideWords(right) };
});

export function matchCase(text: string) {
  const t = norm(text);
  for (const k of CASES) {
    if (k.citation.length > 6 && t.includes(k.citation)) return k.c;
    // Otherwise both parties: the first distinctive word of each side. A title
    // with only one distinctive side needs two of its words instead.
    // Words can carry brackets ("(cbi" from "State (CBI/SPE)"), so they are
    // escaped before use in a pattern; unescaped, they threw and failed the tool.
    const has = (w: string) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(t);
    const [l, r] = [k.left[0], k.right[0]];
    if (l && r ? has(l) && has(r) : k.left.length + k.right.length >= 2 && [...k.left, ...k.right].slice(0, 2).every(has)) {
      return k.c;
    }
  }
  return undefined;
}

const ACT_KEYS = ACTS.map((a) => ({
  id: a.id,
  keys: [norm(a.shortName), norm(a.name).replace(/^the /, "").replace(/ \d{4}$/, "")],
}));

/** "Order XXXIX Rules 1-2" also answers "Order XXXIX Rule 1". */
const sectionForms = (section: string) => {
  const s = norm(section);
  const forms = [s];
  const m = s.match(/^(order [ivxl]+) rules? (\d+[a-z]?)(?:-(\d+))?$/);
  if (m) forms.push(`${m[1]} rule ${m[2]}`, `${m[1]} r ${m[2]}`, `o ${m[1].slice(6)} r ${m[2]}`);
  const sec = s.match(/^section (\d+[a-z]?)$/);
  if (sec) forms.push(`s ${sec[1]}`, `sec ${sec[1]}`);
  return forms;
};

export function matchProvision(text: string) {
  const t = ` ${norm(text)} `;
  for (const p of PROVISIONS) {
    const act = ACT_KEYS.find((a) => a.id === p.actId)!;
    const hasSection = sectionForms(p.section).some((f) => new RegExp(`(^|[^a-z0-9])${f.replace(/[()]/g, "\\$&")}([^a-z0-9]|$)`).test(t));
    if (!hasSection) continue;
    // Articles belong to the Constitution; anything else must name its Act.
    if (p.actId === "constitution" ? /article/.test(p.section.toLowerCase()) : act.keys.some((k) => k && t.includes(k))) return p;
    if (p.actId === "cpc" && /order [ivxl]+/.test(norm(p.section))) return p; // Orders are CPC-only.
  }
  return undefined;
}

const KANOON_ACT_SEARCH = "https://indiankanoon.org/search/?formInput=";

/** One authority, checked. Unmatched text is kept, never rewritten. */
export function checkAuthority(text: string): CheckedAuthority {
  const clean = text.trim();
  const c = matchCase(clean);
  if (c) return { text: clean, verified: true, sourceUrl: c.sourceUrl };
  const p = matchProvision(clean);
  if (p) return { text: clean, verified: true, sourceUrl: `${KANOON_ACT_SEARCH}${encodeURIComponent(`${p.section} ${ACTS.find((a) => a.id === p.actId)!.name}`)}` };
  return { text: clean, verified: false };
}

/** The verified judgments, in the short form a prompt can carry. */
export const VERIFIED_CASE_LINES = PREVIEW_CASES.filter((c) => c.sourceUrl).map(
  (c) => `${c.title}, ${c.citation} — ${c.topic}`,
);

export const VERIFIED_PROVISION_LINES = PROVISIONS.map(
  (p) => `${p.section}, ${ACTS.find((a) => a.id === p.actId)!.name} — ${p.title}`,
);
