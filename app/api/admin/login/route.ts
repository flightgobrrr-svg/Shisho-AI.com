import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkSecret, makeSessionValue } from "@/lib/adminAuth";

export const runtime = "nodejs";

/**
 * POST /api/admin/login — plain form submission (no client JS required),
 * see app/admin/login/page.tsx. Wrong secret redirects back to the login
 * page with ?error=1 rather than a JSON error, since the caller is a
 * browser form, not a fetch client.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const secret = String(form.get("secret") ?? "");

  if (!secret || !checkSecret(secret)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/review", request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, makeSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
