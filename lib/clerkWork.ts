/**
 * Advocate Clerk Work: the one typed configuration for the module.
 *
 * Shared by the server (app/api/mobile/clerk/*) and the app, so nothing about
 * the 63 services, the case fields, the roles or the file names is written
 * twice. No server imports here.
 *
 * Two numbers are kept apart everywhere:
 *   • the WORK serial number (1–63) picks a clerk service from CLERK_WORK;
 *   • the CASE serial number is the office's own permanent number for a
 *     matter. A cause-list item, CNR, filing, SR or case number is never it.
 */

/* ---------------------------------------------------------------- fields */

export type FieldKey =
  | "court_name"
  | "court_place"
  | "state"
  | "district"
  | "forum_type"
  | "case_type"
  | "case_number"
  | "case_year"
  | "cnr"
  | "filing_number"
  | "connected_proceeding"
  | "cause_title"
  | "petitioner_side"
  | "respondent_side"
  | "client_name"
  | "client_capacity"
  | "client_parentage"
  | "client_age"
  | "client_occupation"
  | "client_address"
  | "opposite_party"
  | "advocate_name"
  | "advocate_enrolment"
  | "advocate_address"
  | "stage"
  | "last_hearing_date"
  | "last_hearing_proceedings"
  | "next_hearing_date"
  | "next_hearing_purpose"
  | "court_directions"
  | "pending_work";

export type FieldDef = { key: FieldKey; label: string; group: FieldGroup; long?: boolean; hint?: string };
export type FieldGroup = "Court" | "Case" | "Parties" | "Client" | "Advocate" | "Status";

export const CASE_FIELDS: FieldDef[] = [
  { key: "court_name", label: "Court or tribunal", group: "Court", hint: "As printed, e.g. Court of the II Additional Senior Civil Judge" },
  { key: "court_place", label: "Court complex and place", group: "Court" },
  { key: "state", label: "State", group: "Court" },
  { key: "district", label: "District", group: "Court" },
  { key: "forum_type", label: "Kind of forum", group: "Court", hint: "Civil, criminal, family, MACT, consumer, High Court…" },
  { key: "case_type", label: "Case type", group: "Case", hint: "O.S., C.C., M.C., W.P., I.A.…" },
  { key: "case_number", label: "Case number", group: "Case" },
  { key: "case_year", label: "Case year", group: "Case" },
  { key: "cnr", label: "CNR number", group: "Case" },
  { key: "filing_number", label: "Filing, diary or SR number", group: "Case" },
  { key: "connected_proceeding", label: "Connected proceedings", group: "Case", long: true, hint: "IA, EA, EP, CMP, CRP, appeal or revision numbers" },
  { key: "cause_title", label: "Cause title (exact)", group: "Parties", long: true },
  { key: "petitioner_side", label: "Petitioner / plaintiff side", group: "Parties", long: true, hint: "Names with their numbers and descriptions" },
  { key: "respondent_side", label: "Respondent / defendant side", group: "Parties", long: true },
  { key: "client_name", label: "Client represented", group: "Client" },
  { key: "client_capacity", label: "Client's procedural capacity", group: "Client", hint: "e.g. Plaintiff, Respondent No. 2, Accused No. 1" },
  { key: "client_parentage", label: "Client's parentage", group: "Client", hint: "S/o, D/o or W/o" },
  { key: "client_age", label: "Client's age", group: "Client" },
  { key: "client_occupation", label: "Client's occupation", group: "Client" },
  { key: "client_address", label: "Client's address", group: "Client", long: true },
  { key: "opposite_party", label: "Opposite party", group: "Parties" },
  { key: "advocate_name", label: "Advocate's name", group: "Advocate" },
  { key: "advocate_enrolment", label: "Enrolment number", group: "Advocate" },
  { key: "advocate_address", label: "Advocate's office address", group: "Advocate", long: true },
  { key: "stage", label: "Nature and stage", group: "Status" },
  { key: "last_hearing_date", label: "Last hearing date", group: "Status" },
  { key: "last_hearing_proceedings", label: "Last hearing proceedings", group: "Status", long: true },
  { key: "next_hearing_date", label: "Next hearing date", group: "Status" },
  { key: "next_hearing_purpose", label: "Next hearing purpose", group: "Status" },
  { key: "court_directions", label: "Court directions", group: "Status", long: true },
  { key: "pending_work", label: "Pending clerk work", group: "Status", long: true },
];

