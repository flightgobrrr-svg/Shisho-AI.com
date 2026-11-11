/**
 * Reads one cookie's value out of a raw `Cookie` request header. Route
 * Handlers get `request.headers.get("cookie")` as a single unparsed string,
 * not a parsed jar — app/api/assistant/route.ts already does this inline as
 * a local closure (it's a protected file, not one to add an export to), and
 * the five new app/api/drive/* routes need the same lookup. A shared,
 * one-line helper beats five copies of the same split/find.
 */
export function readCookie(header: string | null, name: string): string | undefined {
  return header
    ?.split(";")
    .map((c) => c.trim().split("="))
    .find(([n]) => n === name)?.[1];
}

/** Short-lived CSRF nonce for the Drive OAuth round trip — set in
 *  app/api/drive/connect, checked and cleared in app/api/drive/callback. */
export const DRIVE_OAUTH_STATE_COOKIE = "shisho_drive_oauth_state";
