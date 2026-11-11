import { createPersistedStore } from "@/state/persisted";
import type { DigestResult } from "@/api/endpoints";

/**
 * Digests the person has opened, kept on the phone so they can be read again
 * with no signal. Only curated Library digests are saved (a lookup result is
 * not). A saved copy never replaces a newer one: opening a digest online
 * refreshes it.
 */
export type SavedDigest = DigestResult & { savedAt: number };

export const digestStore = createPersistedStore<Record<string, SavedDigest>>("shisho-digests", {});

export function saveDigest(slug: string, result: DigestResult) {
  digestStore.set({ ...digestStore.get(), [slug]: { ...result, savedAt: Date.now() } });
}
