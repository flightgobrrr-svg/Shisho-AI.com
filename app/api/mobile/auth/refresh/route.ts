import { NextResponse } from "next/server";
import { authClient, mobileError, toMobileSession } from "@/lib/mobileApi";

/** POST /api/mobile/auth/refresh: { refreshToken } -> a fresh session. */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");

  let body: { refreshToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return mobileError(400, "Malformed JSON body.");
  }
  const token = body.refreshToken;
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) {
    return mobileError(400, "A refresh token is required.");
  }

  const { data, error } = await client.auth.refreshSession({ refresh_token: token });
  const session = toMobileSession(data.session);
  if (error || !session) return mobileError(401, "Your session has ended. Sign in again.");
  return NextResponse.json({ session });
}
