/**
 * The public "Corrections and known gaps" log (/corrections).
 *
 * Two kinds of entry, kept honest and short:
 *   gap        — something Shisho deliberately does not cover, or covers only
 *                in part, and why. These are not bugs; they are the edges.
 *   correction — a published statement that was wrong and has been fixed.
 *
 * Add a correction the day it is made, with the date, what was wrong and what
 * it says now. Do not delete old entries; a log that quietly loses its history
 * is not a log. No correction has been needed yet, so none is listed: this
 * page does not invent one.
 */

export type LogEntry = {
  kind: "gap" | "correction";
  /** ISO date the entry was added. */
  date: string;
  title: string;
  body: string;
};

export const LOG: LogEntry[] = [
  {
    kind: "gap",
    date: "2026-10-18",
    title: "IPC to BNS: rape (IPC 376) is not in the table",
    body: "Two published conversion tables disagree on the BNS section for IPC 376, and the sexual-offences chapter was reorganised. It is left out rather than guessed. Check the Sanhita directly.",
  },
  {
    kind: "gap",
    date: "2026-10-18",
    title: "IPC to BNS: sedition (IPC 124A) is not in the table",
    body: "BNS section 152 is sometimes listed as its replacement, but it is a different offence, not a renumbering. It is left out.",
  },
  {
    kind: "gap",
    date: "2026-10-18",
    title: "Limitation checker: commercial suits",
    body: "The written-statement entry follows Order VIII Rule 1 CPC (thirty days, up to ninety). Commercial suits have different rules and are not covered. The checker also does not apply the sections that extend or exclude time (sections 5, 12, 14, 18), or special statutes with their own periods.",
  },
  {
    kind: "gap",
    date: "2026-10-18",
    title: "Court fees are not covered",
    body: "Court fees come from each state's own Act, and there is no verified source here for them, so there is no estimator.",
  },
  {
    kind: "gap",
    date: "2026-10-18",
    title: "Model-written drafts and notes are not checked automatically",
    body: "Shisho is told never to invent a case or a section, and to leave a gap rather than guess. But a draft or a review note written by the model is not verified against a source for you. Read it, and check each authority, before you file.",
  },
  {
    kind: "gap",
    date: "2026-10-18",
    title: "Demo mode",
    body: "When no model is connected, Shisho runs in demo mode and labels it. Demo notes come from a small set of sample patterns, not from reading your draft.",
  },
];
