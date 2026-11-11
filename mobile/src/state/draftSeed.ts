/**
 * Hands a chosen format and the user's facts from the Formats screen to the
 * Shisho tab. Held in memory only and taken once, as the website does with
 * sessionStorage: the facts can be personal, so they never go in a route
 * parameter, are never written to disk, and are gone once read.
 */
export type DraftSeed = { formatName: string; description: string; facts: string };

let pending: DraftSeed | null = null;

export function setDraftSeed(seed: DraftSeed) {
  pending = seed;
}

/** Returns the seed once, then forgets it. */
export function takeDraftSeed(): DraftSeed | null {
  const s = pending;
  pending = null;
  return s;
}

/** The opening message, worded exactly as the website's DraftingAgent words it. */
export const seedMessage = (s: DraftSeed) =>
  `I need to draft: ${s.formatName}\n\n${s.description}\n\nFacts of the matter:\n${s.facts}`;
