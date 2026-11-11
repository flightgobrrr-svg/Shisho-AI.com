import * as cheerio from "cheerio";

/**
 * Fetches and parses ONE Indian Kanoon judgment page — either a known,
 * already-verified direct document URL (lib/library.ts's
 * PreviewCase.sourceUrl) or the top hit from `searchKanoonTopResult` below,
 * for a case outside the curated Library.
 *
 * Kanoon's page markup gives four fields their own dedicated, consistently
 * labelled elements — extracted here, not guessed: `h3.docsource_main`
 * (court), `h2.doc_title` (case title, with the decision date appended),
 * `h3.doc_citations` (the raw "Equivalent citations: ..." line),
 * `h3.doc_bench` (judges). Everything else this product needs (case number,
 * date of judgment if the title doesn't carry it cleanly, the whole
 * analytical brief) is derived by the model from `bodyText` itself, in
 * lib/caseBrief.ts — this module only fetches and parses the page, it never
 * summarizes or infers anything.
 *
 * `searchKanoonTopResult` is the part worth being honest about: Kanoon's own
 * search ranking favours whichever document repeats the query terms most,
 * which for a loosely-phrased query is very often a LATER case that merely
 * cites the one actually wanted, not the original judgment — confirmed live
 * this session (searching "Rangappa Sri Mohan negotiable instruments"
 * returned three unrelated citing cases, none of them the actual judgment).
 * A query phrased the way Kanoon titles its own documents — "Party A vs
 * Party B" — reliably surfaced the real judgment as the top result in the
 * same testing. The confirmed real title/citation is shown prominently at
 * the top of the resulting digest page either way, so a visitor can
 * immediately see if the match was wrong rather than trusting it silently.
 */

export type FetchedJudgment = {
  court: string;
  /** Case title with the trailing "on <date>" already stripped. */
  title: string;
  /** ISO yyyy-mm-dd, parsed from doc_title's own trailing date — null if
   *  that date text didn't parse (rare; the model derives it from
   *  `bodyText` as a fallback in that case). */
  decisionDate: string | null;
  /** The raw "AIR 1973 SUPREME COURT 1461, 1973 4 SCC 225" style string,
   *  exactly as Kanoon printed it — lib/caseBrief.ts asks the model to sort
   *  this into named reporters, rather than this file guessing a format
   *  that varies across courts and eras. */
  citationsRaw: string | null;
  bench: string | null;
  bodyText: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/** A handful of judgments (Kesavananda Bharati chief among them) run to
 *  hundreds of thousands of words — far past any reasonable prompt size.
 *  This caps the body text kept, from both ends — see below for why. */
const MAX_BODY_CHARS = 300_000;

const HEADER_CLASSES = new Set([
  "covers",
  "docsource_main",
  "doc_title",
  "doc_citations",
  "doc_bench",
]);

function parseTrailingDate(title: string): { title: string; decisionDate: string | null } {
  // Kanoon's own title format: "<parties> on <D> <Month>, <YYYY>" — e.g.
  // "Kesavananda Bharati ... vs State Of Kerala And Anr on 24 April, 1973".
  const match = title.match(/^(.*)\bon\s+(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})\s*$/);
  if (!match) return { title, decisionDate: null };

  const [, base, day, monthName, year] = match;
  const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
  if (Number.isNaN(monthIndex)) return { title: base.trim(), decisionDate: null };

  const month = String(monthIndex + 1).padStart(2, "0");
  const dayPadded = day.padStart(2, "0");
  return { title: base.trim(), decisionDate: `${year}-${month}-${dayPadded}` };
}

export async function fetchKanoonJudgment(url: string): Promise<FetchedJudgment> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Indian Kanoon fetch failed: ${res.status} for ${url}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const court = $("h3.docsource_main").first().text().trim();
  const rawTitle = $("h2.doc_title").first().text().trim();

  const citationsText = $("h3.doc_citations").first().text().trim();
  const citationsRaw = citationsText
    ? citationsText.replace(/^Equivalent citations:\s*/i, "").trim() || null
    : null;

  const benchText = $("h3.doc_bench").first().text().trim();
  const bench = benchText ? benchText.replace(/^Bench:\s*/i, "").trim() || null : null;

  if (!court || !rawTitle) {
    throw new Error(
      `Could not parse a judgment page at ${url} — Indian Kanoon's page structure may have changed.`,
    );
  }

  const { title, decisionDate } = parseTrailingDate(rawTitle);

  const bodyParts: string[] = [];
  $("div.judgments")
    .children()
    .each((_, el) => {
      const cls = $(el).attr("class") ?? "";
      if (HEADER_CLASSES.has(cls)) return;
      const tag = el.tagName?.toLowerCase();
      if (tag === "p" || tag === "pre") {
        const text = $(el).text().trim();
        if (text) bodyParts.push(text);
      }
    });

  let bodyText = bodyParts.join("\n\n");

  // Keep the opening (facts/background) and closing (conclusion/holding)
  // portions rather than truncating from one end — the material a case
  // brief actually needs lives at both ends, not the middle, for a long
  // judgment with extensive intermediate argument.
  if (bodyText.length > MAX_BODY_CHARS) {
    const half = Math.floor(MAX_BODY_CHARS / 2);
    bodyText =
      bodyText.slice(0, half) +
      "\n\n[... judgment text truncated for length — a substantial middle portion is omitted here ...]\n\n" +
      bodyText.slice(-half);
  }

  return { court, title, decisionDate, citationsRaw, bench, bodyText };
}

export type KanoonSearchResult = { title: string; url: string };

/**
 * Searches Kanoon and returns its top hit — see this file's own header for
 * the real, tested caveat: phrase `query` as Kanoon itself titles a
 * judgment ("Party A vs Party B") for a reliable match; a loose natural-
 * language query reliably returns unrelated citing cases instead.
 *
 * Result links come back as `/docfragment/<id>/?formInput=...` (a search-
 * snippet view); the numeric id maps directly to the same document at
 * `/doc/<id>/`, which `fetchKanoonJudgment` above expects — confirmed live
 * this session, not assumed.
 */
export async function searchKanoonTopResult(query: string): Promise<KanoonSearchResult | null> {
  const url = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Indian Kanoon search failed: ${res.status} for query "${query}"`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const link = $("h4.result_title a").first();
  const href = link.attr("href");
  const rawTitle = link.text().trim();
  if (!href || !rawTitle) return null;

  const idMatch = href.match(/\/docfragment\/(\d+)\//);
  if (!idMatch) return null;

  // Search result titles carry the same trailing "on <date>" Kanoon's own
  // doc pages do — strip it the same way for a consistent display title.
  const { title } = parseTrailingDate(rawTitle);

  return { title, url: `https://indiankanoon.org/doc/${idMatch[1]}/` };
}
