import { createServerClient, parseCookieHeader, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Real user accounts (register/login/logout, password reset), built on
 * Supabase Auth against the SAME Supabase project lib/supabase.ts already
 * talks to — a separate key (SUPABASE_PUBLISHABLE_KEY), not a separate
 * service.
 *
 * Deliberately NO browser-side Supabase client anywhere in this app —
 * `@supabase/ssr` also ships `createBrowserClient` for that, but using it
 * would mean the session cookie can't be `httpOnly` (client JS needs to read
 * it), which breaks this project's existing rule that every cookie it sets
 * is httpOnly (see VISITOR_COOKIE, PLAN_COOKIE, etc.) and its stated
 * philosophy that "the app never talks to Supabase from the browser"
 * (lib/supabase.ts's own header). Going server-only here keeps both true:
 * every route below builds its own `createServerClient`, and
 * `cookieOptions.httpOnly: true` makes the session cookie exactly as
 * inaccessible to page JS as every other cookie this app sets. The cost is
 * that a page can't know "am I logged in" without asking the server —
 * GET /api/auth/session exists for exactly that (see components/layout/
 * AuthStatus.tsx).
 */

export function isAuthConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

function requireAuthEnv(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must both be set — see .env.example.",
    );
  }
  return { url, key };
}

/**
 * For routes that already have a response to attach `Set-Cookie` to
 * directly (register/login/logout/etc.) — every auth call's cookie writes
 * land straight on `response`.
 */
export function createResponseBoundAuthClient(request: Request, response: NextResponse) {
  const { url, key } = requireAuthEnv();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true },
    cookies: {
      getAll: () => parseCookieHeader(request.headers.get("cookie") ?? ""),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
}

/**
 * Most auth routes don't know their final response body (success/error
 * JSON) until after the Supabase call returns, so cookie writes go onto a
 * throwaway `NextResponse` carrier first — this copies them onto the real
 * one being returned. Without this, a token refresh or a fresh session
 * would silently vanish instead of reaching the visitor's browser.
 */
export function copyAuthCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  from.headers.forEach((value, name) => to.headers.set(name, value));
  return to;
}

export type SessionUser = { id: string; email: string };

/**
 * Read-only session check for app/api/draft/route.ts and
 * app/api/assistant/route.ts's entitlement gate, GET /api/auth/session, and
 * app/account/page.tsx. Uses `getClaims()` (locally-verified JWT, no network
 * round trip in the common case) rather than `getUser()`, per Supabase's own
 * current guidance.
 *
 * Takes the raw `Cookie` header value rather than a `Request`, so both a
 * Route Handler (`request.headers.get("cookie")`) and a Server Component
 * (`next/headers`'s `cookies()`, which has no `.headers` to read from) can
 * call this the same way — see app/account/page.tsx for the latter.
 *
 * A session nearing expiry gets silently refreshed by this call; that
 * refresh's Set-Cookie write is captured here rather than applied
 * immediately, since most callers haven't built their real response yet —
 * call `applyPendingCookies(response)` on whatever response actually gets
 * returned (a Server Component has no response to write cookies onto at
 * all, so it just accepts a refresh being silently missed — that's also
 * true, unavoidably, of any App Router Server Component that reads the
 * session, not something particular to how this file is written; the actual
 * refresh guarantee lives in the Route Handlers, which every real request
 * behind an entitlement check goes through). Missing a refresh only costs
 * one extra round trip on the visitor's next request, never a broken
 * session — same "fails soft" posture as the rest of this app's entitlement
 * plumbing.
 */
export async function getSessionUser(cookieHeader: string | null): Promise<{
  user: SessionUser | null;
  applyPendingCookies: (response: NextResponse) => void;
}> {
  const noop = () => {};

  if (!isAuthConfigured()) {
    return { user: null, applyPendingCookies: noop };
  }

  const { url, key } = requireAuthEnv();
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const pendingHeaders: Record<string, string> = {};

  const client = createServerClient(url, key, {
    cookieOptions: { httpOnly: true },
    cookies: {
      getAll: () => parseCookieHeader(cookieHeader ?? ""),
      setAll: (cookiesToSet, headers) => {
        pendingCookies.push(...cookiesToSet);
        Object.assign(pendingHeaders, headers);
      },
    },
  });

  function applyPendingCookies(response: NextResponse) {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    for (const [name, value] of Object.entries(pendingHeaders)) {
      response.headers.set(name, value);
    }
  }

  const { data, error } = await client.auth.getClaims();
  if (error || !data) return { user: null, applyPendingCookies };

  const { sub, email } = data.claims;
  const user =
    typeof sub === "string" && typeof email === "string" ? { id: sub, email } : null;
  return { user, applyPendingCookies };
}
