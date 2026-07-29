/**
 * Shared types for the Draft Bot, plus the DEMO-MODE annotation engine.
 *
 * Demo mode exists so the interface is fully testable before a model is
 * connected. It is a small set of hand-written rules keyed to phrases that
 * actually appear in Indian pleadings — it is pattern matching, not analysis,
 * and the UI labels it DEMO wherever it is used. It must never be presented
 * as model output.
 */

export const DOC_TYPES = ["plaint", "notice", "application", "contract"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  plaint: "Plaint",
  notice: "Legal notice",
  application: "Interlocutory application",
  contract: "Contract",
};

export type Severity = "must-fix" | "consider" | "good";

export type Annotation = {
  id: string;
  /** An exact substring of the submitted draft, so the UI can highlight it. */
  anchor: string;
  severity: Severity;
  note: string;
  /** Optional Indian statute or reported case. */
  authority?: string;
};

export type DraftResponse = {
  mode: "demo" | "live";
  annotations: Annotation[];
};

export const MAX_DRAFT_CHARS = 20_000;

export function isDocType(value: unknown): value is DocType {
  return typeof value === "string" && (DOC_TYPES as readonly string[]).includes(value);
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  "must-fix": "Must fix",
  consider: "Consider",
  good: "Good",
};

/* ==========================================================================
   DEMO MODE
   ========================================================================== */

type Rule = {
  id: string;
  /** Restrict a rule to certain document types; omit for all. */
  docTypes?: DocType[];
  /** Returns the exact anchor text if the rule fires, else null. */
  match: (draft: string) => string | null;
  severity: Severity;
  note: string;
  authority?: string;
};

/** Returns the literal matched text, so the anchor is always a real substring. */
function firstMatch(draft: string, re: RegExp): string | null {
  const m = draft.match(re);
  return m ? m[0] : null;
}

/**
 * Anchors a note to the tail of the draft — used by rules that fire on the
 * *absence* of something, which have no phrase of their own to point at.
 * Snaps forward to a word boundary so the quoted anchor never starts
 * mid-word, and stays an exact substring so highlighting still works.
 */
function tailAnchor(draft: string, length = 60): string | null {
  const trimmed = draft.trim();
  if (!trimmed) return null;
  if (trimmed.length <= length) return trimmed;

  const tail = trimmed.slice(-length);
  const space = tail.indexOf(" ");
  return space === -1 ? tail : tail.slice(space + 1);
}

const RULES: Rule[] = [
  {
    id: "art-226-jurisdiction",
    match: (d) => firstMatch(d, /Article\s*226/i),
    severity: "must-fix",
    note: "Plead territorial jurisdiction expressly. A writ court will not assume it — state where the cause of action arose.",
    authority: "Art. 226(2), Constitution of India",
  },
  {
    id: "interim-relief-triad",
    match: (d) => firstMatch(d, /injunction|stay of|interim relief/i),
    severity: "must-fix",
    note: "For interim relief you must plead all three limbs: a prima facie case, balance of convenience, and irreparable injury. Missing any one is the usual ground for refusal.",
    authority: "Order XXXIX Rr. 1–2, CPC 1908",
  },
  {
    id: "alternate-remedy",
    match: (d) => firstMatch(d, /alternat\w*\s+remedy|efficacious remedy/i),
    severity: "good",
    note: "Good — dealing with alternate remedy before the prayer is right. That objection is almost always taken at the threshold.",
  },
  {
    id: "verification",
    docTypes: ["plaint", "application"],
    match: (d) => (/verif(y|ied|ication)/i.test(d) ? null : tailAnchor(d)),
    severity: "must-fix",
    note: "No verification clause. Every pleading must be verified at its foot, stating which paragraphs are true to knowledge and which to information believed to be true.",
    authority: "Order VI R. 15, CPC 1908",
  },
  {
    id: "omnibus-prayer",
    match: (d) => firstMatch(d, /PRAYER|most respectfully prayed/i),
    severity: "consider",
    note: "Keep the prayer specific and severable. An omnibus prayer invites an objection at the admission stage and gives the Court no clear relief to grant.",
  },
  {
    id: "indemnity-scope",
    docTypes: ["contract"],
    match: (d) => firstMatch(d, /indemnif\w+|indemnity/i),
    severity: "consider",
    note: "State whose conduct the indemnity covers. Under Indian law an indemnity runs to loss caused by the promisor or any other person — leaving it unstated invites a dispute on scope.",
    authority: "s. 124, Indian Contract Act 1872",
  },
  {
    id: "notice-period",
    docTypes: ["notice"],
    match: (d) => firstMatch(d, /within\s+\d+\s+days|statutory notice/i),
    severity: "consider",
    note: "Check the notice period against the governing statute rather than convention — where a suit is against the Government, two months' notice is mandatory.",
    authority: "s. 80, CPC 1908",
  },
];

const MAX_DEMO_NOTES = 4;

export function demoAnnotate(draft: string, docType: DocType): Annotation[] {
  const annotations: Annotation[] = [];

  for (const rule of RULES) {
    if (annotations.length >= MAX_DEMO_NOTES) break;
    if (rule.docTypes && !rule.docTypes.includes(docType)) continue;

    const anchor = rule.match(draft);
    if (!anchor) continue;

    annotations.push({
      id: rule.id,
      anchor,
      severity: rule.severity,
      note: rule.note,
      authority: rule.authority,
    });
  }

  if (annotations.length === 0) {
    annotations.push({
      id: "demo-no-match",
      anchor: draft.trim().slice(0, 48),
      severity: "consider",
      note: "Demo mode matched none of its sample patterns against this draft. Connect a model to get a real clause-level review.",
    });
  }

  return annotations;
}
