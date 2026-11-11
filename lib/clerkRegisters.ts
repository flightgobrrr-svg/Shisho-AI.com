/**
 * Advocate Clerk Work: the registers, tasks and hearings, as one typed
 * configuration shared by the server and the app (no server imports here).
 *
 * A register entry is a row in `clerk_entries` with a `kind` and its fields in
 * `data`; the fields of each kind are defined once below and validated on the
 * server with `cleanEntry`. Services that record one event (a document
 * receipt, a copy collected, a witness's attendance) also file an entry in
 * the matching register, so the registers fill themselves as forms are made.
 */

export type EntryFieldType = "text" | "long" | "date" | "money" | "number" | "choice" | "yesno";
export type EntryField = { key: string; label: string; type: EntryFieldType; options?: readonly string[]; required?: boolean; hint?: string };

export const REGISTER_KINDS = ["filing", "objection", "service", "copy", "custody", "expense", "attendance"] as const;
export type RegisterKind = (typeof REGISTER_KINDS)[number];
export const isRegisterKind = (v: unknown): v is RegisterKind => typeof v === "string" && (REGISTER_KINDS as readonly string[]).includes(v);

export type RegisterDef = {
  kind: RegisterKind;
  title: string;
  /** What one row is. */
  noun: string;
  blurb: string;
  fields: EntryField[];
  /** The field shown as the row's title, and the one that orders the register. */
  titleField: string;
  dateField: string;
  /** Which field carries the row's state, if any, and which values still need work. */
  statusField?: string;
  openStatuses?: readonly string[];
};

const FILING_STATUS = ["Prepared", "Submitted", "Under scrutiny", "Objections raised", "Re-presented", "Registered", "Numbered", "Returned"] as const;
const SERVICE_STATUS = ["To be dispatched", "Dispatched", "Delivered (acknowledged)", "Returned unserved", "Refused (endorsed)", "Status unknown"] as const;
const COPY_STATUS = ["Applied", "Call for stamps / fees", "Ready", "Collected"] as const;
const ATTENDANCE_STATUS = ["To be informed", "Informed", "Attended", "Did not attend"] as const;

