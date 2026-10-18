import { NextResponse } from "next/server";
import {
  copyAuthCookies,
  createResponseBoundAuthClient,
  isAuthConfigured,
} from "@/lib/authSession";

/** POST /api/auth/logout — clears the session cookie via Supabase Auth signOut. */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const cookieCarrier = new NextResponse();
  const supabase = createResponseBoundAuthClient(request, cookieCarrier);
  await supabase.auth.signOut();

  return copyAuthCookies(cookieCarrier, NextResponse.json({ ok: true }));
}
