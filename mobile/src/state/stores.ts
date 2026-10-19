import {
  isDue,
  newCard,
  reviewCard,
  type RevisionCard,
} from "@/lib/revisionCore";
import { createPersistedStore } from "@/state/persisted";
import { syncRevisionReminder } from "@/state/reminders";

/* ---- Saved case briefs, brought back after 1, 7 and 30 days ---- */

export const revisionStore = createPersistedStore<RevisionCard[]>("shisho-revision-cards", []);

function setCards(cards: RevisionCard[]) {
  revisionStore.set(cards);
  void syncRevisionReminder(cards);
}

export function saveBrief(card: Omit<RevisionCard, "id" | "stage" | "dueAt">) {
  setCards([...revisionStore.get(), newCard(card)]);
}

export function markReviewed(id: string) {
  setCards(revisionStore.get().map((c) => (c.id === id ? reviewCard(c) : c)));
}

export function removeBrief(id: string) {
  setCards(revisionStore.get().filter((c) => c.id !== id));
}

export const dueCount = (cards: RevisionCard[], now = Date.now()) =>
  cards.filter((c) => isDue(c, now)).length;

/* ---- The moot team's own rules, ticked off before submitting ---- */

export type MootRule = { id: string; text: string; done: boolean };

export const mootStore = createPersistedStore<MootRule[]>("shisho-moot-rules", []);

/* ---- First-run welcome screen ---- */

export const welcomeStore = createPersistedStore<{ seen: boolean }>("shisho-welcome", { seen: false });
