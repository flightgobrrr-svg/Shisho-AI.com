/**
 * The spaced-revision rules, with no storage and no browser APIs, so the
 * website (lib/revision.ts, localStorage) and the mobile app (AsyncStorage)
 * share one definition and one set of tests.
 *
 * A saved brief comes back after 1 day, then 7, then 30. `stage` counts the
 * reviews completed (0, 1, 2); a finished card has stage 3 and never comes due.
 */

export type RevisionCard = {
  id: string;
  title: string;
  slug: string;
  facts: string;
  issue: string;
  held: string;
  ratio: string;
  /** How many reviews have been completed: 0, 1, 2; 3 means finished. */
  stage: number;
  /** Epoch ms when the card is next due. */
  dueAt: number;
};

export const DAY_MS = 24 * 60 * 60 * 1000;
export const INTERVAL_DAYS = [1, 7, 30];

export function parseCards(raw: string | null | undefined): RevisionCard[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function newCard(
  card: Omit<RevisionCard, "id" | "stage" | "dueAt">,
  now = Date.now(),
): RevisionCard {
  return {
    ...card,
    id: `${card.slug}-${now}`,
    stage: 0,
    dueAt: now + INTERVAL_DAYS[0] * DAY_MS,
  };
}

/** Mark one card reviewed: schedule the next interval, or finish it. */
export function reviewCard(card: RevisionCard, now = Date.now()): RevisionCard {
  const stage = card.stage + 1;
  return {
    ...card,
    stage,
    dueAt:
      stage < INTERVAL_DAYS.length
        ? now + INTERVAL_DAYS[stage] * DAY_MS
        : Number.MAX_SAFE_INTEGER,
  };
}

export const isFinished = (c: RevisionCard) => c.stage >= INTERVAL_DAYS.length;
export const isDue = (c: RevisionCard, now = Date.now()) => !isFinished(c) && c.dueAt <= now;