export const REGISTERS: RegisterDef[] = [
  {
    kind: "filing",
    title: "Filing register",
    noun: "filing",
    blurb: "Every paper presented: filing, SR or diary number, scrutiny, re-presentation and the number assigned.",
    titleField: "document",
    dateField: "filed_on",
    statusField: "status",
    openStatuses: ["Prepared", "Submitted", "Under scrutiny", "Objections raised", "Re-presented", "Returned"],
    fields: [
      { key: "document", label: "Paper filed", type: "text", required: true, hint: "e.g. I.A. for injunction with affidavit" },
      { key: "filed_on", label: "Filed on", type: "date", required: true },
      { key: "filing_number", label: "Filing / SR / diary number", type: "text" },
      { key: "status", label: "Status", type: "choice", options: FILING_STATUS, required: true },
      { key: "returned_on", label: "Returned on", type: "date" },
      { key: "represented_on", label: "Re-presented on", type: "date" },
      { key: "number_assigned", label: "Number assigned", type: "text" },
      { key: "acknowledgment", label: "Acknowledgment received", type: "yesno" },
      { key: "remarks", label: "Remarks", type: "long" },
    ],
  },
  {
    kind: "objection",
    title: "Scrutiny objections",
    noun: "objection",
    blurb: "Each registry objection as written, the correction, who does it and by when.",
    titleField: "objection",
    dateField: "raised_on",
    statusField: "status",
    openStatuses: ["Open"],
    fields: [
      { key: "objection", label: "Objection, exactly as written", type: "long", required: true },
      { key: "raised_on", label: "Raised on", type: "date", required: true },
      { key: "paper", label: "Paper objected to", type: "text" },
      { key: "action", label: "Corrective action", type: "long" },
      { key: "responsible", label: "Responsible", type: "text" },
      { key: "due_on", label: "Due by", type: "date" },
      { key: "status", label: "Status", type: "choice", options: ["Open", "Corrected", "Not accepted by registry"], required: true },
      { key: "supporting", label: "Supporting document", type: "text" },
    ],
  },
  {
    kind: "service",
    title: "Process and service register",
    noun: "process",
    blurb: "Each process or notice: recipient, address, dispatch, delivery, return and the endorsement, kept apart.",
    titleField: "recipient",
    dateField: "dispatched_on",
    statusField: "status",
    openStatuses: ["To be dispatched", "Dispatched", "Returned unserved", "Status unknown"],
    fields: [
      { key: "recipient", label: "Recipient", type: "text", required: true },
      { key: "capacity", label: "Procedural description", type: "text", hint: "e.g. Respondent No. 2, Witness" },
      { key: "process_type", label: "Process / mode", type: "choice", options: ["Summons", "Notice", "Warrant", "Registered post (RPAD)", "Speed post", "Court process server", "Hand delivery", "Email (as permitted)", "Other"], required: true },
      { key: "address", label: "Complete address with PIN", type: "long", required: true },
      { key: "order_date", label: "Order directing it", type: "date" },
      { key: "returnable_on", label: "Returnable on", type: "date" },
      { key: "dispatched_on", label: "Dispatched on", type: "date" },
      { key: "article_number", label: "Article / receipt number", type: "text" },
      { key: "fee", label: "Process fee / batta", type: "money" },
      { key: "status", label: "Status", type: "choice", options: SERVICE_STATUS, required: true },
      { key: "delivered_on", label: "Delivered on (per acknowledgment)", type: "date" },
      { key: "endorsement", label: "Postal / process endorsement, verbatim", type: "long" },
      { key: "next_action", label: "Further action", type: "text" },
    ],
  },
  {
    kind: "copy",
    title: "Certified copies",
    noun: "copy application",
    blurb: "Copy applications, their status in the copying section, and who collected what.",
    titleField: "documents",
    dateField: "applied_on",
    statusField: "status",
    openStatuses: ["Applied", "Call for stamps / fees"],
    fields: [
      { key: "documents", label: "Documents applied for", type: "long", required: true, hint: "judgment, decree, order, deposition, exhibit; with dates" },
      { key: "application_number", label: "Copy application number", type: "text" },
      { key: "applied_on", label: "Applied on", type: "date", required: true },
      { key: "urgent", label: "Urgent", type: "yesno" },
      { key: "status", label: "Status", type: "choice", options: COPY_STATUS, required: true },
      { key: "fees", label: "Copying charges", type: "money" },
      { key: "pages", label: "Certified pages", type: "number" },
      { key: "collected_on", label: "Collected on", type: "date" },
      { key: "collected_by", label: "Collected by", type: "text" },
    ],
  },
  {
    kind: "custody",
    title: "Documents and originals",
    noun: "document",
    blurb: "Every document held: original or copy, pages, condition, where it is, who has it, production and return.",
    titleField: "document",
    dateField: "received_on",
    statusField: "where",
    openStatuses: ["In office", "With advocate", "Produced in court"],
    fields: [
      { key: "document", label: "Document", type: "text", required: true },
      { key: "document_date", label: "Document's date", type: "text" },
      { key: "original", label: "Original", type: "yesno", required: true },
      { key: "pages", label: "Pages", type: "number" },
      { key: "condition", label: "Condition", type: "text" },
      { key: "received_from", label: "Received from", type: "text" },
      { key: "received_on", label: "Received on", type: "date", required: true },
      { key: "where", label: "Now", type: "choice", options: ["In office", "With advocate", "Produced in court", "Returned to party"], required: true },
      { key: "location", label: "Storage location", type: "text" },
      { key: "exhibit", label: "Exhibit marking (only as marked by the court)", type: "text" },
      { key: "movements", label: "Movement history", type: "long" },
    ],
  },
  {
    kind: "expense",
    title: "Expenses",
    noun: "expense",
    blurb: "Court fee, process fee, copying, postage and other spend, with receipts; actual spend kept apart from costs claimed.",
    titleField: "purpose",
    dateField: "spent_on",
    fields: [
      { key: "purpose", label: "Purpose", type: "text", required: true },
      { key: "head", label: "Head", type: "choice", options: ["Court fee", "Process fee / batta", "Copying charges", "Postage", "Stamp paper", "Notary / attestation", "Witness expenses", "Court-ordered deposit", "Travel", "Advance received", "Other"], required: true },
      { key: "spent_on", label: "Date", type: "date", required: true },
      { key: "amount", label: "Amount (₹)", type: "money", required: true },
      { key: "mode", label: "Paid by", type: "choice", options: ["Cash", "Bank challan", "e-Challan / online", "Treasury", "UPI", "Cheque / DD", "Other"] },
      { key: "reference", label: "Challan / transaction / receipt number", type: "text" },
      { key: "receipt", label: "Receipt held", type: "yesno" },
      { key: "nature", label: "Actual or claimed", type: "choice", options: ["Actual expenditure", "Cost claimed"], required: true },
    ],
  },
  {
    kind: "attendance",
    title: "Client and witness attendance",
    noun: "attendance",
    blurb: "Who must attend which hearing, when to report, what to bring, and whether they came.",
    titleField: "person",
    dateField: "hearing_on",
    statusField: "status",
    openStatuses: ["To be informed", "Informed"],
    fields: [
      { key: "person", label: "Name", type: "text", required: true },
      { key: "role", label: "Attends as", type: "choice", options: ["Client", "Witness", "Other"], required: true },
      { key: "hearing_on", label: "Hearing date", type: "date", required: true },
      { key: "reporting_time", label: "Reporting time", type: "text" },
      { key: "bring", label: "Documents to bring", type: "long" },
      { key: "contact", label: "Contact", type: "text" },
      { key: "status", label: "Status", type: "choice", options: ATTENDANCE_STATUS, required: true },
      { key: "authorised", label: "Witness expenses authorised (₹)", type: "money" },
      { key: "paid", label: "Paid (₹)", type: "money" },
    ],
  },
];

