import * as cheerio from "cheerio";

/**
 * Client for the AWS Open Data "Indian Supreme Court Judgments" dataset —
 * public, free, no account or key needed (anonymous S3 access). Sourced
 * from the official eCourts portal, CC-BY-4.0 licensed, updated bi-monthly.
 * See https://registry.opendata.aws/indian-supreme-court-judgments/.
 *
 * Replaces an earlier Indian Kanoon integration (see git history) — that
 * was a paid, per-page API; this costs nothing and needs no signup at all.
 * The trade: this dataset isn't real-time (bi-monthly refresh, not daily),
 * and it ships raw scraped HTML per judgment rather than clean text, so
 * this file has to parse that HTML itself rather than trust a documented
 * API response shape.
 *
 * EVERYTHING BELOW IS VERIFIED AGAINST EXACTLY ONE REAL RECORD
 * (metadata/json/year=2024/2024_10_108_125.json, fetched directly while
 * building this), not the full range of years/courts the dataset actually
 * covers. Older judgments in particular may predate India's neutral-
 * citation system (INSC citations only exist from ~2023) or use different
 * markup entirely. A null field from `parseJudgmentHtml` below is the
 * correct, honest result when parsing doesn't find something — never
 * papered over with a guess. supabase/schema.sql's constraints back this
 * up at the database level: a row can't be marked verified without a human
 * having supplied both a title and a citation.
 */

export const BUCKET_URL =
  "https://indian-supreme-court-judgments.s3.ap-south-1.amazonaws.com";

export type MetadataFile = {
  /** Dedup key — matches `cases.source_doc_id`. E.g. "2024_10_108_125". */
  path: string;
  citationYear: string | null;
  scrapedAt: string | null;
  rawHtml: string;
};

/**
 * Lists metadata JSON object keys for one year via S3's public listing API
 * (plain HTTPS GET, no SDK or credentials required for a public bucket).
 * Paginates via `continuation-token` — call again with the returned
 * `nextToken` to keep going; `null` means this was the last page.
 */
export async function listMetadataKeys(
  year: number,
  continuationToken?: string,
): Promise<{ keys: string[]; nextToken: string | null }> {
  const params = new URLSearchParams({
    "list-type": "2",
    prefix: `metadata/json/year=${year}/`,
    "max-keys": "1000",
  });
  if (continuationToken) params.set("continuation-token", continuationToken);

  const res = await fetch(`${BUCKET_URL}/?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`S3 listing failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
  const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
  const nextTokenMatch = xml.match(
    /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/,
  );

  return {
    keys,
    nextToken: truncated && nextTokenMatch ? nextTokenMatch[1] : null,
  };
}

/** Fetches one metadata JSON object by its S3 key (from listMetadataKeys). */
export async function fetchMetadata(key: string): Promise<MetadataFile> {
  const res = await fetch(`${BUCKET_URL}/${key}`);
  if (!res.ok) {
    throw new Error(`Metadata fetch failed for ${key}: ${res.status}`);
  }
  const data = await res.json();
  return {
    path: data.path,
    citationYear: data.citation_year ?? null,
    scrapedAt: data.scraped_at ?? null,
    rawHtml: data.raw_html ?? "",
  };
}

export type ParsedJudgment = {
  title: string | null;
  /** Prefers the reporter-style citation over the bare neutral citation
   *  when both exist — see parseJudgmentHtml. */
  citation: string | null;
  /** ISO yyyy-mm-dd, or null if the date text wasn't found/parseable. */
  decisionDate: string | null;
};

/**
 * Extracts what a review-queue row needs from one judgment's raw scraped
 * HTML. See this file's header — verified against one real record only.
 */
export function parseJudgmentHtml(html: string): ParsedJudgment {
  const $ = cheerio.load(html);

  // The party-name button's aria-label is "<title> pdf" — verified pattern:
  // aria-label="Vijay Singh @ Vijay Kr. Sharma versus The State of Bihar pdf"
  //
  // Filtered on that "pdf"-suffix specifically, not just any button with an
  // aria-label — an earlier version took the first such button unfiltered,
  // which on some pages was a disclaimer modal's "Close" button (its
  // aria-label is just "Close", no "pdf" suffix) rather than the judgment's
  // own title button. Caught by testing against real listing data, not
  // assumed safe from the one record used to build this originally.
  const titleButton = $("button[aria-label]")
    .filter((_, el) => /\bpdf\s*$/i.test($(el).attr("aria-label") ?? ""))
    .first();
  const ariaLabel = titleButton.attr("aria-label");
  const title = ariaLabel ? ariaLabel.replace(/\s*pdf\s*$/i, "").trim() : null;

  // Two citation formats appear with distinct classes when present. Prefer
  // the SCR-style reporter citation (.escrText, e.g. "[2024] 10 S.C.R. 108")
  // since it's closer to how lib/library.ts's hand-verified entries are
  // already formatted; fall back to the bare neutral citation (.ncDisplay,
  // e.g. "2024 INSC 735") — the same value the metadata JSON's own
  // `nc_display` field carries, just already correctly spaced here.
  const reporterCitation = $(".escrText").first().text().trim();
  const neutralCitation = $(".ncDisplay").first().text().trim();
  const citation = reporterCitation || neutralCitation || null;

  // Targeted on the "Decision Date :" label's own next element, not a bare
  // `font[color=green]` selector — the latter would also match unrelated
  // green-colored text elsewhere in a full judgment page.
  const dateText = $("span:contains('Decision Date')").first().next().text().trim();
  const decisionDate = parseDdMmYyyy(dateText);

  return { title, citation, decisionDate };
}

function parseDdMmYyyy(text: string): string | null {
  const m = text.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}
