import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/** POST /api/auth/login — { email, password } -> Supabase Auth signInWithPassword. */
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

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately the same message regardless of whether the email exists —
    // distinguishing "no such account" from "wrong password" is a real
    // account-enumeration risk.
    return copyAuthCookies(
      cookieCarrier,
      NextResponse.json({ error: "Incorrect email or password." }, { status: 401 }),
    );
  }

  return copyAuthCookies(cookieCarrier, NextResponse.json({ ok: true }));
}
