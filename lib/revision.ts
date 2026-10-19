import { createLocalStore } from "@/lib/localStore";
import {
  newCard,
  parseCards,
  reviewCard,
  type RevisionCard,
} from "@/lib/revisionCore";

/**
 * Spaced revision for case briefs on the website, kept entirely in the
 * browser (localStorage, via lib/localStore.ts). Nothing is sent to Shisho; it
 * lives on one device and disappears if the browser's site data is cleared —
 * the page says so. The scheduling rules themselves are in lib/revisionCore.ts,
 * shared with the mobile app.
 */

export type { RevisionCard } from "@/lib/revisionCore";
export { INTERVAL_DAYS, parseCards } from "@/lib/revisionCore";

export const revisionStore = createLocalStore("shisho-revision-cards");

function current(): RevisionCard[] {
  return parseCards(revisionStore.getSnapshot());
}

export function addCard(
  card: Omit<RevisionCard, "id" | "stage" | "dueAt">,
  now = Date.now(),
) {
  revisionStore.set(JSON.stringify([...current(), newCard(card, now)]));
}

export function completeReview(id: string, now = Date.now()) {
  revisionStore.set(
    JSON.stringify(current().map((c) => (c.id === id ? reviewCard(c, now) : c))),
  );
}

export function removeCard(id: string) {
  revisionStore.set(JSON.stringify(current().filter((c) => c.id !== id)));
}