export const getRegister = (k: RegisterKind) => REGISTERS.find((r) => r.kind === k)!;

/* --------------------------------------------------------------- tasks */

export const TASK_STATUSES = [
  "not_started",
  "assigned",
  "in_progress",
  "awaiting_information",
  "ready_for_review",
  "corrections_required",
  "approved",
  "completed",
  "returned_defective",
  "re_presented",
  "closed",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const isTaskStatus = (v: unknown): v is TaskStatus => typeof v === "string" && (TASK_STATUSES as readonly string[]).includes(v);
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  assigned: "Assigned",
  in_progress: "In Progress",
  awaiting_information: "Awaiting Information",
  ready_for_review: "Ready for Advocate Review",
  corrections_required: "Corrections Required",
  approved: "Approved",
  completed: "Filed or Completed",
  returned_defective: "Returned or Defective",
  re_presented: "Re-Presented",
  closed: "Closed",
};
/** Statuses that need no further work. */
export const DONE_STATUSES: TaskStatus[] = ["completed", "closed"];
/** Only an advocate or the administrator may set these. */
export const ADVOCATE_STATUSES: TaskStatus[] = ["approved", "corrections_required"];

export const TASK_SLOTS = ["before_court", "during_court", "after_court", "evening", "tomorrow"] as const;
export type TaskSlot = (typeof TASK_SLOTS)[number];
export const isTaskSlot = (v: unknown): v is TaskSlot => typeof v === "string" && (TASK_SLOTS as readonly string[]).includes(v);
export const TASK_SLOT_LABELS: Record<TaskSlot, string> = {
  before_court: "Before Court",
  during_court: "During Court",
  after_court: "After Court",
  evening: "Evening Follow-Up",
  tomorrow: "Tomorrow's Preparation",
};

/* ------------------------------------------------------------ hearings */