export const FIELD_KEYS = CASE_FIELDS.map((f) => f.key);
export const isFieldKey = (v: unknown): v is FieldKey => typeof v === "string" && (FIELD_KEYS as string[]).includes(v);
export const fieldLabel = (k: FieldKey) => CASE_FIELDS.find((f) => f.key === k)?.label ?? k;

/** These describe the case "as of" a document's date, never as its verified present state. */
export const DATED_FIELDS: FieldKey[] = ["stage", "last_hearing_date", "last_hearing_proceedings", "next_hearing_date", "next_hearing_purpose", "court_directions", "pending_work"];

export type Confidence = "high" | "medium" | "low";
export type Verification = "unverified" | "confirmed" | "corrected";

/* ---------------------------------------------------------------- roles */

export const ROLES = [
  "office_admin",
  "senior_advocate",
  "advocate",
  "junior_advocate",
  "clerk",
  "accounts",
  "read_only",
] as const;
export type Role = (typeof ROLES)[number];
export const isRole = (v: unknown): v is Role => typeof v === "string" && (ROLES as readonly string[]).includes(v);

export const ROLE_LABELS: Record<Role, string> = {
  office_admin: "Office Administrator",
  senior_advocate: "Senior Advocate",
  advocate: "Advocate",
  junior_advocate: "Junior Advocate",
  clerk: "Advocate Clerk",
  accounts: "Accounts User",
  read_only: "Read-Only User",
};

export type Action = "view" | "prepare" | "approve" | "manage_members" | "delete";

/**
 * Who may do what. Only an advocate or the administrator approves a document
 * as ready for execution or filing; clerks and juniors prepare.
 */
const CAN: Record<Action, Role[]> = {
  view: [...ROLES],
  prepare: ["office_admin", "senior_advocate", "advocate", "junior_advocate", "clerk"],
  approve: ["office_admin", "senior_advocate", "advocate"],
  manage_members: ["office_admin"],
  delete: ["office_admin", "senior_advocate"],
};

export const can = (role: Role, action: Action) => CAN[action].includes(role);

/* --------------------------------------------------------------- services */

export type WorkArea =
  | "Pleadings and petitions"
  | "Daily court work"
  | "Filings and defects"
  | "Process and service"
  | "Certified copies"
  | "Documents and originals"
  | "Expenses"
  | "Dockets and vakalat";

/**
 * Which builder produces the service: the court's own blank form filled in
 * (vakalatnama, dockets), or a typed paper composed from the case and the
 * service's own questions (lib/clerkServices.ts).
 */
export type Generator = "vakalatnama" | "docket-front" | "docket-back" | "typed";

export type ClerkWork = {
  no: number;
  name: string;
  area: WorkArea;
  /** Case fields that must be reviewed (confirmed or corrected) before generation. */
  needs: FieldKey[];
  /** What the service captures beyond the case record, and its safeguard. */
  rule: string;
  generator: Generator;
  /** A prescribed blank form must be uploaded; Shisho never substitutes one. */
  blankForm?: "required" | "optional";
};

const CORE: FieldKey[] = ["court_name", "case_type", "case_number", "case_year", "cause_title"];
const CLIENT: FieldKey[] = ["client_name", "client_capacity"];
const ADVOCATE: FieldKey[] = ["advocate_name", "advocate_enrolment", "advocate_address"];

const w = (no: number, name: string, area: WorkArea, needs: FieldKey[], rule: string, generator: Generator = "typed", blankForm?: ClerkWork["blankForm"]): ClerkWork => ({
  no,
  name,
  area,
  needs,
  rule,
  generator,
  blankForm,
});

