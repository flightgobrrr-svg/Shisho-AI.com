import { NextResponse } from "next/server";
import { getCaseDigest } from "@/lib/caseBrief";
import { PREVIEW_CASES, findCaseBySlug } from "@/lib/library";
import { mobileError } from "@/lib/mobileApi";

/**
 * GET /api/mobile/digest/[slug]: the citation digest for one curated Library
 * judgment, as JSON. Only judgments in the curated list resolve, so the number
 * of model calls this can ever cause is bounded (and each digest is cached
 * after the first). Arbitrary judgments go through /api/mobile/lookup, which
 * needs a signed-in user.
 */
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const item = findCaseBySlug(PREVIEW_CASES, slug);
  if (!item || !item.sourceUrl) return mobileError(404, "That judgment is not in the Library.");

  const digest = await getCaseDigest(item, slug);
  return NextResponse.json({
    title: item.title,
    citation: item.citation,
    court: item.court,
    sourceUrl: item.sourceUrl,
    digest,
  });
}
