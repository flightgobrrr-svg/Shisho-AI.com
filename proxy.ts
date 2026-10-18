import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (the exported function
 * too: `middleware` -> `proxy`) — see AGENTS.md's warning that this Next
 * version has breaking changes vs. training data. Checked
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 * before writing this; a file literally named middleware.ts would have been
 * silently ignored by the router in this version.
 *
 * Gates /admin/review (and anything else added under /admin later, except
 * the login page/route themselves) behind the shared-secret session cookie
 * from lib/adminAuth.ts. This is the OUTER check — every admin Route
 * Handler and Server Component re-checks the same session itself too,
 * per Next's own guidance in that doc: "Always verify authentication and
 * authorization inside each Server Function rather than relying on Proxy
 * alone," since a matcher change later could silently drop coverage here
 * without anyone noticing.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSession(session)) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