export const CLERK_WORK: ClerkWork[] = [
  w(1, "Acknowledgment Filing Memo", "Process and service", [...CORE, ...CLIENT], "Recipient, article number, dispatch date, delivery date, acknowledgment and enclosures. An unclear signature is not proof of who received it."),
  w(2, "Address Memo", "Process and service", [...CORE, ...CLIENT], "The complete address of the party, witness or recipient with PIN code and procedural description."),
  w(3, "Adjournment Petition", "Pleadings and petitions", [...CORE, ...CLIENT, "next_hearing_date", "stage"], "Hearing date, present stage, the actual reason, earlier adjournments, supporting record and the exact period asked. Never invent illness, consent or inconvenience."),
  w(4, "Advance Hearing Petition", "Pleadings and petitions", [...CORE, ...CLIENT, "next_hearing_date"], "Existing hearing date, requested date, genuine grounds, urgency and supporting documents."),
  w(5, "Affidavit — Party", "Pleadings and petitions", [...CORE, ...CLIENT, "client_parentage", "client_age", "client_address"], "Numbered factual paragraphs, verification, place, date, deponent block and attestation area."),
  w(6, "Affidavit — Supporting", "Pleadings and petitions", [...CORE, ...CLIENT], "Tied to the petition it supports. Personal knowledge kept apart from information received."),
  w(7, "Affidavit — Third Party", "Pleadings and petitions", CORE, "Deponent's name, age, parentage, occupation, address, relationship to the matter, source of knowledge and purpose."),
  w(8, "Appearance Exemption Petition", "Pleadings and petitions", [...CORE, ...CLIENT, "next_hearing_date", "stage"], "Who seeks exemption, hearing date, stage, actual reason, supporting material and precise relief. A provision is cited only when verified for that proceeding."),
  w(9, "Bank Challan Covering Memo", "Expenses", CORE, "Purpose, amount, bank or treasury, payment head, challan or transaction number, date and confirmed payment status."),
  w(10, "Batta / Process-Fee Memo", "Process and service", [...CORE, ...CLIENT], "Order date, process type, recipients, addresses, fee, receipt, copies and envelopes. Local fee rates are never assumed."),
  w(11, "Case Diary Update", "Daily court work", [...CORE, "next_hearing_date", "next_hearing_purpose"], "Confirmed proceedings, next date, next purpose, court directions and pending action."),
  w(12, "Cause List Preparation", "Daily court work", CORE, "Court, judge or bench if known, case number, item number, stage, advocate assigned and files required."),
  w(13, "Certified Copy Application", "Certified copies", [...CORE, ...CLIENT], "Applicant, capacity, the judgment, decree, order, deposition or exhibit wanted, its date, and ordinary or urgent."),
  w(14, "Certified Copy Collection Record", "Certified copies", CORE, "Copy-application number, documents received, certified pages, collection date and recipient."),
  w(15, "Certified Copy Follow-Up", "Certified copies", CORE, "Application number, date, copying-section status, compliance required and payment particulars."),
  w(16, "Client Attendance Record", "Daily court work", [...CORE, ...CLIENT, "next_hearing_date"], "Client, hearing date, reporting time, documents to bring, attendance status and contact."),
  w(17, "Compliance Affidavit", "Filings and defects", [...CORE, ...CLIENT, "court_directions"], "The exact direction, action completed, completion date and supporting documents."),
  w(18, "Compliance Memo", "Filings and defects", [...CORE, ...CLIENT, "court_directions"], "A concise record of compliance with the order. Full compliance is never stated unless supported."),
  w(19, "Costs Memo", "Expenses", [...CORE, ...CLIENT], "Court fee, process fee, witness expenses, copying charges, advocate fee claimed and other expenses. Actual spend kept apart from costs claimed."),
  w(20, "Court-Fee Payment Record", "Expenses", CORE, "Payment method, value, reference, date and proceeding. Sufficiency of court fee is flagged for the advocate."),
  w(21, "Court-Ordered Deposit Memo", "Expenses", [...CORE, ...CLIENT], "Order date, depositor, amount, purpose, payment reference and proof."),
  w(22, "Daily Clerk Expense Statement", "Expenses", [], "Opening advance, case-wise expenses, receipts, total spent and closing balance."),
  w(23, "Daily Court Work Sheet", "Daily court work", [], "Court-wise and case-wise work with status, hearing purpose, clerk work and who is responsible."),
  w(24, "Daily Office Closing Report", "Daily court work", [], "Work completed, hearing results, pending verification, filings, service work, expenses and urgent follow-up."),
  w(25, "Defect Compliance Memo", "Filings and defects", CORE, "Every registry objection, the correction made, supporting document and any defect still open."),
  w(26, "Docket — Backside", "Dockets and vakalat", [...CORE, ...CLIENT, ...ADVOCATE], "Court, case number, short cause title, document name, filing party, advocate and office. Court-use spaces kept blank.", "docket-back", "optional"),
  w(27, "Docket — Front", "Dockets and vakalat", [...CORE, ...CLIENT, ...ADVOCATE], "All applicable docket fields, keeping the printed form and registry-use portions untouched.", "docket-front", "optional"),
  w(28, "Document Custody Register", "Documents and originals", CORE, "Description, date, page count, condition, source, custodian, storage location and movement history."),
  w(29, "Document Production Memo", "Documents and originals", [...CORE, ...CLIENT], "Documents with dates and descriptions. Exhibit numbers are never invented."),
  w(30, "Document Receipt", "Documents and originals", CORE, "Who delivered, who received, the documents, condition, pages, date and an acknowledgment space."),
  w(31, "Document Return Application", "Documents and originals", [...CORE, ...CLIENT], "The original, its production details, the purpose of return and any undertaking or condition to verify."),
  w(32, "E-Filing Preparation", "Filings and defects", CORE, "PDF format, OCR, file size, naming, pagination, signatures, annexures, court fees and the portal's own requirements."),
  w(33, "Exhibit Index", "Documents and originals", CORE, "Only confirmed exhibit markings; proposed markings kept separate."),
  w(34, "Filing Acknowledgment Register", "Filings and defects", CORE, "Filing date, filing number, SR or diary number, court, document and acknowledgment."),
  w(35, "Filing Index", "Filings and defects", CORE, "Each paper filed with description, date, page number and remarks."),
  w(36, "Filing Status Follow-Up", "Filings and defects", CORE, "Submission status, scrutiny, objections, re-presentation, registration and the number assigned."),
  w(37, "General Memo", "Pleadings and petitions", [...CORE, ...CLIENT], "The fact, document or compliance to be placed on record and the exact, limited request."),
  w(38, "Hearing Result Entry", "Daily court work", [...CORE, "next_hearing_date", "next_hearing_purpose"], "The clerk's oral report kept apart from the court's own order. Next date, purpose and directions."),
  w(39, "Inspection Application", "Certified copies", [...CORE, ...CLIENT], "Applicant's capacity, records wanted, period, purpose and the court's procedure."),
  w(40, "List of Documents", "Documents and originals", [...CORE, ...CLIENT], "Serial number, description, date, original or copy, and page references."),
  w(41, "Memo of Appearance", "Dockets and vakalat", [...CORE, ...CLIENT, ...ADVOCATE], "Advocate, enrolment number, party represented, procedural capacity and vakalat status."),
  w(42, "Numbering Follow-Up", "Filings and defects", CORE, "Filing number, submission date, defects, compliance, registration status and case number."),
  w(43, "Original Document Register", "Documents and originals", CORE, "Each original, its custody, production, exhibit status and return."),
  w(44, "Out-of-Order Petition", "Pleadings and petitions", [...CORE, ...CLIENT], "Listing position, urgency, the reason and the limited request to take the matter out of turn."),
  w(45, "Paper-Book Preparation", "Filings and defects", CORE, "Index, pagination, document order, legibility check and missing-paper checklist for the forum."),
  w(46, "Pass-Over Request", "Daily court work", CORE, "Item number, present calling position, the actual reason and advocate availability. Local practice to be verified."),
  w(47, "Pending Work Register", "Daily court work", [], "Pending filing, process, copies, compliance, client, witness and accounts work, case serial number-wise."),
  w(48, "Postal Receipt Filing Memo", "Process and service", CORE, "Each receipt matched to its document, addressee, article number, case and dispatch date."),
  w(49, "Process Memo", "Process and service", [...CORE, ...CLIENT], "The order, process type, recipient, complete address, returnable date, process fee and copies."),
  w(50, "Registered Post Dispatch Memo", "Process and service", CORE, "Document sent, recipient, address, dispatch date, article number and postal receipt."),
  w(51, "Re-Presentation Memo", "Filings and defects", CORE, "Return date, objections, corrections completed and re-presentation date."),
  w(52, "Returned Cover Filing Memo", "Process and service", CORE, "The postal endorsement reproduced exactly. Valid service is never declared automatically."),
  w(53, "Scrutiny Objection Checklist", "Filings and defects", CORE, "Each objection as written, with a corrective action, who is responsible and a due date."),
  w(54, "Service Affidavit", "Process and service", [...CORE, ...CLIENT], "Only facts personally known or on record. Dispatch is kept apart from delivery."),
  w(55, "Service Status Register", "Process and service", CORE, "Recipient, process type, dispatch, delivery, return, endorsement and further action."),
  w(56, "Summons Particulars Sheet", "Process and service", CORE, "Recipient's identity, procedural status, complete address and purpose. Never made to look like an issued summons."),
  w(57, "Tomorrow's Court Preparation Sheet", "Daily court work", [], "The next working day's confirmed cases, files, documents, advocates, clients, witnesses and work outstanding."),
  w(58, "Urgent Certified Copy Application", "Certified copies", [...CORE, ...CLIENT], "The record wanted, its date, the urgency and the copying section's procedure."),
  w(59, "Urgent Listing Request", "Pleadings and petitions", [...CORE, ...CLIENT], "The actual urgency, present listing, the action asked and supporting material."),
  w(60, "Vakalatnama", "Dockets and vakalat", [...CORE, ...CLIENT, ...ADVOCATE], "The prescribed form for the forum, with cause title, party represented, advocate, front page and backside docket. Execution, identification, acceptance, attestation and court-use spaces stay blank. No authority to compromise, withdraw, admit liability or receive money is added unless the prescribed form has it and it is actually given.", "vakalatnama", "required"),
  w(61, "Witness Attendance Record", "Daily court work", [...CORE, "next_hearing_date"], "Witness, hearing date, reporting time, contact, documents to bring and attendance."),
  w(62, "Witness Expense Record", "Expenses", CORE, "Witness, authorised amount, travel or attendance purpose, payment evidence and balance."),
  w(63, "Witness Process Memo", "Process and service", [...CORE, ...CLIENT], "Witness name, complete address, purpose, records to bring, order date, returnable date and process fee."),
];

