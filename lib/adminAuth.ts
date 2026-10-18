import { createHmac, timingSafeEqual } from "crypto";

/**
 * The review-queue's whole auth model: one shared secret (REVIEW_SECRET),
 * known only to the owner, exchanged for a signed session cookie. No user
 * accounts, no database of credentials — this project has no auth system at
 * all, and a single-reviewer internal tool doesn't need one. Same trust
 * model as CRON_SECRET already uses for the ingestion route, just for a
 * human instead of a scheduler.
 *
 * The cookie never carries the raw secret — it carries an HMAC of a fixed
 * label, keyed by the secret. That's what proxy.ts and every admin route
 * re-derive and compare against, so nothing that could reset the secret to
 * "known" ever crosses the network more than once, at login.
 */

const COOKIE_NAME = "shisho_admin_session";
const SESSION_LABEL = "admin-session-v1";

function reviewSecret(): string {
  const secret = process.env.REVIEW_SECRET;
  if (!secret) {
    throw new Error("REVIEW_SECRET must be set — see .env.example.");
  }
  return secret;
}

function sessionToken(secret: string): string {
  return createHmac("sha256", secret).update(SESSION_LABEL).digest("hex");
}

/** Constant-time comparison — see lib/adminAuth.ts's own header for why this matters here. */
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;

/** True only if `submitted` matches REVIEW_SECRET exactly. */
export function checkSecret(submitted: string): boolean {
  return safeEqual(submitted, reviewSecret());
}

/** The cookie value a successful login should set. */
export function makeSessionValue(): string {
  return sessionToken(reviewSecret());
}

/** True only if `cookieValue` is the current session token — re-derived, never stored. */
export function isValidSession(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  return safeEqual(cookieValue, sessionToken(reviewSecret()));
}
