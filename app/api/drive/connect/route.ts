import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildAuthUrl } from "@/lib/googleDrive";
import { readVisitorId, VISITOR_COOKIE, isSupabaseConfigured } from "@/lib/usageCounters";
import { readCookie, DRIVE_OAUTH_STATE_COOKIE } from "@/lib/cookies";

/**
 * GET /api/drive/connect
 *
 * Step 1 of the Google Drive connection: mints/reuses the visitor's id
 * (same cookie lib/usageCounters.ts already owns), stashes a CSRF `state`
 * nonce, and redirects to Google's own consent screen. Nothing is written
 * to Supabase here — that happens in the callback, once Google has actually
 * granted something worth storing.
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Google Drive isn't available yet — Supabase isn't configured." },
      { status: 503 },
    );
  }

  const cookieHeader = request.headers.get("cookie");
  const visitorId = readVisitorId(readCookie(cookieHeader, VISITOR_COOKIE));
  const state = randomUUID();
  const redirectUri = new URL("/api/drive/callback", request.url).toString();

  let authUrl: string;
  try {
    authUrl = buildAuthUrl(redirectUri, state);
  } catch (error) {
    console.error("[api/drive/connect] Google isn't configured:", error);
    return NextResponse.json(
      { error: "Google Drive isn't available yet — ask the site owner to finish setup." },
      { status: 503 },
    );
  }

  const response = NextResponse.redirect(authUrl);

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set(DRIVE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // just long enough to complete the consent screen
  });

  return response;
}