export const getWork = (no: number) => CLERK_WORK.find((x) => x.no === no);
export const workIsReady = (x: ClerkWork) => Boolean(x.generator);
/** Daily office sheets need no case. */
export const OFFICE_WIDE_WORK = [12, 22, 23, 24, 47, 57];

/* ------------------------------------------------------------ documents */

export const DOCUMENT_STATUSES = ["draft", "ready_for_execution"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
/** The internal label every generated form carries until an advocate approves it. */
export const DRAFT_LABEL = "Draft for Advocate Review";

export const OUTPUT_FORMATS = ["docx", "pdf", "both"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export const OUTPUT_LANGUAGES = ["en", "te", "bilingual"] as const;
export type OutputLanguage = (typeof OUTPUT_LANGUAGES)[number];
/** Telugu and bilingual output: typed services only (a court blank form is filled in its own language). Needs the Claude key for translation. */
export const LANGUAGE_READY: Record<OutputLanguage, boolean> = { en: true, te: true, bilingual: true };

/** "007" from 7: the serial as it appears in file names and on screen. */
export const serialLabel = (n: number) => String(n).padStart(3, "0");

const slugPart = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/\./g, "") // "O.S." → "OS"
    .replace(/[^\w\s-]/g, " ")
    .replace(/[\s/-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

/**
 * [CaseSerialNumber]_[CaseNumber]_[WorkName]_[YYYY-MM-DD]_v[Version].[ext]
 * e.g. 007_OS_125_2025_Vakalatnama_2026-10-25_v1.pdf
 */
export function documentFilename(o: { serial: number | null; caseType?: string; caseNumber?: string; caseYear?: string; work: string; date: string; version: number; ext: "pdf" | "docx" }) {
  // Office-wide sheets (cause list, daily work sheet) belong to no case.
  if (o.serial === null) return `OFFICE_${slugPart(o.work)}_${o.date}_v${o.version}.${o.ext}`;
  const number = slugPart([o.caseType, o.caseNumber, o.caseYear].filter(Boolean).join(" ")) || "Unnumbered";
  return `${serialLabel(o.serial)}_${number}_${slugPart(o.work)}_${o.date}_v${o.version}.${o.ext}`;
}

/** A "Martial Court" entry is ambiguous: Court-Martial or Magistrate Court. */
export const isAmbiguousForum = (v: string) => /\bmartial\s+court\b/i.test(v) && !/court[\s-]*martial/i.test(v);
