import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/**
 * POST /api/auth/reset-password — { password } -> Supabase Auth updateUser.
 *
 * Only succeeds when the request already carries a valid session — which for
 * this flow means the visitor arrived via /auth/callback?next=/reset-password
 * (the recovery link), which exchanged the link's one-time code for a real
 * session cookie before redirecting here. There is no separate "recovery
 * token" to check in this route; the session cookie IS the proof.
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

  const { password } = (body ?? {}) as { password?: unknown };

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return copyAuthCookies(cookieCarrier, NextResponse.json({ error: error.message }, { status: 400 }));
  }

  return copyAuthCookies(cookieCarrier, NextResponse.json({ ok: true }));
}
