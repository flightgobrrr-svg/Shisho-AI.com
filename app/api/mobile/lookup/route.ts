import { NextResponse } from "next/server";
import { getCaseDigestForUrl } from "@/lib/caseBrief";
import { searchKanoonTopResult } from "@/lib/indianKanoon";
import { slugify } from "@/lib/library";
import { authClient, bearerToken, mobileError } from "@/lib/mobileApi";

/**
 * GET /api/mobile/lookup?q=Party A vs Party B: finds a judgment on Indian
 * Kanoon and returns a digest prepared from its real text.
 *
 * Signed-in only. Each new judgment can cost a model call, and an open
 * endpoint that accepts any query would let anyone run up that cost.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = bearerToken(request);
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");
  if (!token) return mobileError(401, "Sign in to look up a judgment.");
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return mobileError(401, "Your session has ended. Sign in again.");

  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 200) ?? "";
  if (q.length < 3) return mobileError(400, "Type at least three characters of the case name.");

  const hit = await searchKanoonTopResult(q);
  if (!hit) return mobileError(404, "No judgment found for that name. Try “Party A vs Party B”.");

  const digest = await getCaseDigestForUrl(
    { title: hit.title, court: "", sourceUrl: hit.url },
    `lookup-${slugify(hit.title)}`,
  );
  return NextResponse.json({ title: hit.title, sourceUrl: hit.url, digest });
}
