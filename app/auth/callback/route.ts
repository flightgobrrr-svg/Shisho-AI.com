import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/**
 * GET /auth/callback?code=...&next=... — the landing page for every
 * link-based Supabase Auth flow: a signup confirmation email
 * (app/api/auth/register/route.ts's emailRedirectTo) and a password-recovery
 * email (app/api/auth/forgot-password/route.ts's redirectTo) both point
 * here. `code` is a one-time PKCE code; exchanging it establishes the real
 * session cookie, then `next` decides where the visitor actually lands
 * (defaults to /account; forgot-password sends /reset-password instead).
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";

  if (!code || !isAuthConfigured()) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  const destination = error ? "/login?error=link-expired" : next;
  return copyAuthCookies(cookieCarrier, NextResponse.redirect(new URL(destination, url.origin)));
}
