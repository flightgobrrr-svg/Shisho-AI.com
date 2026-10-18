import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/**
 * POST /api/auth/register — { email, password } -> Supabase Auth signUp.
 *
 * Runs on the Node runtime, same requirement as every other route that holds
 * a server-only key (SUPABASE_PUBLISHABLE_KEY here — see lib/authSession.ts
 * for why it's kept server-only despite being safe to expose).
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback` },
  });

  if (error) {
    return copyAuthCookies(cookieCarrier, NextResponse.json({ error: error.message }, { status: 400 }));
  }

  // `data.session` is only present when the project's email-confirmation
  // requirement is off — the visitor is asked to check their inbox either
  // way, since we can't know that setting from here.
  return copyAuthCookies(
    cookieCarrier,
    NextResponse.json({ ok: true, needsConfirmation: !data.session }),
  );
}
