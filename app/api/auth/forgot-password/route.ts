import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/**
 * POST /api/auth/forgot-password — { email } -> Supabase sends a recovery
 * link to /auth/callback?next=/reset-password, which exchanges it for a
 * session before landing the visitor on the password form.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Accounts aren't set up yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };

  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);
  const origin = new URL(request.url).origin;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always the same response whether or not that address has an account —
  // confirming or denying it here is a real enumeration risk. The visitor
  // sees "check your email" either way.
  return copyAuthCookies(cookieCarrier, NextResponse.json({ ok: true }));
}
