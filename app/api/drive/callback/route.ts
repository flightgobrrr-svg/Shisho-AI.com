import { NextResponse } from "next/server";
import { exchangeCodeForRefreshToken } from "@/lib/googleDrive";
import { saveRefreshToken } from "@/lib/driveConnection";
import { readVisitorId, VISITOR_COOKIE, isSupabaseConfigured } from "@/lib/usageCounters";
import { readCookie, DRIVE_OAUTH_STATE_COOKIE } from "@/lib/cookies";

/**
 * GET /api/drive/callback
 *
 * Step 2: Google redirects here with either `code` (consent granted) or
 * `error` (denied/cancelled). On success, exchanges the code for a refresh
 * token and stores it — nothing else about the visitor's Drive is touched
 * or read yet; picking a templates folder is a separate step
 * (app/api/drive/folder/route.ts) the visitor takes afterwards.
 */

export const runtime = "nodejs";

function redirectTo(request: Request, query: string) {
  const response = NextResponse.redirect(new URL(`/draft-bot${query}`, request.url));
  response.cookies.delete(DRIVE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (error) {
    // The visitor declined consent — not a failure worth logging.
    return redirectTo(request, "?driveError=denied");
  }

  const cookieHeader = request.headers.get("cookie");
  const expectedState = readCookie(cookieHeader, DRIVE_OAUTH_STATE_COOKIE);

  if (!state || !expectedState || state !== expectedState) {
    console.error("[api/drive/callback] state mismatch — possible CSRF attempt or expired flow.");
    return redirectTo(request, "?driveError=1");
  }

  if (!code) {
    return redirectTo(request, "?driveError=1");
  }

  if (!isSupabaseConfigured()) {
    // Shouldn't be reachable — /api/drive/connect refuses to start the flow
    // when Supabase isn't configured — but this route must not assume that.
    return redirectTo(request, "?driveError=1");
  }

  const visitorId = readVisitorId(readCookie(cookieHeader, VISITOR_COOKIE));
  const redirectUri = new URL("/api/drive/callback", request.url).toString();

  try {
    const refreshToken = await exchangeCodeForRefreshToken(code, redirectUri);
    await saveRefreshToken(visitorId, refreshToken);
  } catch (error) {
    console.error("[api/drive/callback] token exchange or save failed:", error);
    return redirectTo(request, "?driveError=1");
  }

  return redirectTo(request, "?driveConnected=1");
}
