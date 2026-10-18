import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";

/**
 * GET /api/auth/session — { email: string | null }.
 *
 * The only way components/layout/AuthStatus.tsx (or any other client
 * component) learns whether the visitor is logged in: this app has no
 * browser-side Supabase client (lib/authSession.ts explains why), and the
 * session cookie is httpOnly, so page JS can't just read it directly either.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, applyPendingCookies } = await getSessionUser(request.headers.get("cookie"));
  const response = NextResponse.json({ email: user?.email ?? null });
  applyPendingCookies(response);
  return response;
}
