import { NextResponse } from "next/server";
import { authClient, isEmail, mobileError, siteOrigin, toMobileSession } from "@/lib/mobileApi";

/**
 * POST /api/mobile/auth/register: { email, password }.
 *
 * Mirrors the website's rules (valid email, 8+ character password). If the
 * project requires email confirmation there is no session yet, and the answer
 * says so; the person confirms from the email, then signs in.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return mobileError(400, "Malformed JSON body.");
  }
  if (!isEmail(body.email)) return mobileError(400, "Enter a valid email address.");
  if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 256) {
    return mobileError(400, "Password must be at least 8 characters.");
  }

  const { data, error } = await client.auth.signUp({
    email: body.email.trim(),
    password: body.password,
    // Not /auth/callback: that needs a code tied to the browser that asked,
    // and this request came from the app, not a browser. Supabase confirms the
    // address before redirecting, so the landing page only has to say so.
    options: { emailRedirectTo: `${siteOrigin(request)}/auth/confirmed` },
  });
  if (error) return mobileError(400, error.message);

  const session = toMobileSession(data.session);
  if (!session) {
    return NextResponse.json({ session: null, confirmEmail: true });
  }
  return NextResponse.json({ session, plan: "free", confirmEmail: false });
}
