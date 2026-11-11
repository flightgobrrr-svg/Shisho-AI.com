import { ACTS, PROVISIONS, type Provision } from "@/lib/acts";
import { CATEGORIES, PREVIEW_CASES, slugify, type LibraryCategory, type PreviewCase } from "@/lib/library";

/**
 * For scholars: each Library collection read as one line of thought, oldest
 * judgment first, with the provisions each judgment turns on beside it. Built
 * only from the Library (lib/library.ts) and the Bare Acts collection
 * (lib/acts.ts `citedIn`), so every link shown is one already verified. Where a
 * later judgment overruled an earlier one, the Library's own topic says so.
 */

export type ThreadCase = {
  case: PreviewCase;
  slug: string;
  year: number | null;
  provisions: { label: string; provision: Provision }[];
  /** True when the Library records it as no longer good law. */
  departed: boolean;
};

export type Thread = { category: LibraryCategory; cases: ThreadCase[]; span: string };

/** The year in "(1973) 4 SCC 225", "AIR 1950 SC 27" or "[1950] SCR 88". */
export function citationYear(citation: string): number | null {
  const m = citation.match(/(?:\(|\[|AIR\s)(1[89]\d\d|20\d\d)/);
  return m ? Number(m[1]) : null;
}

/** The Library says "expressly overruled" or "was overruled" of the judgment itself (lib/library.ts header). */
const isDeparted = (topic: string) => /\b(?:expressly|was) overruled\b|no longer good law/i.test(topic);

const actShort = (id: Provision["actId"]) => ACTS.find((a) => a.id === id)!.shortName;

function provisionsFor(c: PreviewCase) {
  return PROVISIONS.filter((p) => p.citedIn?.includes(c.citation)).map((p) => ({
    label: `${p.section}, ${actShort(p.actId)}`,
    provision: p,
  }));
}

export function doctrineThreads(): Thread[] {
  return CATEGORIES.map((category) => {
    const cases = PREVIEW_CASES.filter((c) => c.category === category)
      .map((c) => ({
        case: c,
        slug: slugify(c.title),
        year: citationYear(c.citation),
        provisions: provisionsFor(c),
        departed: isDeparted(c.topic),
      }))
      .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    const years = cases.map((c) => c.year).filter((y): y is number => y !== null);
    const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";
    return { category, cases, span };
  }).filter((t) => t.cases.length > 0);
}

/** Every judgment that turns on one provision, oldest first: a provision's own thread. */
export function provisionThread(p: Provision): ThreadCase[] {
  return PREVIEW_CASES.filter((c) => p.citedIn?.includes(c.citation))
    .map((c) => ({ case: c, slug: slugify(c.title), year: citationYear(c.citation), provisions: provisionsFor(c), departed: isDeparted(c.topic) }))
    .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
}