/** Where a hearing result came from. A clerk's oral report is never treated as the court's own order. */
export const HEARING_SOURCES = ["clerk_report", "court_order"] as const;
export type HearingSource = (typeof HEARING_SOURCES)[number];
export const HEARING_SOURCE_LABELS: Record<HearingSource, string> = {
  clerk_report: "Clerk's report (unconfirmed)",
  court_order: "Court's order / proceedings",
};

/* --------------------------------------------------------------- dates */

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

/**
 * A date as Indian court papers write it (14-11-2026, 14/11/2026, 14.11.2026,
 * 14 Nov 2026, 2026-11-14), as YYYY-MM-DD, or null when it cannot be read
 * with certainty. Day-first throughout; nothing is guessed.
 */
export function parseIndianDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1");
  let y: number, m: number, d: number;
  let r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (r) [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = s.match(/^(\d{1,2})[\s-]+([a-z]{3,9})[,\s-]+(\d{4})$/)) && MONTHS[r[2].slice(0, r[2] === "sept" ? 4 : 3)]) {
    [d, m, y] = [Number(r[1]), MONTHS[r[2].slice(0, 3)], Number(r[3])];
  } else return null;
  if (m < 1 || m > 12 || d < 1 || y < 1950 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Today in India (the office's working day), as YYYY-MM-DD. */
export function indiaToday(now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** 14-11-2026 */
export const showDate = (iso: string | null | undefined) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}` : (iso ?? ""));

/* ---------------------------------------------------------- validation */

/** A register entry's fields, trimmed and checked; or an error message. */
export function cleanEntry(kind: RegisterKind, raw: Record<string, unknown>): { data: Record<string, string>; date: string | null; amount: number | null; status: string | null } | string {
  const def = getRegister(kind);
  const data: Record<string, string> = {};
  for (const f of def.fields) {
    const v = raw[f.key];
    let s = typeof v === "string" ? v.trim() : typeof v === "number" || typeof v === "boolean" ? String(v) : "";
    if (f.type === "long") s = s.slice(0, 4000);
    else s = s.slice(0, 500);
    if (!s) {
      if (f.required) return `${f.label} is needed.`;
      continue;
    }
    if (f.type === "date") {
      const iso = parseIndianDate(s);
      if (!iso) return `${f.label}: give the date as DD-MM-YYYY.`;
      s = iso;
    }
    if (f.type === "money" || f.type === "number") {
      const n = Number(s.replace(/[,₹\s]/g, ""));
      if (!Number.isFinite(n) || n < 0) return `${f.label} must be a number.`;
      s = String(n);
    }
    if (f.type === "choice" && f.options && !f.options.includes(s)) return `${f.label}: choose one of the options.`;
    if (f.type === "yesno") s = s === "true" || s === "yes" || s === "Yes" ? "Yes" : "No";
    data[f.key] = s;
  }
  const amount = def.fields.find((f) => f.type === "money" && f.key === "amount") ? Number(data.amount ?? NaN) : null;
  return { data, date: data[def.dateField] ?? null, amount: Number.isFinite(amount) ? amount : null, status: def.statusField ? (data[def.statusField] ?? null) : null };
}

/* ----------------------------------------------------------- redaction */

/**
 * Masks Aadhaar numbers, PANs, bank account numbers and IFSC-linked numbers
 * in text that is about to be shown or exported, keeping the last four digits.
 */
export function redact(text: string): string {
  // Account numbers first (they are labelled), so a 12-digit account is not taken for an Aadhaar number.
  return text
    .replace(/\b(?:a\/c|account|acct)\.?\s*(?:no\.?|number)?\s*[:-]?\s*(\d{6,18})\b/gi, (m, n: string) => m.replace(n, `${"X".repeat(Math.max(0, n.length - 4))}${n.slice(-4)}`))
    .replace(/(?<![X\d])(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})(?!\d)/g, (_m, _a, _b, c) => `XXXX XXXX ${c}`)
    .replace(/\b([A-Z]{5})(\d{4})([A-Z])\b/g, (_m, _a, _b, c) => `XXXXXXXXX${c}`);
}
