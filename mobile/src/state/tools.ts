import { createPersistedStore } from "@/state/persisted";
import type { ToolId, ToolResult } from "@/lib/toolTypes";
import type { Sitting } from "@/lib/mockTests";

/**
 * What the Shisho tools and mock tests leave on this phone. Nothing here is
 * sent anywhere: saved results stay until the person deletes them.
 */
export type SavedResult = { id: string; tool: ToolId; title: string; savedAt: number; result: ToolResult };

export const savedResults = createPersistedStore<SavedResult[]>("shisho-tool-results", []);

export function saveResult(title: string, result: ToolResult) {
  const item: SavedResult = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, tool: result.tool, title, savedAt: Date.now(), result };
  savedResults.set([item, ...savedResults.get()].slice(0, 100));
  return item;
}

export const removeResult = (id: string) => savedResults.set(savedResults.get().filter((r) => r.id !== id));

export const sittings = createPersistedStore<Sitting[]>("shisho-mock-sittings", []);

export const addSitting = (s: Sitting) => sittings.set([s, ...sittings.get()].slice(0, 200));

/** Scholars' notes on a judgment, by Library slug. */
export const doctrineNotes = createPersistedStore<Record<string, string>>("shisho-doctrine-notes", {});
