import { LIMITATION_ENTRIES } from "@/lib/limitation";
import type { AudienceItem } from "@/lib/audiencePages";

/**
 * Small corrections the app applies to copy it shares with the website
 * (lib/status.ts, lib/audiencePages.ts) when that copy has fallen behind the
 * data. The shared files are left alone while the website is not being
 * changed; once they are fixed there, each rule here simply stops matching.
 */
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

const ARTICLES = LIMITATION_ENTRIES.filter((e) => e.article.startsWith("Article")).length;
const articleWords = NUMBER_WORDS[ARTICLES] ?? String(ARTICLES);

/** "twelve Articles of the Limitation Act" → the real count from lib/limitation.ts. */
export const correctNote = (note: string) => note.replace(/\b\w+ Articles of the Limitation Act/, `${articleWords} Articles of the Limitation Act`);

export const correctItems = (items: AudienceItem[]) => items.map((i) => ({ ...i, note: correctNote(i.note) }));
