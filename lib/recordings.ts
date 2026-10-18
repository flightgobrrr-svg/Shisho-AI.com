/**
 * English classes — two separate, ungraded recorded tracks, each deliberately
 * empty until a real recording exists:
 *
 *   - LEGAL_ENGLISH_LESSONS (/courses/english) — reading and writing: judgments,
 *     pleadings, the written register an Indian courtroom expects on paper.
 *   - SPOKEN_ENGLISH_LESSONS (/courses/spoken-english) — oral argument:
 *     submissions out loud, being understood the first time, the register
 *     that same courtroom expects when you're on your feet.
 *
 * Split into two tracks (rather than one "reading, writing and arguing" list)
 * because reading/writing and speaking are different skills a student may
 * need to work on independently — someone confident on paper can still need
 * real practice arguing out loud, and vice versa.
 *
 * This file is the whole mechanism for adding a class to either: no upload
 * flow, no storage account, no auth system (this project has none) — the
 * owner uploads a video to YouTube or Vimeo as unlisted, then a new entry
 * here is the class going live. Nothing is invented to fill either list; an
 * empty array renders an honest empty state on its page rather than a
 * placeholder lesson.
 *
 * `videoId` is the YouTube/Vimeo id only (e.g. "dQw4w9WgXcQ" from
 * https://youtu.be/dQw4w9WgXcQ), not a full URL — the player embeds build
 * the rest of the src from `provider` + `videoId`.
 */

export type Lesson = {
  id: string;
  title: string;
  /** One or two sentences: what this class actually covers. */
  description: string;
  provider: "youtube" | "vimeo";
  videoId: string;
  /** "18:32" style, as the source video reports it. */
  duration: string;
};

export const LEGAL_ENGLISH_LESSONS: Lesson[] = [];
export const SPOKEN_ENGLISH_LESSONS: Lesson[] = [];

export function embedUrl(lesson: Lesson): string {
  return lesson.provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${lesson.videoId}`
    : `https://player.vimeo.com/video/${lesson.videoId}`;
}

/**
 * Live classes — scheduled sessions, not a recording to embed. Same rule as
 * the lesson arrays above: empty until a real session is actually scheduled,
 * with an honest empty state on the page rather than an invented date.
 *
 * `joinUrl` stays optional and is left unset until real logistics exist
 * (a Zoom/Meet link, a YouTube Live premiere) — a session can be announced
 * with a date before there's a link to join it yet.
 */
export type LiveSession = {
  id: string;
  title: string;
  /** One or two sentences: what this session actually covers. */
  description: string;
  /** ISO 8601 date-time. This project's whole audience is in India, so
   *  every page renders this in IST regardless of the visitor's own locale
   *  — a class time shouldn't shift depending on who's looking at it. */
  startsAt: string;
  /** "90 min" style planned duration. */
  duration: string;
  joinUrl?: string;
};

export const LEGAL_ENGLISH_LIVE_SESSIONS: LiveSession[] = [];
export const SPOKEN_ENGLISH_LIVE_SESSIONS: LiveSession[] = [];

/** IST is a fixed +5:30 offset with no DST — Intl's own "Asia/Kolkata` zone
 *  is still the correct way to render it, since it also gets the day-of-week
 *  and month names right without a manual offset calculation. */
export function formatSessionTime(startsAt: string): string {
  return new Date(startsAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
