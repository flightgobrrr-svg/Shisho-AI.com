import { NextResponse } from "next/server";
import { getCaseDigest } from "@/lib/caseBrief";
import { PREVIEW_CASES, findCaseBySlug } from "@/lib/library";
import { FREE_DAILY_DIGESTS, libraryIsLimited, type Plan } from "@/lib/entitlements";
import { authClient, bearerToken, deviceId, mobileError } from "@/lib/mobileApi";
import { getUserPlan } from "@/lib/profile";
import { consumeUsage, isSupabaseConfigured, refundUsage } from "@/lib/usageCounters";

/**
 * GET /api/mobile/digest/[slug]: the citation digest for one curated Library
 * judgment, as JSON. Only judgments in the curated list resolve, so the number
 * of model calls this can ever cause is bounded (and each digest is cached
 * after the first). Arbitrary judgments go through /api/mobile/lookup, which
 * needs a signed-in user.
 *
 * Plans: Free (and the Shisho-only add-on) get FREE_DAILY_DIGESTS new digests
 * a day, counted per account when signed in and per device otherwise; Basic and
 * above are unlimited. The app keeps each digest it receives and does not ask
 * again for one it has saved, so the allowance only counts new judgments.
 */
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const item = findCaseBySlug(PREVIEW_CASES, slug);
  if (!item || !item.sourceUrl) return mobileError(404, "That judgment is not in the Library.");

  let plan: Plan = "free";
  let visitor = deviceId(request);
  const token = bearerToken(request);
  if (token) {
    const client = authClient();
    const { data, error } = client ? await client.auth.getUser(token) : { data: null, error: true };
    if (error || !data?.user) return mobileError(401, "Your session has ended. Sign in again.");
    visitor = data.user.id;
    if (isSupabaseConfigured()) plan = await getUserPlan(data.user.id);
  }

  // Without Supabase there is nowhere to count, so the limit cannot apply.
  const counting = libraryIsLimited(plan) && isSupabaseConfigured() && Boolean(visitor);
  // Taken in one atomic step before the digest is prepared, so parallel
  // requests cannot all pass; given back below if no real digest results.
  const consumed = counting ? await consumeUsage(visitor!, "digest", FREE_DAILY_DIGESTS) : null;
  if (consumed && !consumed.allowed) {
    return NextResponse.json(
      {
        error: "The Free plan opens one new judgment digest a day. Digests you have saved stay readable, and Basic opens the whole Library.",
        limit: "digest",
      },
      { status: 402 },
    );
  }

  let digest;
  try {
    digest = await getCaseDigest(item, slug);
  } catch (error) {
    if (consumed) await refundUsage(visitor!, "digest");
    throw error;
  }
  if (consumed && digest.mode !== "live") await refundUsage(visitor!, "digest");

  return NextResponse.json({
    title: item.title,
    citation: item.citation,
    court: item.court,
    sourceUrl: item.sourceUrl,
    digest,
  });
}
