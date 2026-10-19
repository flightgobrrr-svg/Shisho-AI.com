/**
 * POST /api/mobile/interest — the app's "Tell me when this opens" sign-up.
 *
 * The website's own handler, unchanged: same audience check, same honeypot,
 * same 503 until the interest_signups table exists. It lives under
 * /api/mobile only so the app's client, which prefixes every call with that
 * path, reaches it like every other endpoint.
 */
export const runtime = "nodejs";

export { POST } from "../../interest/route";
