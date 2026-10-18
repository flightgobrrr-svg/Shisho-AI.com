import { NextResponse } from "next/server";
import { mintAccessToken } from "@/lib/googleDrive";
import { getConnection } from "@/lib/driveConnection";
import { VISITOR_COOKIE } from "@/lib/usageCounters";
import { readCookie } from "@/lib/cookies";

/**
 * GET /api/drive/token
 *
 * Mints a short-lived Drive access token for the browser to hand to Google
 * Picker's own `setOAuthToken()` — the one intentional exception to "nothing
 * sensitive reaches the client" in this feature. Picker is a Google-hosted
 * iframe that structurally requires a bearer token in the page; there's no
 * way to drive it from the server instead. Scoped to drive.file only and
 * expiring in about an hour, unlike the refresh_token this is minted from,
 * which never leaves the server.
 *
 * Does NOT mint a fresh visitor_id if the cookie is missing — no cookie
 * means no possible connection to hand back a token for, so this is a plain
 * 401, not something to paper over.
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  const visitorId = readCookie(request.headers.get("cookie"), VISITOR_COOKIE);
  if (!visitorId) {
    return NextResponse.json({ error: "Not connected to Google Drive." }, { status: 401 });
  }

  const connection = await getConnection(visitorId);
  if (!connection) {
    return NextResponse.json({ error: "Not connected to Google Drive." }, { status: 404 });
  }

  try {
    const { accessToken, expiresIn } = await mintAccessToken(connection.refreshToken);
    return NextResponse.json({ accessToken, expiresIn });
  } catch (error) {
    console.error("[api/drive/token] refresh failed:", error);
    return NextResponse.json(
      { error: "Could not reach Google Drive. Try reconnecting." },
      { status: 502 },
    );
  }
}
