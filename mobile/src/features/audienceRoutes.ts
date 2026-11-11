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
  "/pricing": "/pricing",
  "/draft-bot/formats": "/formats",
  "/library/acts": "/library/acts",
  "/internship": "/internship",
  "/contact": "/contact",
  "/about": "/info/about",
  "/how-it-works": "/info/how",
  "/status": "/works-today",
  "/corrections": "/info/corrections",
  "/terms": "/info/terms",
  "/privacy": "/info/privacy",
  "/refund": "/info/refund",
  "/": "/",
};

export function appRoute(siteHref: string | undefined): Href | null {
  if (!siteHref) return null;
  // App-only screens, listed alongside website links (e.g. in the Menu).
  if (siteHref.startsWith("app:")) return siteHref.slice(4) as Href;
  if (siteHref === "/#audiences") return "/for" as Href;
  const [rawPath, rest = ""] = siteHref.split("?");
  const [path, hash = ""] = rawPath.split("#");
  const query = rest.split("#")[0];
  // The two course tracks have their own screens in the app.
  if (path === "/courses" && (hash === "starter" || hash === "proficient")) return `/courses/${hash}` as Href;
  if (path.startsWith("/for/")) return path as Href;
  // Shisho's two modes, and hearing prep, carry over to the Shisho tab.
  if (path.split("#")[0] === "/draft-bot") {
    if (query.includes("prep=hearing")) return "/shisho?mode=hearing" as Href;
    if (query.includes("mode=review")) return "/shisho?mode=review" as Href;
    return "/shisho" as Href;
  }
  // Each limitation Article and IPC section has its own screen, as on the site.
  if (/^\/(limitation|ipc-bns)\/[^/]+$/.test(path)) return path as Href;
  if (path === "/library" && query.includes("collection=acts")) return "/library/provisions" as Href;
  const mapped = EXACT[path];
  return mapped ? (mapped as Href) : null;
}
