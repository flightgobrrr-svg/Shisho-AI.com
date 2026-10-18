import { createLocalStore } from "@/lib/localStore";

/**
 * Spaced revision for case briefs, kept entirely in the browser.
 *
 * A saved brief comes back after 1 day, then 7, then 30. Nothing is sent to
 * Shisho: this is localStorage (see lib/localStore.ts), so it lives on one
 * device and disappears if the browser's site data is cleared — the page
 * says so.
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

export const revisionStore = createLocalStore("shisho-revision-cards");

const DAY = 24 * 60 * 60 * 1000;
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

function current(): RevisionCard[] {
  return parseCards(revisionStore.getSnapshot());
}

export function addCard(
  card: Omit<RevisionCard, "id" | "stage" | "dueAt">,
  now = Date.now(),
) {
  const next: RevisionCard = {
    ...card,
    id: `${card.slug}-${now}`,
    stage: 0,
    dueAt: now + INTERVAL_DAYS[0] * DAY,
  };
  revisionStore.set(JSON.stringify([...current(), next]));
}

/** Mark a card reviewed: schedule the next interval, or finish it. */
export function completeReview(id: string, now = Date.now()) {
  const cards = current().map((c) => {
    if (c.id !== id) return c;
    const stage = c.stage + 1;
    return {
      ...c,
      stage,
      dueAt:
        stage < INTERVAL_DAYS.length
          ? now + INTERVAL_DAYS[stage] * DAY
          : Number.MAX_SAFE_INTEGER,
    };
  });
  revisionStore.set(JSON.stringify(cards));
}

export function removeCard(id: string) {
  revisionStore.set(JSON.stringify(current().filter((c) => c.id !== id)));
}
