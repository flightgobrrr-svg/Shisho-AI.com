/**
 * The document model every typed clerk-work service produces. A service
 * composes one `ComposedDoc` from the confirmed case particulars and its own
 * inputs (lib/clerkServices.ts); lib/clerkRender.ts turns it into the PDF and
 * the editable Word file. No server imports, so tests and the app can use it.
 */

export type Block =
  | { type: "para"; text: string; numbered?: boolean; indent?: boolean }
  | { type: "heading"; text: string }
  | { type: "lines"; lines: string[] }
  | { type: "kv"; rows: [string, string][] }
  | { type: "table"; columns: string[]; rows: string[][]; widths?: number[] }
  /** An empty, labelled space kept for a hand: signature, acceptance, attestation, registry. */
  | { type: "space"; label: string; height?: number; align?: "left" | "right" }
  | { type: "note"; text: string };

export type ComposedDoc = {
  /** The court, case number and parties at the head of a court paper. */
  causeTitle: boolean;
  /** "To," lines for an application to an officer (copying section, registry). */
  addressee?: string[];
  title: string;
  subtitle?: string;
  blocks: Block[];
  /** Place and date lines at the foot. */
  placeDate?: boolean;
  /** Add the office backside docket after the paper. */
  docket?: boolean;
  /** Shown to the person in the report, never printed on the paper. */
  warnings: string[];
};

/** A register row a service files as it is generated (a receipt, a dispatch, a collection). */
export type AutoEntry = { kind: string; data: Record<string, string> };

/** A hearing a service records (Case Diary Update, Hearing Result Entry). */
export type AutoHearing = {
  hearing_on: string;
  purpose?: string;
  result: string;
  source: "clerk_report" | "court_order";
  next_on?: string | null;
  next_purpose?: string;
  directions?: string;
};
