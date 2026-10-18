import { NextResponse } from "next/server";
import {
  BUCKET_URL,
  fetchMetadata,
  listMetadataKeys,
  parseJudgmentHtml,
} from "@/lib/openJudgments";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/cron/ingest-judgments
 *
 * Triggered on a schedule by Vercel Cron (see vercel.json). Lists this
 * year's judgment metadata from the free AWS Open Data bucket (see
 * lib/openJudgments.ts), and inserts anything not already present (deduped
 * on source_doc_id) as status='pending_review'.
 *
 * This route has NO path to 'verified' — it can only ever create
 * pending_review rows, and supabase/schema.sql's CHECK constraint backs
 * that up at the database level regardless of what this code does. A human
 * reviewer is what moves a row to verified, by hand, against the real
 * source. That is the whole point: this route finding a judgment is not the
 * same thing as this project vouching for it.
 *
 * Runs daily (vercel.json) even though the source dataset only refreshes
 * bi-monthly — a daily check against a bi-monthly source mostly finds
 * nothing new, which costs nothing (a free S3 listing, not a paid API
 * call) and means new judgments show up in the review queue within a day
 * of the source updating rather than waiting for a precisely-timed cron.
 */

export const runtime = "nodejs";

const SOURCE_COURT_ID = "supreme-court";

// Caps how much of one run's time goes to fetching+parsing+inserting new
// judgments — a fresh year with thousands of entries would otherwise risk
// the route exceeding its execution time limit on a single invocation.
// Anything past this cap is picked up on a later run, since already-ingested
// judgments are skipped via the dedup check either way.
const MAX_NEW_PER_RUN = 25;

export async function GET(request: Request) {
  /* Vercel sets this header automatically for its own scheduled invocations
     when CRON_SECRET is configured — see
     https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
     The ingestion source itself is free, but this still writes to Supabase
     on every run, so the route stays gated regardless. */
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const year = new Date().getFullYear();

  let keys: string[];
  try {
    // Single page (up to 1000 keys) is enough to find what's new on an
    // ordinary daily run; a full-year backfill needs pagination this route
    // doesn't attempt yet — see listMetadataKeys' continuationToken param.
    ({ keys } = await listMetadataKeys(year));
  } catch (error) {
    console.error("[ingest-judgments] listing failed:", error);
    return NextResponse.json({ error: "Listing failed" }, { status: 502 });
  }

  const db = supabase();
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const key of keys) {
    if (inserted >= MAX_NEW_PER_RUN) break;

    // The metadata filename (minus its .json extension) is the dataset's
    // own stable id for this judgment, e.g. "2024_10_108_125".
    const sourceDocId = key.split("/").pop()?.replace(/\.json$/, "");
    if (!sourceDocId) {
      failed++;
      continue;
    }

    const { data: existing, error: lookupError } = await db
      .from("cases")
      .select("id")
      .eq("source_doc_id", sourceDocId)
      .maybeSingle();

    if (lookupError) {
      console.error("[ingest-judgments] dedup lookup failed:", lookupError);
      failed++;
      continue;
    }
    if (existing) {
      skipped++;
      continue;
    }

    let parsed: ReturnType<typeof parseJudgmentHtml>;
    try {
      const meta = await fetchMetadata(key);
      parsed = parseJudgmentHtml(meta.rawHtml);
    } catch (error) {
      console.error(`[ingest-judgments] fetch/parse failed for ${key}:`, error);
      failed++;
      continue;
    }

    const { error: insertError } = await db.from("cases").insert({
      title: parsed.title,
      citation: parsed.citation,
      court_id: SOURCE_COURT_ID,
      // Left null on purpose — see the field's own comment in schema.sql.
      // A human writes the real subject during review; nothing in the
      // scraped page says what the case is actually about.
      topic: null,
      decision_date: parsed.decisionDate,
      // The actual metadata file this row came from — a reviewer can open
      // it and see the raw scraped page (raw_html) this route parsed,
      // rather than a guess at a per-judgment page that was never verified
      // to exist. Not a polished reading view; genuinely the real source.
      source_url: `${BUCKET_URL}/${key}`,
      source_doc_id: sourceDocId,
      status: "pending_review",
    });

    if (insertError) {
      console.error(`[ingest-judgments] insert failed for ${sourceDocId}:`, insertError);
      failed++;
      continue;
    }
    inserted++;
  }

  return NextResponse.json({ year, found: keys.length, inserted, skipped, failed });
}
