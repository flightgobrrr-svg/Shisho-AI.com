import type { Href } from "expo-router";

/**
 * The audience data (lib/audiences.ts, lib/audiencePages.ts, lib/nav.ts) is
 * the website's, shared so the app and the site never disagree. Its links are
 * website paths; this turns one into the app screen that does the same job,
 * or null when the app has no such screen (then the row says so instead of
 * opening something else).
 */
const EXACT: Record<string, string> = {
  "/draft-bot": "/shisho",
  "/clerks": "/clerks",
  "/courses": "/courses",
  "/courses/moot": "/moot",
  "/courses/revision": "/revision",
  "/courses/case-brief": "/case-brief",
  "/courses/english": "/classes/legal",
  "/courses/spoken-english": "/classes/spoken",
  "/documents": "/documents",
  "/map": "/map",
  "/library": "/library",
  "/library/lookup": "/library/lookup",
  "/limitation": "/limitation",
  "/ipc-bns": "/ipc-bns",
};

export function appRoute(siteHref: string | undefined): Href | null {
  if (!siteHref) return null;
  const [path, rest = ""] = siteHref.split("?");
  const query = rest.split("#")[0];
  if (path.startsWith("/for/")) return path as Href;
  // Shisho's two modes, and hearing prep, carry over to the Shisho tab.
  if (path.split("#")[0] === "/draft-bot") {
    if (query.includes("prep=hearing")) return "/shisho?mode=hearing" as Href;
    if (query.includes("mode=review")) return "/shisho?mode=review" as Href;
    return "/shisho" as Href;
  }
  const mapped = EXACT[path];
  return mapped ? (mapped as Href) : null;
}
