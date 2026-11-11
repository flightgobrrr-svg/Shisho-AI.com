import type { Confidence, FieldKey, Verification } from "@/lib/clerkWork";

/**
 * The parts of Advocate Clerk Work's server logic that need no database or web
 * server: the error type the routes answer with, the field row, and how the
 * value in force and conflicts are worked out. lib/clerkStore.ts re-exports
 * these; tests import them directly.
 */

export class ClerkError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type FieldRow = {
  id: string;
  matter_id: string;
  upload_id: string | null;
  key: FieldKey;
  value: string;
  page: number | null;
  quote: string | null;
  confidence: Confidence | null;
  status: Verification;
  chosen: boolean;
  as_of: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

/** The value in force for each field: the chosen row. A field with rival values and none chosen is absent. */
export function chosenValues(rows: FieldRow[]): Partial<Record<FieldKey, FieldRow>> {
  const out: Partial<Record<FieldKey, FieldRow>> = {};
  for (const r of rows) if (r.chosen) out[r.key] = r;
  return out;
}

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Keys whose candidates disagree and none has been chosen. */
export function conflicts(rows: FieldRow[]): FieldKey[] {
  const by = new Map<FieldKey, FieldRow[]>();
  for (const r of rows) by.set(r.key, [...(by.get(r.key) ?? []), r]);
  const out: FieldKey[] = [];
  for (const [key, list] of by) {
    if (list.some((r) => r.chosen)) continue;
    if (new Set(list.map((r) => norm(r.value))).size > 1) out.push(key);
  }
  return out;
}
