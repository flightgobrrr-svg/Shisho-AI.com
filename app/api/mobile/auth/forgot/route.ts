import { NextResponse } from "next/server";
import { authClient, isEmail, mobileError, siteOrigin } from "@/lib/mobileApi";

/**
 * POST /api/mobile/auth/forgot: { email }.
 *
 * Sends the website's own reset link, and finishes on the website. Always
 * answers the same way so it cannot be used to find out which emails have
 * accounts.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return mobileError(400, "Malformed JSON body.");
  }
  if (!isEmail(body.email)) return mobileError(400, "Enter a valid email address.");

  await client.auth.resetPasswordForEmail(body.email.trim(), {
    redirectTo: `${siteOrigin(request)}/auth/callback?next=/reset-password`,
  });
  return NextResponse.json({ ok: true });
}
