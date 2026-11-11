import { createServerClient } from "@supabase/ssr";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { VISITOR_COOKIE } from "@/lib/usageCounters";

/**
 * Shared helpers for the mobile app's endpoints (app/api/mobile/*).
 *
 * The website signs people in with httpOnly cookies (lib/authSession.ts), which
 * a native app cannot use. These helpers give the app token-based access
 * WITHOUT touching that file or the protected assistant/draft routes:
 *
 *   • Sign-in endpoints talk to Supabase Auth directly and hand back tokens.
 *   • The app stores them in the phone's secure store and sends them as
 *     `Authorization: Bearer <access>` plus `X-Refresh-Token`.
 *   • To reuse the existing assistant and review handlers unchanged, a session
 *     cookie is rebuilt from those tokens by @supabase/ssr itself (so the
 *     format is the library's own, never hand-written) and passed to them as an
 *     ordinary request.
 *
 * Secrets stay on the server. The app only ever holds a user's own tokens and
 * a random device ID.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);
export const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v.trim());

export function mobileError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** The access token from `Authorization: Bearer …`, or null. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+([A-Za-z0-9._~+/=-]{20,4096})$/);
  return match ? match[1] : null;
}

export function refreshToken(request: Request): string | null {
  const v = request.headers.get("x-refresh-token");
  return v && v.length >= 10 && v.length <= 4096 && !/\s/.test(v) ? v : null;
}

/** The app's random per-install ID; it keys the free-tier usage counter. */
export function deviceId(request: Request): string | null {
  const v = request.headers.get("x-device-id");
  return isUuid(v) ? v : null;
}

export function authEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

/** A stateless Supabase client: it keeps nothing between requests. */
export function authClient(): SupabaseClient | null {
  const env = authEnv();
  if (!env) return null;
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Where emails (confirmation, reset) should send people: the public site, never a LAN address. */
export function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export type MobileSession = {
  accessToken: string;
  refreshToken: string;
  /** Epoch seconds when the access token expires. */
  expiresAt: number;
  user: { id: string; email: string };
};

export function toMobileSession(session: Session | null): MobileSession | null {
  if (!session?.user?.email) return null;
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
    user: { id: session.user.id, email: session.user.email },
  };
}

/**
 * Builds the `Cookie` header the existing handlers expect.
 *
 * Always carries the device ID as the anonymous visitor cookie. When tokens are
 * supplied, a real session cookie is added, produced by @supabase/ssr's own
 * `setSession` so its encoding and chunking are exactly what the website's
 * `getSessionUser` reads. Returns `null` when tokens were supplied but Supabase
 * rejects them (expired or revoked), so the caller can answer 401 and the app
 * can refresh, instead of quietly treating a signed-in person as anonymous.
 */
export async function buildCookieHeader(
  device: string,
  tokens: { access: string; refresh: string } | null,
): Promise<string | null> {
  const parts = [`${VISITOR_COOKIE}=${device}`];
  if (!tokens) return parts.join("; ");

  const env = authEnv();
  if (!env) return null;

  const captured: { name: string; value: string }[] = [];
  const client = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => [],
      setAll: (list) => {
        for (const c of list) captured.push({ name: c.name, value: c.value });
      },
    },
  });

  const { error } = await client.auth.setSession({
    access_token: tokens.access,
    refresh_token: tokens.refresh,
  });
  if (error || captured.length === 0) return null;

  // The last write for each name wins, as it would in a browser.
  const latest = new Map(captured.map((c) => [c.name, c.value]));
  for (const [name, value] of latest) parts.push(`${name}=${value}`);
  return parts.join("; ");
}

/** Caps request bodies so a phone cannot make the server buffer something enormous. */
export async function readBodyText(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return null;
  const text = await request.text();
  return text.length > maxBytes ? null : text;
}

/**
 * Runs one of the website's existing POST handlers on behalf of the app.
 *
 * The handler itself is not changed or copied; it receives an ordinary request
 * whose Cookie header carries the device ID (anonymous free tier) and, when the
 * person is signed in, a session cookie rebuilt from their tokens. So the plan,
 * quota, prompts and model choice are exactly the website's.
 *
 * Any Set-Cookie the handler produces is dropped: the app keeps its own tokens
 * and refreshes them through /api/mobile/auth/refresh.
 */
export async function forwardToHandler(
  request: Request,
  handler: (r: Request) => Promise<Response>,
  path: string,
  maxBytes: number,
): Promise<Response> {
  const device = deviceId(request);
  if (!device) return mobileError(400, "Missing device ID.");

  const access = bearerToken(request);
  const refresh = refreshToken(request);
  const tokens = access && refresh ? { access, refresh } : null;
  // A half-supplied login is a mistake to report, not a reason to go anonymous.
  if ((request.headers.get("authorization") || request.headers.get("x-refresh-token")) && !tokens) {
    return mobileError(401, "Your session has ended. Sign in again.");
  }

  const body = await readBodyText(request, maxBytes);
  if (body === null) return mobileError(413, "That request is too large.");

  const cookie = await buildCookieHeader(device, tokens);
  if (cookie === null) return mobileError(401, "Your session has ended. Sign in again.");

  const response = await handler(
    new Request(new URL(path, request.url), {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body,
    }),
  );

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
