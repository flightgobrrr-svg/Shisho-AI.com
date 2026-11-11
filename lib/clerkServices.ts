import type { AutoEntry, AutoHearing, Block, ComposedDoc } from "@/lib/clerkDoc";
import type { FieldKey } from "@/lib/clerkWork";
import { TASK_SLOT_LABELS, TASK_STATUS_LABELS, parseIndianDate, showDate, type TaskSlot, type TaskStatus } from "@/lib/clerkRegisters";

/**
 * The 60 typed clerk-work services (every number except 26, 27 and 60, which
 * fill the court's own blank forms; see lib/clerkGenerate.ts). Each service
 * says what it asks for and composes its paper from the confirmed case
 * particulars and those answers. Shared by the server and the app.
 *
 * The wording is deliberately plain and neutral. Every fact comes from the
 * case record or from the person's own answers; nothing is supplied. Where a
 * service carries a safeguard (dispatch is not service, an unclear signature
 * proves nothing, a clerk's report is not the court's order, exhibit numbers
 * only as marked), it is written into what the paper says.
 */

export type InputType = "text" | "long" | "paras" | "date" | "money" | "number" | "choice" | "list";
export type InputDef = {
  key: string;
  label: string;
  type: InputType;
  required?: boolean;
  hint?: string;
  options?: readonly string[];
  /** For "list": the columns of each row. */
  columns?: readonly string[];
  /** Pre-fill from a confirmed case particular. */
  from?: FieldKey;
};

export type Inputs = Record<string, string | string[][]>;
export type Values = Partial<Record<string, string>>;

export type EntryRow = { kind: string; data: Record<string, string>; entry_date: string | null; status: string | null; amount: number | null; serial?: number | null; case_label?: string | null };
export type DayMatter = { serial: number; fileCode: string; court: string; caseLabel: string; causeTitle: string; client: string; capacity: string; advocate: string; purpose: string; stage: string; source: string };
export type DayTask = { serial: number | null; caseLabel: string; title: string; status: TaskStatus; slot: TaskSlot | null; due: string | null; assignee: string; workNo: number | null; updatedOn: string };
export type ServiceData = {
  /** This matter's register rows. */
  entries: EntryRow[];
  /** The office's day, for the daily sheets. */
  day?: { date: string; matters: DayMatter[]; tasks: DayTask[]; entries: EntryRow[]; hearingsEntered: DayMatter[] };
};

export type Ctx = { v: Values; i: Inputs; data: ServiceData; date: string };
export type Composed = { doc: ComposedDoc; entries?: AutoEntry[]; hearing?: AutoHearing };

export type ServiceSpec = {
  no: number;
  inputs: InputDef[];
  /** "matter": needs the matter's registers; "day": needs the office's day (a date input named `date`). */
  data?: "matter" | "day";
  /** No case needed (office-wide daily sheets). */
  officeWide?: boolean;
  compose: (c: Ctx) => Composed;
};

/* ------------------------------------------------------------ helpers */

const s = (c: Ctx, k: string) => {
  const v = c.i[k];
  return typeof v === "string" ? v.trim() : "";
};
const rows = (c: Ctx, k: string) => {
  const v = c.i[k];
  return Array.isArray(v) ? v.filter((r) => r.some((x) => x.trim())) : [];
};
const paras = (c: Ctx, k: string) => s(c, k).split(/\n+/).map((x) => x.trim()).filter(Boolean);
const d = (iso: string) => showDate(iso);
const money = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const num = (x: string | undefined) => {
  const n = Number(String(x ?? "").replace(/[,₹\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const capacity = (c: Ctx) => c.v.client_capacity?.trim() || "Petitioner";
const client = (c: Ctx) => c.v.client_name?.trim() || "";
const onBehalf = (c: Ctx) => `${capacity(c)}${client(c) ? ` (${client(c)})` : ""}`;
const theParty = (c: Ctx) => `the ${capacity(c)}`;
const court = (c: Ctx) => c.v.court_name?.trim() || "the Court";
const caseLine = (c: Ctx) => {
  const t = c.v.case_type?.trim();
  const n = c.v.case_number?.trim();
  const y = c.v.case_year?.trim();
  return `${t || "_____"} No. ${n || "________"} of ${y || "20___"}`;
};
const advocateSign = (c: Ctx): Block => ({ type: "space", label: `Counsel for the ${capacity(c)}`, align: "right" });
const prayer = (text: string): Block => ({ type: "para", text });
const P = (text: string): Block => ({ type: "para", text, numbered: true });
const Plain = (text: string): Block => ({ type: "para", text });

/** A court paper: cause title, heading, numbered paragraphs, prayer, place/date, the advocate's blank signature, and the docket. */
function petition(c: Ctx, title: string, body: string[], pray: string, warnings: string[] = []): Composed {
  return {
    doc: {
      causeTitle: true,
      title,
      subtitle: `Filed on behalf of the ${onBehalf(c)}`,
      blocks: [...body.map(P), prayer(pray), advocateSign(c)],
      placeDate: true,
      docket: true,
      warnings,
    },
  };
}

/** A memo to the court: shorter, unnumbered. */
function memo(c: Ctx, title: string, body: string[], request: string, warnings: string[] = [], extra: Block[] = []): Composed {
  return {
    doc: {
      causeTitle: true,
      title,
      subtitle: `Filed on behalf of the ${onBehalf(c)}`,
      blocks: [...body.map(Plain), ...extra, ...(request ? [Plain(request)] : []), advocateSign(c)],
      placeDate: true,
      docket: true,
      warnings,
    },
  };
}

type Deponent = { name: string; parentage: string; age: string; occupation: string; address: string };
const deponentFromCase = (c: Ctx): Deponent => ({
  name: client(c),
  parentage: c.v.client_parentage?.trim() || "",
  age: c.v.client_age?.trim() || "",
  occupation: c.v.client_occupation?.trim() || "",
  address: c.v.client_address?.trim() || "",
});
const describe = (p: Deponent) =>
  [p.name, p.parentage ? `${/^(s|d|w)\/o/i.test(p.parentage) ? "" : "S/o / D/o / W/o "}${p.parentage}` : "", p.age ? `aged about ${p.age.replace(/\s*years?$/i, "")} years` : "", p.occupation, p.address ? `residing at ${p.address}` : ""]
    .filter(Boolean)
    .join(", ");

/**
 * An affidavit: deponent's description, numbered facts, the deponent's blank
 * signature, a verification that keeps personal knowledge apart from
 * information received, and an empty attestation space.
 */
function affidavit(c: Ctx, title: string, dep: Deponent, intro: string[], facts: string[], infoParas: string, warnings: string[] = []): Composed {
  const all = [...intro, ...facts];
  const n = all.length;
  // The person numbers their own facts (1st, 2nd…); the printed paragraphs come after the opening ones.
  const info = infoParas
    .split(/[,\s]+/)
    .map((x) => Number(x))
    .filter((x) => Number.isInteger(x) && x >= 1 && x <= facts.length)
    .map((x) => x + intro.length);
  const known = Array.from({ length: n }, (_, k) => k + 1).filter((x) => !info.includes(x));
  const list = (xs: number[]) => (xs.length === 0 ? "" : xs.length === 1 ? `paragraph ${xs[0]}` : `paragraphs ${xs.join(", ")}`);
  const verification =
    `Verified at ${c.v.court_place?.trim() || "__________"} on this the ____ day of __________, 20____, that the contents of ${list(known)} above are true to my personal knowledge` +
    (info.length ? ` and the contents of ${list(info)} are based on information received, which I believe to be true` : "") +
    ", and that nothing material has been concealed.";
  return {
    doc: {
      causeTitle: true,
      title,
      blocks: [
        Plain(`I, ${describe(dep) || "____________________"}, do hereby solemnly affirm and sincerely state as follows:`),
        ...all.map(P),
        { type: "space", label: "DEPONENT", align: "right" },
        { type: "heading", text: "VERIFICATION" },
        Plain(verification),
        { type: "space", label: "DEPONENT", align: "right" },
        { type: "space", label: "Solemnly affirmed and signed before me (attestation)", height: 70, align: "left" },
      ],
      placeDate: false,
      docket: true,
      warnings: [...warnings, ...(dep.name ? [] : ["The deponent's name is missing; it is left blank."])],
    },
  };
}

/** An office record or sheet: no cause title, no docket. */
function record(title: string, blocks: Block[], warnings: string[] = [], subtitle?: string): ComposedDoc {
  return { causeTitle: false, title, subtitle, blocks, placeDate: false, docket: false, warnings };
}
const caseKv = (c: Ctx): Block => ({
  type: "kv",
  rows: [
    ["Court", court(c)],
    ["Case", caseLine(c)],
    ["Cause title", c.v.cause_title?.trim() || ""],
    ["Client", onBehalf(c)],
  ],
});

const provisionNote = (prov: string) => (prov ? ` under ${prov}` : "");
const PROVISION: InputDef = { key: "provision", label: "Provision relied on (only if verified for this proceeding)", type: "text", hint: "Leave empty unless the advocate has confirmed it" };
const IN_PROC: InputDef = { key: "in_proceeding", label: "Filed in (IA / EA / CMP), if not the main case", type: "text" };
const PLACE_NOTE = "Place and date are left for the advocate to fill when signing.";

const registerTable = (rowsIn: EntryRow[], cols: [string, (e: EntryRow) => string][]): Block =>
  rowsIn.length
    ? { type: "table", columns: ["S.No.", ...cols.map((c) => c[0])], rows: rowsIn.map((e, k) => [String(k + 1), ...cols.map((c) => c[1](e))]) }
    : { type: "note", text: "No entries recorded yet." };
const ofKind = (c: Ctx, kind: string) => c.data.entries.filter((e) => e.kind === kind).sort((a, b) => (a.entry_date ?? "").localeCompare(b.entry_date ?? ""));

/* ------------------------------------------------------------ services */

export const SERVICES: ServiceSpec[] = [
  {
    no: 1,
    inputs: [
      { key: "recipient", label: "Addressee of the article", type: "text", required: true },
      { key: "article", label: "Article number", type: "text", required: true },
      { key: "dispatched", label: "Dispatched on", type: "date", required: true },
      { key: "delivered", label: "Delivery date shown on the acknowledgment", type: "date" },
      { key: "signature", label: "The acknowledgment", type: "choice", required: true, options: ["Is signed and the signature is legible", "Is signed but the signature is not clear", "Bears no signature"] },
      { key: "enclosures", label: "Enclosures", type: "long" },
    ],
    compose: (c) => {
      const body = [
        `${theParty(c).replace(/^./, (x) => x.toUpperCase())} files herewith the postal acknowledgment relating to article No. ${s(c, "article")}, dispatched on ${d(s(c, "dispatched"))} to ${s(c, "recipient")}.`,
        ...(s(c, "delivered") ? [`The acknowledgment shows the date of delivery as ${d(s(c, "delivered"))}.`] : []),
        ...(s(c, "signature") !== "Is signed and the signature is legible" ? ["The signature on the acknowledgment is not clear (or is absent), and the identity of the person who received the article is not confirmed by it."] : []),
        ...(s(c, "enclosures") ? [`Enclosures: ${s(c, "enclosures")}.`] : []),
      ];
      return {
        ...memo(c, "MEMO FILING ACKNOWLEDGMENT", body, "It is therefore prayed that this Hon'ble Court may be pleased to receive the acknowledgment and place it on record."),
        entries: [{ kind: "service", data: { recipient: s(c, "recipient"), process_type: "Registered post (RPAD)", address: "As on the article", dispatched_on: s(c, "dispatched"), article_number: s(c, "article"), status: s(c, "delivered") ? "Delivered (acknowledged)" : "Status unknown", delivered_on: s(c, "delivered") } }],
      };
    },
  },
  {
    no: 2,
    inputs: [
      { key: "person", label: "Whose address", type: "text", required: true },
      { key: "role", label: "Their procedural description", type: "text", required: true, hint: "e.g. Respondent No. 2, Witness" },
      { key: "address", label: "Complete address with PIN code", type: "long", required: true },
    ],
    compose: (c) => {
      const warn = /\b\d{6}\b/.test(s(c, "address")) ? [] : ["The address has no six-digit PIN code."];
      return memo(
        c,
        "ADDRESS MEMO",
        [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} furnishes the address of ${s(c, "person")}, ${s(c, "role")}, for the purpose of service, as follows:`],
        "It is prayed that the above address may be received and recorded.",
        warn,
        [{ type: "lines", lines: [s(c, "person") + ",", ...s(c, "address").split(/\n|,\s*/).filter(Boolean)] }],
      );
    },
  },
  {
    no: 3,
    inputs: [
      { key: "hearing", label: "Posted to (date)", type: "date", required: true, from: "next_hearing_date" },
      { key: "stage", label: "For (stage / purpose)", type: "text", required: true, from: "next_hearing_purpose" },
      { key: "reason", label: "The actual reason, in the party's words", type: "long", required: true },
      { key: "earlier", label: "Earlier adjournments taken by this side", type: "text" },
      { key: "supporting", label: "Supporting record filed with it", type: "text" },
      { key: "period", label: "Period asked for", type: "text", required: true, hint: "e.g. two weeks, or to a date after 20-12-2026" },
      IN_PROC,
    ],
    compose: (c) =>
      petition(
        c,
        "PETITION FOR ADJOURNMENT",
        [
          `The above matter stands posted to ${d(s(c, "hearing"))} for ${s(c, "stage")}.`,
          s(c, "reason"),
          ...(s(c, "earlier") ? [`Earlier adjournments taken on behalf of ${theParty(c)}: ${s(c, "earlier")}.`] : []),
          ...(s(c, "supporting") ? [`${s(c, "supporting")} is filed herewith.`] : []),
        ],
        `It is therefore prayed that this Hon'ble Court may be pleased to adjourn the matter by ${s(c, "period")}, and pass such other order as it deems fit.`,
        ["Check that the reason is the party's actual reason and is supported. Nothing has been added to it."],
      ),
  },
  {
    no: 4,
    inputs: [
      { key: "posted", label: "Presently posted to", type: "date", required: true, from: "next_hearing_date" },
      { key: "requested", label: "Date asked for", type: "date", required: true },
      { key: "grounds", label: "Grounds", type: "long", required: true },
      { key: "urgency", label: "Why it is urgent", type: "long" },
      { key: "supporting", label: "Supporting documents", type: "text" },
      IN_PROC,
    ],
    compose: (c) =>
      petition(
        c,
        "PETITION FOR ADVANCING THE HEARING",
        [
          `The above matter presently stands posted to ${d(s(c, "posted"))}.`,
          s(c, "grounds"),
          ...(s(c, "urgency") ? [s(c, "urgency")] : []),
          ...(s(c, "supporting") ? [`${s(c, "supporting")} is filed herewith.`] : []),
        ],
        `It is therefore prayed that this Hon'ble Court may be pleased to advance the hearing of the matter from ${d(s(c, "posted"))} to ${d(s(c, "requested"))} or any earlier date convenient to the Court, and pass such other order as it deems fit.`,
      ),
  },
  {
    no: 5,
    inputs: [
      { key: "facts", label: "Facts, one paragraph per line", type: "paras", required: true },
      { key: "info", label: "Which of your facts are based on information received, not personal knowledge", type: "text", hint: "By their order above, e.g. 3 for the third" },
    ],
    compose: (c) => affidavit(c, `AFFIDAVIT OF THE ${capacity(c).toUpperCase()}`, deponentFromCase(c), [`I am the ${capacity(c)} in the above case and as such I am well acquainted with the facts of the case.`], paras(c, "facts"), s(c, "info")),
  },
  {
    no: 6,
    inputs: [
      { key: "supports", label: "The petition or application it supports", type: "text", required: true, hint: "e.g. I.A. for temporary injunction" },
      { key: "facts", label: "Facts, one paragraph per line", type: "paras", required: true },
      { key: "info", label: "Which of your facts are based on information received, not personal knowledge", type: "text", hint: "By their order above, e.g. 3 for the third" },
    ],
    compose: (c) =>
      affidavit(
        c,
        "AFFIDAVIT IN SUPPORT",
        deponentFromCase(c),
        [`I am the ${capacity(c)} in the above case and as such I am well acquainted with the facts of the case.`, `I am filing this affidavit in support of the ${s(c, "supports")}.`],
        paras(c, "facts"),
        s(c, "info"),
      ),
  },
  {
    no: 7,
    inputs: [
      { key: "name", label: "Deponent's name", type: "text", required: true },
      { key: "parentage", label: "Parentage (S/o, D/o, W/o)", type: "text", required: true },
      { key: "age", label: "Age", type: "number", required: true },
      { key: "occupation", label: "Occupation", type: "text", required: true },
      { key: "address", label: "Address", type: "long", required: true },
      { key: "relationship", label: "Relationship to the matter", type: "text", required: true },
      { key: "source", label: "How the deponent knows these facts", type: "long", required: true },
      { key: "purpose", label: "Purpose of the affidavit", type: "text", required: true },
      { key: "facts", label: "Facts, one paragraph per line", type: "paras", required: true },
      { key: "info", label: "Which of your facts are based on information received, not personal knowledge", type: "text", hint: "By their order above, e.g. 3 for the third" },
    ],
    compose: (c) =>
      affidavit(
        c,
        "AFFIDAVIT",
        { name: s(c, "name"), parentage: s(c, "parentage"), age: s(c, "age"), occupation: s(c, "occupation"), address: s(c, "address") },
        [`I am ${s(c, "relationship")}. ${s(c, "source")}`, `I am filing this affidavit ${s(c, "purpose").replace(/^for\s+/i, "for ")}.`],
        paras(c, "facts"),
        s(c, "info"),
      ),
  },
  {
    no: 8,
    inputs: [
      { key: "person", label: "Person seeking exemption", type: "text", required: true, from: "client_name" },
      { key: "hearing", label: "Hearing date", type: "date", required: true, from: "next_hearing_date" },
      { key: "stage", label: "Stage", type: "text", required: true, from: "stage" },
      { key: "reason", label: "The actual reason", type: "long", required: true },
      { key: "supporting", label: "Supporting material", type: "text" },
      { key: "relief", label: "Exactly what is asked", type: "text", required: true, hint: "e.g. dispense with personal appearance on that date only" },
      PROVISION,
      IN_PROC,
    ],
    compose: (c) =>
      petition(
        c,
        `PETITION${provisionNote(s(c, "provision")).toUpperCase()} FOR EXEMPTION FROM PERSONAL APPEARANCE`,
        [
          `The above matter stands posted to ${d(s(c, "hearing"))} for ${s(c, "stage")}.`,
          `${s(c, "person")} is unable to appear in person on that date. ${s(c, "reason")}`,
          ...(s(c, "supporting") ? [`${s(c, "supporting")} is filed herewith.`] : []),
          `${s(c, "person")} is represented by counsel, who will appear on that date.`,
        ],
        `It is therefore prayed that this Hon'ble Court may be pleased to ${s(c, "relief").replace(/^to\s+/i, "")}, and pass such other order as it deems fit.`,
        s(c, "provision") ? ["A provision is cited; confirm it applies to this proceeding."] : [],
      ),
  },
  {
    no: 9,
    inputs: [
      { key: "purpose", label: "Purpose of the payment", type: "text", required: true },
      { key: "amount", label: "Amount (₹)", type: "money", required: true },
      { key: "bank", label: "Bank or treasury", type: "text", required: true },
      { key: "head", label: "Payment head", type: "text" },
      { key: "challan", label: "Challan / transaction number", type: "text", required: true },
      { key: "paid", label: "Paid on", type: "date", required: true },
      { key: "status", label: "Payment status", type: "choice", required: true, options: ["Confirmed by the bank / treasury receipt", "Paid; confirmation awaited"] },
    ],
    compose: (c) => {
      const confirmed = s(c, "status").startsWith("Confirmed");
      return {
        ...memo(
          c,
          "MEMO FILING BANK CHALLAN",
          [
            `${theParty(c).replace(/^./, (x) => x.toUpperCase())} files herewith the challan for ${money(num(s(c, "amount")))} paid towards ${s(c, "purpose")}${s(c, "head") ? ` under the head ${s(c, "head")}` : ""} at ${s(c, "bank")} on ${d(s(c, "paid"))}, challan / transaction No. ${s(c, "challan")}.`,
            confirmed ? "The payment is confirmed by the bank / treasury receipt filed herewith." : "Confirmation of the payment from the bank / treasury is awaited and will be filed on receipt.",
          ],
          "It is prayed that the challan may be received and placed on record.",
        ),
        entries: [{ kind: "expense", data: { purpose: s(c, "purpose"), head: "Other", spent_on: s(c, "paid"), amount: s(c, "amount"), mode: "Bank challan", reference: s(c, "challan"), receipt: confirmed ? "Yes" : "No", nature: "Actual expenditure" } }],
      };
    },
  },
  {
    no: 10,
    inputs: [
      { key: "order", label: "Order directing process, dated", type: "date", required: true },
      { key: "process", label: "Process to issue", type: "text", required: true, hint: "e.g. notice to Respondent Nos. 1 and 2" },
      { key: "recipients", label: "Recipients", type: "list", columns: ["Name and description", "Complete address with PIN"], required: true },
      { key: "fee", label: "Process fee / batta paid (₹)", type: "money", hint: "Leave empty if not yet fixed; local rates are never assumed" },
      { key: "receipt", label: "Receipt number", type: "text" },
      { key: "copies", label: "Copies filed", type: "number" },
      { key: "covers", label: "Envelopes / covers filed", type: "text" },
    ],
    compose: (c) =>
      memo(
        c,
        "BATTA / PROCESS-FEE MEMO",
        [
          `By order dated ${d(s(c, "order"))}, this Hon'ble Court directed ${s(c, "process")}.`,
          s(c, "fee") ? `${theParty(c).replace(/^./, (x) => x.toUpperCase())} pays process fee / batta of ${money(num(s(c, "fee")))}${s(c, "receipt") ? ` (receipt No. ${s(c, "receipt")})` : ""}.` : `${theParty(c).replace(/^./, (x) => x.toUpperCase())} will pay the process fee / batta as fixed by the Court.`,
          ...(s(c, "copies") || s(c, "covers") ? [`${s(c, "copies") ? `${s(c, "copies")} copies` : ""}${s(c, "copies") && s(c, "covers") ? " and " : ""}${s(c, "covers") ? s(c, "covers") : ""} are filed herewith.`] : []),
        ],
        "It is prayed that process may be issued to the following:",
        s(c, "fee") ? [] : ["No fee entered: the paper says it will be paid as fixed by the Court."],
        [{ type: "table", columns: ["S.No.", "Name and description", "Address"], rows: rows(c, "recipients").map((r, k) => [String(k + 1), r[0] ?? "", r[1] ?? ""]) }],
      ),
  },
  {
    no: 11,
    inputs: [
      { key: "on", label: "Proceedings dated", type: "date", required: true },
      { key: "happened", label: "What happened", type: "long", required: true },
      { key: "source", label: "Source", type: "choice", required: true, options: ["Clerk's report (to be confirmed)", "Court's order / proceedings sheet"] },
      { key: "next", label: "Next date", type: "date" },
      { key: "purpose", label: "Next purpose", type: "text" },
      { key: "directions", label: "Directions", type: "long" },
      { key: "pending", label: "Pending action", type: "long" },
    ],
    compose: (c) => {
      const order = s(c, "source").startsWith("Court");
      return {
        doc: record(
          "CASE DIARY UPDATE",
          [
            caseKv(c),
            { type: "kv", rows: [["Proceedings dated", d(s(c, "on"))], ["Source", order ? "Court's order / proceedings sheet" : "Clerk's report: NOT YET CONFIRMED against the court's order"], ["What happened", s(c, "happened")], ["Next date", s(c, "next") ? d(s(c, "next")) : "Not known"], ["Next purpose", s(c, "purpose")], ["Directions", s(c, "directions")], ["Pending action", s(c, "pending")]] },
          ],
          order ? [] : ["Recorded as the clerk's report. Confirm it against the court's order before relying on it."],
        ),
        hearing: { hearing_on: s(c, "on"), result: s(c, "happened"), source: order ? "court_order" : "clerk_report", next_on: s(c, "next") || null, next_purpose: s(c, "purpose"), directions: s(c, "directions") },
      };
    },
  },
  {
    no: 12,
    officeWide: true,
    data: "day",
    inputs: [{ key: "date", label: "Cause list for", type: "date", required: true }],
    compose: (c) => {
      const day = c.data.day!;
      return {
        doc: record(
          `CAUSE LIST: ${d(day.date)}`,
          [
            day.matters.length
              ? { type: "table", columns: ["Case S.No.", "Court", "Case", "Item", "Stage / purpose", "Advocate", "Files"], rows: day.matters.map((m) => [String(m.serial).padStart(3, "0"), m.court, m.caseLabel, "", m.purpose || m.stage, m.advocate, ""]), widths: [8, 22, 16, 6, 20, 16, 12] }
              : { type: "note", text: "No matters recorded for this date." },
            { type: "note", text: "Item numbers are left blank to be filled from the court's own cause list. Dates come from the case records; confirm each against the published list." },
          ],
          [],
          "Office list, serial-number-wise",
        ),
      };
    },
  },
  {
    no: 13,
    inputs: [
      { key: "applicant", label: "Applicant", type: "text", required: true, from: "client_name" },
      { key: "capacity", label: "Applicant's capacity", type: "text", required: true, from: "client_capacity" },
      { key: "documents", label: "Documents wanted (judgment, decree, order, deposition, exhibit)", type: "long", required: true },
      { key: "dates", label: "Their dates", type: "text" },
      { key: "kind", label: "Ordinary or urgent", type: "choice", required: true, options: ["Ordinary", "Urgent"] },
    ],
    compose: (c) => ({
      doc: {
        causeTitle: true,
        addressee: ["To,", "The Head Copyist / Copying Section,", court(c) + "."],
        title: `APPLICATION FOR CERTIFIED COPIES${s(c, "kind") === "Urgent" ? " (URGENT)" : ""}`,
        blocks: [
          Plain(`${s(c, "applicant")}, ${s(c, "capacity")} in the above case, applies for certified copies of the following:`),
          { type: "lines", lines: s(c, "documents").split(/\n+/) },
          ...(s(c, "dates") ? [Plain(`Dated: ${s(c, "dates")}.`)] : []),
          Plain(`The copies are applied for on ${s(c, "kind").toLowerCase()} basis. The applicant will pay the copying charges as called for.`),
          { type: "space", label: "Applicant / Counsel", align: "right" },
        ],
        placeDate: true,
        docket: false,
        warnings: [],
      },
      entries: [{ kind: "copy", data: { documents: s(c, "documents"), applied_on: c.date || "", urgent: s(c, "kind") === "Urgent" ? "Yes" : "No", status: "Applied" } }],
    }),
  },
  {
    no: 14,
    inputs: [
      { key: "application", label: "Copy application number", type: "text", required: true },
      { key: "received", label: "Documents received", type: "long", required: true },
      { key: "pages", label: "Certified pages", type: "number", required: true },
      { key: "on", label: "Collected on", type: "date", required: true },
      { key: "by", label: "Collected by", type: "text", required: true },
    ],
    compose: (c) => ({
      doc: record("CERTIFIED COPY COLLECTION RECORD", [caseKv(c), { type: "kv", rows: [["Copy application No.", s(c, "application")], ["Documents received", s(c, "received")], ["Certified pages", s(c, "pages")], ["Collected on", d(s(c, "on"))], ["Collected by", s(c, "by")]] }, { type: "space", label: "Signature of the person collecting", align: "right" }]),
      entries: [{ kind: "copy", data: { documents: s(c, "received"), application_number: s(c, "application"), applied_on: s(c, "on"), status: "Collected", pages: s(c, "pages"), collected_on: s(c, "on"), collected_by: s(c, "by") } }],
    }),
  },
  {
    no: 15,
    data: "matter",
    inputs: [
      { key: "application", label: "Copy application number", type: "text", required: true },
      { key: "applied", label: "Applied on", type: "date", required: true },
      { key: "status", label: "Copying section's status", type: "text", required: true },
      { key: "compliance", label: "Compliance needed (stamps, fees, particulars)", type: "long" },
      { key: "payment", label: "Payment particulars", type: "text" },
    ],
    compose: (c) => ({
      doc: record("CERTIFIED COPY FOLLOW-UP", [
        caseKv(c),
        { type: "kv", rows: [["Application No.", s(c, "application")], ["Applied on", d(s(c, "applied"))], ["Status", s(c, "status")], ["Compliance needed", s(c, "compliance") || "None reported"], ["Payment", s(c, "payment")]] },
        { type: "heading", text: "All copy applications on this case" },
        registerTable(ofKind(c, "copy"), [["Documents", (e) => e.data.documents ?? ""], ["Appl. No.", (e) => e.data.application_number ?? ""], ["Applied", (e) => d(e.data.applied_on ?? "")], ["Status", (e) => e.data.status ?? ""]]),
      ]),
    }),
  },
  {
    no: 16,
    inputs: [
      { key: "person", label: "Client", type: "text", required: true, from: "client_name" },
      { key: "hearing", label: "Hearing date", type: "date", required: true, from: "next_hearing_date" },
      { key: "time", label: "Reporting time", type: "text", required: true },
      { key: "bring", label: "Documents to bring", type: "long" },
      { key: "status", label: "Attendance", type: "choice", required: true, options: ["To be informed", "Informed", "Attended", "Did not attend"] },
      { key: "contact", label: "Contact", type: "text" },
    ],
    compose: (c) => ({
      doc: record("CLIENT ATTENDANCE RECORD", [caseKv(c), { type: "kv", rows: [["Client", s(c, "person")], ["Hearing date", d(s(c, "hearing"))], ["Report by", s(c, "time")], ["Bring", s(c, "bring")], ["Attendance", s(c, "status")], ["Contact", s(c, "contact")]] }]),
      entries: [{ kind: "attendance", data: { person: s(c, "person"), role: "Client", hearing_on: s(c, "hearing"), reporting_time: s(c, "time"), bring: s(c, "bring"), contact: s(c, "contact"), status: s(c, "status") } }],
    }),
  },
  {
    no: 17,
    inputs: [
      { key: "direction", label: "The court's direction, exactly", type: "long", required: true, from: "court_directions" },
      { key: "order", label: "Order dated", type: "date", required: true },
      { key: "action", label: "What was done", type: "long", required: true },
      { key: "done", label: "Completed on", type: "date", required: true },
      { key: "supporting", label: "Supporting documents", type: "text" },
      { key: "info", label: "Which of your facts are based on information received, not personal knowledge", type: "text", hint: "By their order above, e.g. 3 for the third" },
    ],
    compose: (c) =>
      affidavit(
        c,
        "COMPLIANCE AFFIDAVIT",
        deponentFromCase(c),
        [`I am the ${capacity(c)} in the above case and as such I am well acquainted with the facts.`, `By order dated ${d(s(c, "order"))}, this Hon'ble Court directed: "${s(c, "direction")}"`],
        [`In compliance, ${s(c, "action").replace(/\.$/, "")}, on ${d(s(c, "done"))}.`, ...(s(c, "supporting") ? [`${s(c, "supporting")} is filed herewith in proof.`] : [])],
        s(c, "info"),
      ),
  },
  {
    no: 18,
    inputs: [
      { key: "direction", label: "The court's direction", type: "long", required: true, from: "court_directions" },
      { key: "order", label: "Order dated", type: "date", required: true },
      { key: "action", label: "What was done", type: "long", required: true },
      { key: "extent", label: "Extent", type: "choice", required: true, options: ["In full, shown by the documents filed", "In part"] },
      { key: "supporting", label: "Documents filed in proof", type: "long" },
      { key: "remaining", label: "What remains (if in part)", type: "long" },
    ],
    compose: (c) => {
      const full = s(c, "extent").startsWith("In full") && Boolean(s(c, "supporting"));
      const warn: string[] = [];
      if (s(c, "extent").startsWith("In full") && !s(c, "supporting")) warn.push("Full compliance was chosen without documents in proof, so the memo says compliance is in part.");
      return memo(
        c,
        "COMPLIANCE MEMO",
        [
          `By order dated ${d(s(c, "order"))}, this Hon'ble Court directed: "${s(c, "direction")}"`,
          `${theParty(c).replace(/^./, (x) => x.toUpperCase())} has ${s(c, "action").replace(/^has\s+/i, "").replace(/\.$/, "")}.`,
          full ? `The direction has been complied with in full, as shown by ${s(c, "supporting")}, filed herewith.` : `The direction has been complied with in part.${s(c, "remaining") ? ` What remains: ${s(c, "remaining")}` : ""}${s(c, "supporting") ? ` ${s(c, "supporting")} is filed herewith.` : ""}`,
        ],
        "It is prayed that this memo may be recorded.",
        warn,
      );
    },
  },
  {
    no: 19,
    inputs: [{ key: "items", label: "Items", type: "list", required: true, columns: ["Item", "Amount (₹)", "Actual / Claimed", "Receipt or reference"] }],
    compose: (c) => {
      const it = rows(c, "items");
      const isClaim = (r: string[]) => /claim/i.test(r[2] ?? "");
      const actual = it.filter((r) => !isClaim(r)).reduce((n, r) => n + num(r[1]), 0);
      const claimed = it.filter(isClaim).reduce((n, r) => n + num(r[1]), 0);
      return memo(c, "MEMO OF COSTS", [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} submits the following memo of costs:`], "", [], [
        { type: "table", columns: ["S.No.", "Item", "Amount", "Actual / Claimed", "Receipt / reference"], rows: it.map((r, k) => [String(k + 1), r[0] ?? "", money(num(r[1])), isClaim(r) ? "Claimed" : "Actual", r[3] ?? ""]) },
        { type: "kv", rows: [["Actual expenditure", money(actual)], ["Costs claimed", money(claimed)], ["Total", money(actual + claimed)]] },
      ]);
    },
  },
  {
    no: 20,
    inputs: [
      { key: "method", label: "Paid by", type: "choice", required: true, options: ["e-Stamp / e-Court fee", "Court-fee stamps", "Bank challan", "Treasury challan", "Other"] },
      { key: "value", label: "Value (₹)", type: "money", required: true },
      { key: "reference", label: "Reference / certificate number", type: "text", required: true },
      { key: "on", label: "Paid on", type: "date", required: true },
      { key: "proceeding", label: "For (paper / proceeding)", type: "text", required: true },
    ],
    compose: (c) => ({
      doc: record("COURT-FEE PAYMENT RECORD", [caseKv(c), { type: "kv", rows: [["For", s(c, "proceeding")], ["Paid by", s(c, "method")], ["Value", money(num(s(c, "value")))], ["Reference", s(c, "reference")], ["Paid on", d(s(c, "on"))]] }, { type: "note", text: "Sufficiency of the court fee is for the advocate to verify." }], ["Court-fee sufficiency is flagged for the advocate; Shisho does not compute court fee."]),
      entries: [{ kind: "expense", data: { purpose: `Court fee: ${s(c, "proceeding")}`, head: "Court fee", spent_on: s(c, "on"), amount: s(c, "value"), mode: s(c, "method").includes("challan") ? "Bank challan" : "e-Challan / online", reference: s(c, "reference"), receipt: "Yes", nature: "Actual expenditure" } }],
    }),
  },
  {
    no: 21,
    inputs: [
      { key: "order", label: "Order dated", type: "date", required: true },
      { key: "depositor", label: "Depositor", type: "text", required: true, from: "client_name" },
      { key: "amount", label: "Amount (₹)", type: "money", required: true },
      { key: "purpose", label: "Purpose of the deposit", type: "text", required: true },
      { key: "reference", label: "Payment reference", type: "text", required: true },
      { key: "proof", label: "Proof filed", type: "text", required: true },
    ],
    compose: (c) => ({
      ...memo(
        c,
        "MEMO REPORTING DEPOSIT",
        [`By order dated ${d(s(c, "order"))}, this Hon'ble Court directed a deposit towards ${s(c, "purpose")}.`, `${s(c, "depositor")} has deposited ${money(num(s(c, "amount")))}, reference ${s(c, "reference")}. ${s(c, "proof")} is filed herewith.`],
        "It is prayed that the deposit may be recorded.",
      ),
      entries: [{ kind: "expense", data: { purpose: `Court-ordered deposit: ${s(c, "purpose")}`, head: "Court-ordered deposit", spent_on: c.date || s(c, "order"), amount: s(c, "amount"), reference: s(c, "reference"), receipt: "Yes", nature: "Actual expenditure" } }],
    }),
  },
  {
    no: 22,
    officeWide: true,
    data: "day",
    inputs: [
      { key: "date", label: "For the day", type: "date", required: true },
      { key: "advance", label: "Opening advance (₹)", type: "money", required: true },
    ],
    compose: (c) => {
      const day = c.data.day!;
      const ex = day.entries.filter((e) => e.kind === "expense");
      const actual = ex.filter((e) => e.data.nature !== "Cost claimed" && e.data.head !== "Advance received");
      const received = ex.filter((e) => e.data.head === "Advance received").reduce((n, e) => n + (e.amount ?? 0), 0);
      const spent = actual.reduce((n, e) => n + (e.amount ?? 0), 0);
      const opening = num(s(c, "advance"));
      const missing = actual.filter((e) => e.data.receipt !== "Yes");
      return {
        doc: record(
          `DAILY CLERK EXPENSE STATEMENT: ${d(day.date)}`,
          [
            { type: "kv", rows: [["Opening advance", money(opening)], ...(received ? ([["Advance received during the day", money(received)]] as [string, string][]) : [])] },
            registerTable(actual, [["Case", (e) => (e.serial ? `${String(e.serial).padStart(3, "0")} ${e.case_label ?? ""}` : "Office")], ["Purpose", (e) => e.data.purpose ?? ""], ["Head", (e) => e.data.head ?? ""], ["Amount", (e) => money(e.amount ?? 0)], ["Receipt", (e) => (e.data.receipt === "Yes" ? `Yes ${e.data.reference ?? ""}` : "MISSING")]]),
            { type: "kv", rows: [["Total spent", money(spent)], ["Closing balance", money(opening + received - spent)]] },
            ...(missing.length ? [{ type: "note", text: `${missing.length} item(s) without a receipt.` } as Block] : []),
            { type: "space", label: "Clerk", align: "left" },
            { type: "space", label: "Checked by", align: "right" },
          ],
          missing.length ? [`${missing.length} expense(s) have no receipt.`] : [],
        ),
      };
    },
  },
  {
    no: 23,
    officeWide: true,
    data: "day",
    inputs: [{ key: "date", label: "For the day", type: "date", required: true }],
    compose: (c) => daySheet(c, "DAILY COURT WORK SHEET"),
  },
  {
    no: 24,
    officeWide: true,
    data: "day",
    inputs: [
      { key: "date", label: "For the day", type: "date", required: true },
      { key: "urgent", label: "Urgent follow-up for tomorrow", type: "long" },
    ],
    compose: (c) => {
      const day = c.data.day!;
      const done = day.tasks.filter((t) => t.updatedOn === day.date && (t.status === "completed" || t.status === "closed"));
      const open = day.tasks.filter((t) => t.status !== "completed" && t.status !== "closed");
      const ex = day.entries.filter((e) => e.kind === "expense").reduce((n, e) => n + (e.amount ?? 0), 0);
      const unconfirmed = day.hearingsEntered.filter((h) => h.source === "clerk_report");
      return {
        doc: record(`DAILY OFFICE CLOSING REPORT: ${d(day.date)}`, [
          { type: "heading", text: "Hearing results entered" },
          day.hearingsEntered.length ? { type: "table", columns: ["Case S.No.", "Case", "Result", "Next", "Source"], rows: day.hearingsEntered.map((h) => [String(h.serial).padStart(3, "0"), h.caseLabel, h.stage, h.purpose, h.source === "court_order" ? "Court's order" : "Clerk's report (unconfirmed)"]) } : { type: "note", text: "None entered." },
          { type: "heading", text: "Work completed" },
          done.length ? { type: "table", columns: ["Case", "Work", "Status"], rows: done.map((t) => [t.serial ? String(t.serial).padStart(3, "0") : "Office", t.title, TASK_STATUS_LABELS[t.status]]) } : { type: "note", text: "None marked completed today." },
          { type: "heading", text: "Still open" },
          open.length ? { type: "table", columns: ["Case", "Work", "Status", "Due", "With"], rows: open.map((t) => [t.serial ? String(t.serial).padStart(3, "0") : "Office", t.title, TASK_STATUS_LABELS[t.status], t.due ? d(t.due) : "", t.assignee]) } : { type: "note", text: "Nothing open." },
          { type: "kv", rows: [["Expenses recorded today", money(ex)], ["Hearing results awaiting confirmation", String(unconfirmed.length)], ["Urgent follow-up", s(c, "urgent") || "None noted"]] },
        ]),
      };
    },
  },
  {
    no: 25,
    data: "matter",
    inputs: [
      { key: "paper", label: "Paper returned", type: "text", required: true },
      { key: "returned", label: "Returned on", type: "date" },
    ],
    compose: (c) => {
      const obj = ofKind(c, "objection");
      const open = obj.filter((e) => e.data.status === "Open");
      return memo(
        c,
        "MEMO OF DEFECT COMPLIANCE",
        [`The ${s(c, "paper")} filed on behalf of ${theParty(c)}${s(c, "returned") ? ` was returned on ${d(s(c, "returned"))}` : " was returned"} with the objections set out below. Each has been attended to as stated.`],
        open.length ? `The following remain to be attended to and will be complied with: ${open.map((e) => `"${e.data.objection}"`).join("; ")}.` : "It is prayed that the paper may be received and numbered.",
        [...(obj.length ? [] : ["No objections are recorded in the objection register for this case. Add them there first."]), ...(open.length ? [`${open.length} objection(s) are still open.`] : [])],
        [registerTable(obj, [["Objection (as raised)", (e) => e.data.objection ?? ""], ["Correction made", (e) => e.data.action ?? ""], ["Supporting", (e) => e.data.supporting ?? ""], ["Status", (e) => e.data.status ?? ""]])],
      );
    },
  },
  {
    no: 28,
    data: "matter",
    inputs: [],
    compose: (c) => ({
      doc: record("DOCUMENT CUSTODY REGISTER", [caseKv(c), registerTable(ofKind(c, "custody"), [["Document", (e) => e.data.document ?? ""], ["Date", (e) => e.data.document_date ?? ""], ["Orig.", (e) => e.data.original ?? ""], ["Pages", (e) => e.data.pages ?? ""], ["Condition", (e) => e.data.condition ?? ""], ["From", (e) => e.data.received_from ?? ""], ["Now", (e) => `${e.data.where ?? ""}${e.data.location ? `, ${e.data.location}` : ""}`], ["Movements", (e) => e.data.movements ?? ""]])]),
    }),
  },
  {
    no: 29,
    inputs: [{ key: "docs", label: "Documents produced", type: "list", required: true, columns: ["Description", "Date", "Original / Copy", "Pages"] }],
    compose: (c) =>
      memo(c, "MEMO OF PRODUCTION OF DOCUMENTS", [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} produces the following documents:`], "It is prayed that the documents may be received.", [], [
        { type: "table", columns: ["S.No.", "Description", "Date", "Original / Copy", "Pages"], rows: rows(c, "docs").map((r, k) => [String(k + 1), r[0] ?? "", r[1] ?? "", r[2] ?? "", r[3] ?? ""]) },
        { type: "note", text: "Exhibit numbers are not assigned here; they are as marked by the Court." },
      ]),
  },
  {
    no: 30,
    inputs: [
      { key: "from", label: "Delivered by", type: "text", required: true },
      { key: "to", label: "Received by", type: "text", required: true },
      { key: "on", label: "Received on", type: "date", required: true },
      { key: "docs", label: "Documents", type: "list", required: true, columns: ["Description", "Date", "Original / Copy", "Pages", "Condition"] },
    ],
    compose: (c) => ({
      doc: record("DOCUMENT RECEIPT", [
        caseKv(c),
        Plain(`Received from ${s(c, "from")} on ${d(s(c, "on"))} the following documents:`),
        { type: "table", columns: ["S.No.", "Description", "Date", "Orig./Copy", "Pages", "Condition"], rows: rows(c, "docs").map((r, k) => [String(k + 1), r[0] ?? "", r[1] ?? "", r[2] ?? "", r[3] ?? "", r[4] ?? ""]) },
        { type: "space", label: `Received by: ${s(c, "to")}`, align: "left" },
        { type: "space", label: "Acknowledged by the person delivering", align: "right" },
      ]),
      entries: rows(c, "docs").map((r) => ({ kind: "custody", data: { document: r[0] ?? "", document_date: r[1] ?? "", original: /orig/i.test(r[2] ?? "") ? "Yes" : "No", pages: String(num(r[3])) === "0" ? "" : String(num(r[3])), condition: r[4] ?? "", received_from: s(c, "from"), received_on: s(c, "on"), where: "In office" } })),
    }),
  },
  {
    no: 31,
    inputs: [
      { key: "document", label: "The original document", type: "text", required: true },
      { key: "produced", label: "Produced on", type: "date" },
      { key: "exhibit", label: "Exhibit marking (as marked by the court)", type: "text" },
      { key: "purpose", label: "Why it is needed back", type: "long", required: true },
      { key: "undertaking", label: "Undertaking offered", type: "long", hint: "e.g. to produce it again when required; certified copy to be substituted" },
      IN_PROC,
    ],
    compose: (c) =>
      petition(
        c,
        "PETITION FOR RETURN OF ORIGINAL DOCUMENT",
        [
          `${theParty(c).replace(/^./, (x) => x.toUpperCase())} produced the original ${s(c, "document")}${s(c, "produced") ? ` on ${d(s(c, "produced"))}` : ""}${s(c, "exhibit") ? `, marked as ${s(c, "exhibit")}` : ""}.`,
          s(c, "purpose"),
          ...(s(c, "undertaking") ? [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} undertakes ${s(c, "undertaking").replace(/^to\s+/i, "to ")}.`] : []),
        ],
        "It is therefore prayed that this Hon'ble Court may be pleased to order return of the said original document on such terms as it deems fit.",
        ["Conditions for return (certified copy, undertaking, stage of the case) vary; the advocate to verify."],
      ),
  },
  {
    no: 32,
    inputs: [
      { key: "portal", label: "Portal / court", type: "text", required: true },
      { key: "limit", label: "File-size limit per file (MB), as the portal states", type: "number" },
      { key: "files", label: "Files to upload", type: "list", required: true, columns: ["File name", "Pages", "Size (MB)", "Text-searchable (OCR)? yes/no", "Signed? yes/no"] },
      { key: "fee", label: "Court fee paid (reference)", type: "text" },
    ],
    compose: (c) => {
      const limit = num(s(c, "limit"));
      const f = rows(c, "files");
      const yes = (x: string | undefined) => /^y/i.test((x ?? "").trim());
      const issues: string[] = [];
      const table = f.map((r, k) => {
        const name = r[0] ?? "";
        const probs = [
          !/\.pdf$/i.test(name) ? "not a PDF" : "",
          limit && num(r[2]) > limit ? `over ${limit} MB` : "",
          !yes(r[3]) ? "not OCR'd" : "",
          !yes(r[4]) ? "unsigned" : "",
          /\s/.test(name) ? "space in name" : "",
        ].filter(Boolean);
        if (probs.length) issues.push(`${name}: ${probs.join(", ")}`);
        return [String(k + 1), name, r[1] ?? "", r[2] ?? "", yes(r[3]) ? "Yes" : "No", yes(r[4]) ? "Yes" : "No", probs.join(", ") || "OK"];
      });
      return {
        doc: record("E-FILING PREPARATION CHECKLIST", [
          caseKv(c),
          { type: "kv", rows: [["Portal", s(c, "portal")], ["Size limit", limit ? `${limit} MB per file` : "Check the portal's limit"], ["Court fee", s(c, "fee") || "Not recorded"]] },
          { type: "table", columns: ["S.No.", "File", "Pages", "MB", "OCR", "Signed", "Check"], rows: table },
          { type: "heading", text: "Before upload" },
          { type: "lines", lines: ["[ ] Pagination continuous and matches the index", "[ ] Annexures in order and marked", "[ ] Court fee paid and reflected", "[ ] Vakalat / authorisation uploaded", "[ ] Portal's own formatting rules checked (margins, font, bookmarks)"] },
        ], issues),
      };
    },
  },
  {
    no: 33,
    inputs: [{ key: "items", label: "Exhibits", type: "list", required: true, columns: ["Exhibit No.", "Description", "Date", "Marked by court? yes/no"] }],
    compose: (c) => {
      const r = rows(c, "items");
      const marked = r.filter((x) => /^y/i.test((x[3] ?? "").trim()));
      const proposed = r.filter((x) => !/^y/i.test((x[3] ?? "").trim()));
      return {
        doc: record("EXHIBIT INDEX", [
          caseKv(c),
          { type: "heading", text: "Marked by the Court" },
          marked.length ? { type: "table", columns: ["Exhibit", "Description", "Date"], rows: marked.map((x) => [x[0] ?? "", x[1] ?? "", x[2] ?? ""]) } : { type: "note", text: "None confirmed." },
          { type: "heading", text: "Proposed (not yet marked)" },
          proposed.length ? { type: "table", columns: ["Proposed", "Description", "Date"], rows: proposed.map((x) => [x[0] ? `(${x[0]})` : "", x[1] ?? "", x[2] ?? ""]) } : { type: "note", text: "None." },
        ]),
      };
    },
  },
  {
    no: 34,
    data: "matter",
    inputs: [],
    compose: (c) => ({ doc: record("FILING ACKNOWLEDGMENT REGISTER", [caseKv(c), registerTable(ofKind(c, "filing"), [["Paper", (e) => e.data.document ?? ""], ["Filed", (e) => d(e.data.filed_on ?? "")], ["Filing / SR No.", (e) => e.data.filing_number ?? ""], ["Ack.", (e) => e.data.acknowledgment ?? ""], ["Status", (e) => e.data.status ?? ""]])]) }),
  },
  {
    no: 35,
    inputs: [{ key: "papers", label: "Papers, in order", type: "list", required: true, columns: ["Description", "Date", "Pages", "Remarks"] }],
    compose: (c) => {
      let at = 1;
      const r = rows(c, "papers").map((x, k) => {
        const n = Math.max(0, Math.round(num(x[2])));
        const range = n ? `${at}–${at + n - 1}` : "";
        at += n;
        return [String(k + 1), x[0] ?? "", x[1] ?? "", range, x[3] ?? ""];
      });
      return { doc: { causeTitle: true, title: "INDEX", blocks: [{ type: "table", columns: ["S.No.", "Description", "Date", "Pages", "Remarks"], rows: r }, advocateSign(c)], placeDate: true, docket: false, warnings: [] } };
    },
  },
  {
    no: 36,
    data: "matter",
    inputs: [],
    compose: (c) => ({ doc: record("FILING STATUS FOLLOW-UP", [caseKv(c), registerTable(ofKind(c, "filing"), [["Paper", (e) => e.data.document ?? ""], ["Filed", (e) => d(e.data.filed_on ?? "")], ["Status", (e) => e.data.status ?? ""], ["Returned", (e) => d(e.data.returned_on ?? "")], ["Re-presented", (e) => d(e.data.represented_on ?? "")], ["Number", (e) => e.data.number_assigned ?? ""]])], ofKind(c, "filing").length ? [] : ["No filings recorded yet."]) }),
  },
  {
    no: 37,
    inputs: [
      { key: "subject", label: "Subject", type: "text", required: true },
      { key: "facts", label: "What is to be placed on record", type: "long", required: true },
      { key: "request", label: "The exact, limited request", type: "text", required: true },
      IN_PROC,
    ],
    compose: (c) => memo(c, `MEMO: ${s(c, "subject").toUpperCase()}`, paras(c, "facts"), `It is prayed that ${s(c, "request").replace(/^that\s+/i, "")}.`),
  },
  {
    no: 38,
    inputs: [
      { key: "on", label: "Hearing date", type: "date", required: true },
      { key: "source", label: "Source", type: "choice", required: true, options: ["Clerk's report (to be confirmed)", "Court's order / proceedings sheet"] },
      { key: "result", label: "Result", type: "long", required: true },
      { key: "next", label: "Next date", type: "date" },
      { key: "purpose", label: "Next purpose", type: "text" },
      { key: "directions", label: "Directions", type: "long" },
    ],
    compose: (c) => {
      const order = s(c, "source").startsWith("Court");
      return {
        doc: record("HEARING RESULT ENTRY", [caseKv(c), { type: "kv", rows: [["Hearing date", d(s(c, "on"))], ["Source", order ? "Court's order / proceedings sheet" : "Clerk's oral report: NOT CONFIRMED"], ["Result", s(c, "result")], ["Next date", s(c, "next") ? d(s(c, "next")) : "Not known"], ["Next purpose", s(c, "purpose")], ["Directions", s(c, "directions")]] }], order ? [] : ["Saved as an unconfirmed clerk's report; it shows on the dashboard until confirmed."]),
        hearing: { hearing_on: s(c, "on"), result: s(c, "result"), source: order ? "court_order" : "clerk_report", next_on: s(c, "next") || null, next_purpose: s(c, "purpose"), directions: s(c, "directions") },
      };
    },
  },
  {
    no: 39,
    inputs: [
      { key: "applicant", label: "Applicant", type: "text", required: true, from: "client_name" },
      { key: "capacity", label: "Capacity", type: "text", required: true, from: "client_capacity" },
      { key: "records", label: "Records to inspect", type: "long", required: true },
      { key: "period", label: "Period", type: "text" },
      { key: "purpose", label: "Purpose", type: "long", required: true },
    ],
    compose: (c) =>
      petition(
        c,
        "APPLICATION FOR INSPECTION OF RECORDS",
        [`${s(c, "applicant")} is the ${s(c, "capacity")} in the above case.`, `${s(c, "applicant")} seeks inspection of the following records${s(c, "period") ? ` for the period ${s(c, "period")}` : ""}: ${s(c, "records")}.`, s(c, "purpose")],
        "It is therefore prayed that this Hon'ble Court may be pleased to permit inspection of the said records on such date and terms as it deems fit.",
        ["Inspection procedure and fees differ between courts; the advocate to confirm."],
      ),
  },
  {
    no: 40,
    inputs: [{ key: "docs", label: "Documents", type: "list", required: true, columns: ["Description", "Date", "Original / Copy", "Pages"] }],
    compose: (c) => ({
      doc: {
        causeTitle: true,
        title: "LIST OF DOCUMENTS",
        subtitle: `Filed on behalf of the ${onBehalf(c)}`,
        blocks: [{ type: "table", columns: ["S.No.", "Description", "Date", "Original / Copy", "Pages"], rows: rows(c, "docs").map((r, k) => [String(k + 1), r[0] ?? "", r[1] ?? "", r[2] ?? "", r[3] ?? ""]) }, advocateSign(c)],
        placeDate: true,
        docket: true,
        warnings: [],
      },
    }),
  },
  {
    no: 41,
    inputs: [{ key: "vakalat", label: "Vakalat", type: "choice", required: true, options: ["Already filed", "Filed herewith", "To be filed"] }],
    compose: (c) =>
      memo(
        c,
        "MEMO OF APPEARANCE",
        [`Please take notice that I, ${c.v.advocate_name?.trim() || "____________"}${c.v.advocate_enrolment ? `, Advocate (Enrolment No. ${c.v.advocate_enrolment})` : ", Advocate"}, appear on behalf of the ${onBehalf(c)} in the above case.`, `The vakalat is ${s(c, "vakalat").toLowerCase()}.`, ...(c.v.advocate_address ? [`Address for service: ${c.v.advocate_address}.`] : [])],
        "",
      ),
  },
  {
    no: 42,
    data: "matter",
    inputs: [],
    compose: (c) => {
      const f = ofKind(c, "filing").filter((e) => e.data.status !== "Numbered");
      return { doc: record("NUMBERING FOLLOW-UP", [caseKv(c), registerTable(f, [["Paper", (e) => e.data.document ?? ""], ["Filing / SR No.", (e) => e.data.filing_number ?? ""], ["Submitted", (e) => d(e.data.filed_on ?? "")], ["Status", (e) => e.data.status ?? ""], ["Remarks", (e) => e.data.remarks ?? ""]])], f.length ? [] : ["Nothing awaiting a number."]) };
    },
  },
  {
    no: 43,
    data: "matter",
    inputs: [],
    compose: (c) => ({ doc: record("ORIGINAL DOCUMENT REGISTER", [caseKv(c), registerTable(ofKind(c, "custody").filter((e) => e.data.original === "Yes"), [["Original", (e) => e.data.document ?? ""], ["Date", (e) => e.data.document_date ?? ""], ["Custody", (e) => `${e.data.where ?? ""}${e.data.location ? `, ${e.data.location}` : ""}`], ["Exhibit (as marked)", (e) => e.data.exhibit ?? ""], ["Movements / return", (e) => e.data.movements ?? ""]])]) }),
  },
  {
    no: 44,
    inputs: [
      { key: "position", label: "Present listing (item number / position)", type: "text", required: true },
      { key: "reason", label: "Reason", type: "long", required: true },
      { key: "urgency", label: "Urgency", type: "long", required: true },
      IN_PROC,
    ],
    compose: (c) =>
      petition(
        c,
        "PETITION TO TAKE UP THE MATTER OUT OF TURN",
        [`The above matter is listed today at ${s(c, "position")}.`, s(c, "reason"), s(c, "urgency")],
        "It is therefore prayed that this Hon'ble Court may be pleased to take up the matter out of turn, and pass such other order as it deems fit.",
      ),
  },
  {
    no: 45,
    inputs: [
      { key: "forum", label: "Forum the paper-book is for", type: "text", required: true },
      { key: "docs", label: "Documents, in order", type: "list", required: true, columns: ["Description", "Pages", "Legible? yes/no", "Available? yes/no"] },
    ],
    compose: (c) => {
      let at = 1;
      const missing: string[] = [];
      const illegible: string[] = [];
      const r = rows(c, "docs").map((x, k) => {
        const n = Math.max(0, Math.round(num(x[1])));
        const range = n ? `${at}–${at + n - 1}` : "";
        at += n;
        if (/^n/i.test((x[3] ?? "").trim())) missing.push(x[0] ?? "");
        if (/^n/i.test((x[2] ?? "").trim())) illegible.push(x[0] ?? "");
        return [String(k + 1), x[0] ?? "", range, /^n/i.test((x[2] ?? "").trim()) ? "NO" : "Yes", /^n/i.test((x[3] ?? "").trim()) ? "MISSING" : "Yes"];
      });
      return {
        doc: record("PAPER-BOOK PREPARATION", [
          caseKv(c),
          { type: "kv", rows: [["Forum", s(c, "forum")], ["Total pages", String(at - 1)]] },
          { type: "table", columns: ["S.No.", "Document", "Pages", "Legible", "Available"], rows: r },
          ...(missing.length ? [{ type: "note", text: `Missing: ${missing.join("; ")}` } as Block] : []),
          ...(illegible.length ? [{ type: "note", text: `Needs a legible copy: ${illegible.join("; ")}` } as Block] : []),
          { type: "note", text: "Check the forum's own rules for paper-book order, binding and copies." },
        ], [...missing.map((m) => `Missing: ${m}`), ...illegible.map((m) => `Not legible: ${m}`)]),
      };
    },
  },
  {
    no: 46,
    inputs: [
      { key: "item", label: "Item number", type: "text", required: true },
      { key: "position", label: "Present calling position", type: "text", required: true },
      { key: "reason", label: "Reason", type: "long", required: true },
      { key: "available", label: "When counsel will be available", type: "text", required: true },
    ],
    compose: (c) =>
      memo(c, "REQUEST FOR PASS-OVER", [`Item No. ${s(c, "item")} (${caseLine(c)}) is presently at ${s(c, "position")}.`, s(c, "reason"), `Counsel will be available ${s(c, "available")}.`], "It is requested that the matter may be passed over.", ["Pass-over practice is local; confirm it is how this court takes such requests."]),
  },
  {
    no: 47,
    officeWide: true,
    data: "day",
    inputs: [{ key: "date", label: "As on", type: "date", required: true }],
    compose: (c) => {
      const open = c.data.day!.tasks.filter((t) => t.status !== "completed" && t.status !== "closed").sort((a, b) => (a.serial ?? 9e9) - (b.serial ?? 9e9));
      return { doc: record(`PENDING WORK REGISTER: as on ${d(c.data.day!.date)}`, [open.length ? { type: "table", columns: ["Case S.No.", "Case", "Work", "Status", "Due", "With"], rows: open.map((t) => [t.serial ? String(t.serial).padStart(3, "0") : "Office", t.caseLabel, t.title, TASK_STATUS_LABELS[t.status], t.due ? d(t.due) : "", t.assignee]) } : { type: "note", text: "No pending work." }], [], "Case serial number-wise") };
    },
  },
  {
    no: 48,
    inputs: [{ key: "receipts", label: "Postal receipts", type: "list", required: true, columns: ["Article No.", "Addressee", "Document sent", "Dispatched on (DD-MM-YYYY)"] }],
    compose: (c) => ({
      ...memo(c, "MEMO FILING POSTAL RECEIPTS", [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} files herewith the following postal receipts:`], "It is prayed that the receipts may be received. Proof of delivery, where received, will be filed separately.", [], [{ type: "table", columns: ["S.No.", "Article No.", "Addressee", "Document", "Dispatched"], rows: rows(c, "receipts").map((r, k) => [String(k + 1), r[0] ?? "", r[1] ?? "", r[2] ?? "", r[3] ?? ""]) }]),
      entries: rows(c, "receipts").map((r) => ({ kind: "service", data: { recipient: r[1] ?? "", process_type: "Registered post (RPAD)", address: "As on the article", dispatched_on: parseIndianDate(r[3]) ?? "", article_number: r[0] ?? "", status: "Dispatched" } })),
    }),
  },
  {
    no: 49,
    inputs: [
      { key: "order", label: "Order dated", type: "date", required: true },
      { key: "process", label: "Process", type: "choice", required: true, options: ["Summons", "Notice", "Warrant", "Other"] },
      { key: "recipient", label: "Recipient", type: "text", required: true },
      { key: "role", label: "Recipient's description", type: "text", required: true },
      { key: "address", label: "Complete address with PIN", type: "long", required: true },
      { key: "returnable", label: "Returnable on", type: "date" },
      { key: "fee", label: "Process fee (₹)", type: "money" },
      { key: "copies", label: "Copies filed", type: "number" },
    ],
    compose: (c) => ({
      ...memo(
        c,
        "PROCESS MEMO",
        [`By order dated ${d(s(c, "order"))}, this Hon'ble Court directed issue of ${s(c, "process").toLowerCase()} to ${s(c, "recipient")}, ${s(c, "role")}.`, `${s(c, "fee") ? `Process fee of ${money(num(s(c, "fee")))} is paid. ` : ""}${s(c, "copies") ? `${s(c, "copies")} copies are filed herewith.` : ""}`.trim()].filter(Boolean),
        `It is prayed that ${s(c, "process").toLowerCase()} may be issued to the above person at the following address${s(c, "returnable") ? `, returnable on ${d(s(c, "returnable"))}` : ""}:`,
        /\b\d{6}\b/.test(s(c, "address")) ? [] : ["The address has no six-digit PIN code."],
        [{ type: "lines", lines: [s(c, "recipient") + ",", ...s(c, "address").split(/\n|,\s*/).filter(Boolean)] }],
      ),
      entries: [{ kind: "service", data: { recipient: s(c, "recipient"), capacity: s(c, "role"), process_type: s(c, "process") === "Other" ? "Other" : s(c, "process"), address: s(c, "address"), order_date: s(c, "order"), returnable_on: s(c, "returnable"), fee: s(c, "fee"), status: "To be dispatched" } }],
    }),
  },
  {
    no: 50,
    inputs: [
      { key: "document", label: "Document sent", type: "text", required: true },
      { key: "recipient", label: "Recipient", type: "text", required: true },
      { key: "address", label: "Address", type: "long", required: true },
      { key: "on", label: "Dispatched on", type: "date", required: true },
      { key: "article", label: "Article number", type: "text", required: true },
    ],
    compose: (c) => ({
      ...memo(c, "MEMO OF DISPATCH BY REGISTERED POST", [`${theParty(c).replace(/^./, (x) => x.toUpperCase())} sent the ${s(c, "document")} to ${s(c, "recipient")} at the address below by registered post on ${d(s(c, "on"))}, article No. ${s(c, "article")}. The postal receipt is filed herewith.`, "This memo records dispatch only. Delivery will be shown by the acknowledgment or the postal record when received."], "It is prayed that the receipt may be received and placed on record.", [], [{ type: "lines", lines: s(c, "address").split(/\n|,\s*/).filter(Boolean) }]),
      entries: [{ kind: "service", data: { recipient: s(c, "recipient"), process_type: "Registered post (RPAD)", address: s(c, "address"), dispatched_on: s(c, "on"), article_number: s(c, "article"), status: "Dispatched" } }],
    }),
  },
  {
    no: 51,
    inputs: [
      { key: "paper", label: "Paper", type: "text", required: true },
      { key: "returned", label: "Returned on", type: "date", required: true },
      { key: "objections", label: "Objections", type: "long", required: true },
      { key: "corrections", label: "Corrections made", type: "long", required: true },
      { key: "represented", label: "Re-presented on", type: "date", required: true },
    ],
    compose: (c) => ({
      ...memo(c, "RE-PRESENTATION MEMO", [`The ${s(c, "paper")} was returned on ${d(s(c, "returned"))} with the following objections: ${s(c, "objections")}`, `The objections have been attended to as follows: ${s(c, "corrections")}`, `The paper is re-presented on ${d(s(c, "represented"))}.`], "It is prayed that the paper may be received and numbered."),
      entries: [{ kind: "filing", data: { document: s(c, "paper"), filed_on: s(c, "represented"), status: "Re-presented", returned_on: s(c, "returned"), represented_on: s(c, "represented"), remarks: s(c, "corrections") } }],
    }),
  },
  {
    no: 52,
    inputs: [
      { key: "recipient", label: "Addressee", type: "text", required: true },
      { key: "article", label: "Article number", type: "text", required: true },
      { key: "dispatched", label: "Dispatched on", type: "date", required: true },
      { key: "returned", label: "Returned on", type: "date" },
      { key: "endorsement", label: "Postal endorsement, exactly as written", type: "long", required: true },
    ],
    compose: (c) => ({
      ...memo(
        c,
        "MEMO FILING RETURNED COVER",
        [`The cover sent to ${s(c, "recipient")} by registered post on ${d(s(c, "dispatched"))}, article No. ${s(c, "article")}, has been returned${s(c, "returned") ? ` on ${d(s(c, "returned"))}` : ""} with the postal endorsement: "${s(c, "endorsement")}"`, "The returned cover is filed herewith unopened."],
        "It is prayed that the returned cover may be received and placed on record, for such orders as the Court deems fit.",
        ["The memo reproduces the endorsement only; whether it amounts to service is for the Court."],
      ),
      entries: [{ kind: "service", data: { recipient: s(c, "recipient"), process_type: "Registered post (RPAD)", address: "As on the cover", dispatched_on: s(c, "dispatched"), article_number: s(c, "article"), status: /refus/i.test(s(c, "endorsement")) ? "Refused (endorsed)" : "Returned unserved", endorsement: s(c, "endorsement") } }],
    }),
  },
  {
    no: 53,
    data: "matter",
    inputs: [],
    compose: (c) => ({ doc: record("SCRUTINY OBJECTION CHECKLIST", [caseKv(c), registerTable(ofKind(c, "objection"), [["Objection (exactly as raised)", (e) => e.data.objection ?? ""], ["Corrective action", (e) => e.data.action ?? ""], ["Responsible", (e) => e.data.responsible ?? ""], ["Due", (e) => d(e.data.due_on ?? "")], ["Status", (e) => e.data.status ?? ""]])], ofKind(c, "objection").length ? [] : ["No objections recorded yet. Add them in the objection register."]) }),
  },
  {
    no: 54,
    inputs: [
      { key: "name", label: "Deponent (who served or sent it)", type: "text", required: true },
      { key: "parentage", label: "Deponent's parentage", type: "text" },
      { key: "age", label: "Deponent's age", type: "number" },
      { key: "role", label: "Deponent's role", type: "text", required: true, hint: "e.g. clerk to the counsel for the Petitioner" },
      { key: "address", label: "Deponent's address", type: "long" },
      { key: "recipient", label: "Person to be served", type: "text", required: true },
      { key: "document", label: "What was served or sent", type: "text", required: true },
      { key: "mode", label: "Mode", type: "choice", required: true, options: ["Registered post with acknowledgment", "Speed post", "Personal service (tendered in person)", "Courier", "Other"] },
      { key: "sent", label: "Sent / tendered on", type: "date", required: true },
      { key: "outcome", label: "Outcome", type: "choice", required: true, options: ["Delivered: acknowledgment / signed copy held", "Dispatched: delivery not yet confirmed", "Returned unserved", "Refused (endorsed)"] },
      { key: "delivered", label: "Delivered on (per the record)", type: "date" },
      { key: "endorsement", label: "Endorsement, exactly as written", type: "long" },
      { key: "own", label: "What the deponent personally did or saw", type: "long", required: true },
    ],
    compose: (c) => {
      const o = s(c, "outcome");
      const facts = [
        s(c, "own"),
        `On ${d(s(c, "sent"))}, the ${s(c, "document")} was ${/personal/i.test(s(c, "mode")) ? "tendered in person" : `sent by ${s(c, "mode").toLowerCase()}`} to ${s(c, "recipient")}.`,
        o.startsWith("Delivered")
          ? `As shown by the acknowledgment / signed copy filed herewith, it was delivered${s(c, "delivered") ? ` on ${d(s(c, "delivered"))}` : ""}.`
          : o.startsWith("Dispatched")
            ? "Delivery has not yet been confirmed. This affidavit speaks to dispatch only."
            : `It was ${o.startsWith("Refused") ? "returned with an endorsement of refusal" : "returned unserved"}${s(c, "endorsement") ? `, endorsed: "${s(c, "endorsement")}"` : ""}. The returned article is filed herewith.`,
      ];
      return affidavit(c, "AFFIDAVIT OF SERVICE", { name: s(c, "name"), parentage: s(c, "parentage"), age: s(c, "age"), occupation: s(c, "role"), address: s(c, "address") }, [`I am ${s(c, "role")} and I depose to the facts within my own knowledge or as shown by the records referred to.`], facts, "", o.startsWith("Dispatched") ? ["Dispatch only: the affidavit does not claim service."] : []);
    },
  },
  {
    no: 55,
    data: "matter",
    inputs: [],
    compose: (c) => ({ doc: record("SERVICE STATUS REGISTER", [caseKv(c), registerTable(ofKind(c, "service"), [["Recipient", (e) => `${e.data.recipient ?? ""}${e.data.capacity ? ` (${e.data.capacity})` : ""}`], ["Mode", (e) => e.data.process_type ?? ""], ["Dispatched", (e) => `${d(e.data.dispatched_on ?? "")} ${e.data.article_number ?? ""}`.trim()], ["Status", (e) => e.data.status ?? ""], ["Delivered", (e) => d(e.data.delivered_on ?? "")], ["Endorsement", (e) => e.data.endorsement ?? ""], ["Next", (e) => e.data.next_action ?? ""]]), { type: "note", text: "Dispatch is not service. Only an acknowledged delivery or the Court's finding shows service." }]) }),
  },
  {
    no: 56,
    inputs: [
      { key: "recipient", label: "Recipient", type: "text", required: true },
      { key: "role", label: "Procedural status", type: "text", required: true },
      { key: "identity", label: "Identifying particulars (parentage, age, occupation)", type: "text" },
      { key: "address", label: "Complete address with PIN", type: "long", required: true },
      { key: "purpose", label: "Purpose", type: "text", required: true, hint: "e.g. to appear and give evidence" },
      { key: "on", label: "Date of appearance", type: "date" },
    ],
    compose: (c) => ({ doc: record("PARTICULARS FOR SUMMONS", [{ type: "note", text: "Office sheet of particulars for the registry. This is not a summons." }, caseKv(c), { type: "kv", rows: [["Recipient", s(c, "recipient")], ["Status", s(c, "role")], ["Particulars", s(c, "identity")], ["Address", s(c, "address")], ["Purpose", s(c, "purpose")], ["Date", s(c, "on") ? d(s(c, "on")) : "As fixed by the Court"]] }], /\b\d{6}\b/.test(s(c, "address")) ? [] : ["The address has no six-digit PIN code."]) }),
  },
  {
    no: 57,
    officeWide: true,
    data: "day",
    inputs: [{ key: "date", label: "Preparing for", type: "date", required: true, hint: "The next working day" }],
    compose: (c) => {
      const day = c.data.day!;
      const att = day.entries.filter((e) => e.kind === "attendance" && e.data.hearing_on === day.date);
      const prep = day.tasks.filter((t) => t.slot === "tomorrow" && t.status !== "completed" && t.status !== "closed");
      return {
        doc: record(`TOMORROW'S COURT PREPARATION: ${d(day.date)}`, [
          day.matters.length ? { type: "table", columns: ["Case S.No.", "Court", "Case", "Cause title", "For", "Advocate"], rows: day.matters.map((m) => [String(m.serial).padStart(3, "0"), m.court, m.caseLabel, m.causeTitle, m.purpose || m.stage, m.advocate]) } : { type: "note", text: "No matters recorded for this date." },
          { type: "heading", text: "Clients and witnesses to attend" },
          att.length ? { type: "table", columns: ["Case", "Person", "As", "Report by", "Bring", "Status"], rows: att.map((e) => [e.serial ? String(e.serial).padStart(3, "0") : "", e.data.person ?? "", e.data.role ?? "", e.data.reporting_time ?? "", e.data.bring ?? "", e.data.status ?? ""]) } : { type: "note", text: "None recorded." },
          { type: "heading", text: "Work to finish before court" },
          prep.length ? { type: "table", columns: ["Case", "Work", "Status", "With"], rows: prep.map((t) => [t.serial ? String(t.serial).padStart(3, "0") : "Office", t.title, TASK_STATUS_LABELS[t.status], t.assignee]) } : { type: "note", text: "None listed." },
          { type: "note", text: "Only matters with a confirmed or recorded date appear. Check against the published cause list." },
        ]),
      };
    },
  },
  {
    no: 58,
    inputs: [
      { key: "documents", label: "Record wanted", type: "long", required: true },
      { key: "dates", label: "Its date", type: "text" },
      { key: "urgency", label: "Why it is urgent", type: "long", required: true },
    ],
    compose: (c) => ({
      doc: {
        causeTitle: true,
        addressee: ["To,", "The Head Copyist / Copying Section,", court(c) + "."],
        title: "URGENT APPLICATION FOR CERTIFIED COPIES",
        blocks: [Plain(`${client(c) || "The applicant"}, ${capacity(c)} in the above case, applies on urgent basis for certified copies of: ${s(c, "documents")}${s(c, "dates") ? ` dated ${s(c, "dates")}` : ""}.`), Plain(`Urgency: ${s(c, "urgency")}`), Plain("The applicant will pay the urgent copying charges as called for."), { type: "space", label: "Applicant / Counsel", align: "right" }],
        placeDate: true,
        docket: false,
        warnings: ["Urgent-copy procedure and charges are set by each copying section; confirm locally."],
      },
      entries: [{ kind: "copy", data: { documents: s(c, "documents"), applied_on: c.date || "", urgent: "Yes", status: "Applied" } }],
    }),
  },
  {
    no: 59,
    inputs: [
      { key: "listing", label: "Present listing", type: "text", required: true, hint: "e.g. not listed; listed on 20-12-2026" },
      { key: "urgency", label: "The actual urgency", type: "long", required: true },
      { key: "action", label: "What is asked", type: "text", required: true, hint: "e.g. list the I.A. tomorrow" },
      { key: "supporting", label: "Supporting material", type: "text" },
      IN_PROC,
    ],
    compose: (c) =>
      petition(c, "REQUEST FOR URGENT LISTING", [`Present listing: ${s(c, "listing")}.`, s(c, "urgency"), ...(s(c, "supporting") ? [`${s(c, "supporting")} is filed herewith.`] : [])], `It is therefore prayed that this Hon'ble Court may be pleased to ${s(c, "action").replace(/^to\s+/i, "")}.`),
  },
  {
    no: 61,
    inputs: [
      { key: "person", label: "Witness", type: "text", required: true },
      { key: "hearing", label: "Hearing date", type: "date", required: true, from: "next_hearing_date" },
      { key: "time", label: "Reporting time", type: "text", required: true },
      { key: "contact", label: "Contact", type: "text" },
      { key: "bring", label: "Documents to bring", type: "long" },
      { key: "status", label: "Attendance", type: "choice", required: true, options: ["To be informed", "Informed", "Attended", "Did not attend"] },
    ],
    compose: (c) => ({
      doc: record("WITNESS ATTENDANCE RECORD", [caseKv(c), { type: "kv", rows: [["Witness", s(c, "person")], ["Hearing date", d(s(c, "hearing"))], ["Report by", s(c, "time")], ["Contact", s(c, "contact")], ["Bring", s(c, "bring")], ["Attendance", s(c, "status")]] }]),
      entries: [{ kind: "attendance", data: { person: s(c, "person"), role: "Witness", hearing_on: s(c, "hearing"), reporting_time: s(c, "time"), bring: s(c, "bring"), contact: s(c, "contact"), status: s(c, "status") } }],
    }),
  },
  {
    no: 62,
    inputs: [
      { key: "person", label: "Witness", type: "text", required: true },
      { key: "purpose", label: "Travel / attendance for", type: "text", required: true },
      { key: "authorised", label: "Amount authorised (₹)", type: "money", required: true },
      { key: "paid", label: "Amount paid (₹)", type: "money", required: true },
      { key: "evidence", label: "Payment evidence", type: "text" },
      { key: "on", label: "Paid on", type: "date", required: true },
    ],
    compose: (c) => {
      const bal = num(s(c, "authorised")) - num(s(c, "paid"));
      return {
        doc: record("WITNESS EXPENSE RECORD", [caseKv(c), { type: "kv", rows: [["Witness", s(c, "person")], ["For", s(c, "purpose")], ["Authorised", money(num(s(c, "authorised")))], ["Paid", money(num(s(c, "paid")))], ["Balance", money(bal)], ["Paid on", d(s(c, "on"))], ["Evidence", s(c, "evidence") || "None recorded"]] }, { type: "space", label: "Received by the witness", align: "right" }], s(c, "evidence") ? [] : ["No payment evidence recorded."]),
        entries: [{ kind: "expense", data: { purpose: `Witness expenses: ${s(c, "person")}`, head: "Witness expenses", spent_on: s(c, "on"), amount: s(c, "paid"), reference: s(c, "evidence"), receipt: s(c, "evidence") ? "Yes" : "No", nature: "Actual expenditure" } }],
      };
    },
  },
  {
    no: 63,
    inputs: [
      { key: "witness", label: "Witness", type: "text", required: true },
      { key: "address", label: "Complete address with PIN", type: "long", required: true },
      { key: "purpose", label: "Purpose", type: "text", required: true, hint: "e.g. to give evidence; to produce records" },
      { key: "records", label: "Records to bring", type: "long" },
      { key: "order", label: "Order dated", type: "date", required: true },
      { key: "returnable", label: "Returnable on", type: "date" },
      { key: "fee", label: "Process fee / batta (₹)", type: "money" },
    ],
    compose: (c) => ({
      ...memo(
        c,
        "WITNESS PROCESS MEMO",
        [`By order dated ${d(s(c, "order"))}, this Hon'ble Court permitted ${theParty(c)} to summon ${s(c, "witness")} ${s(c, "purpose").replace(/^to\s+/i, "to ")}.`, ...(s(c, "records") ? [`The witness is to bring: ${s(c, "records")}.`] : []), ...(s(c, "fee") ? [`Process fee / batta of ${money(num(s(c, "fee")))} is paid.`] : [])],
        `It is prayed that summons may be issued to the witness at the following address${s(c, "returnable") ? `, returnable on ${d(s(c, "returnable"))}` : ""}:`,
        /\b\d{6}\b/.test(s(c, "address")) ? [] : ["The address has no six-digit PIN code."],
        [{ type: "lines", lines: [s(c, "witness") + ",", ...s(c, "address").split(/\n|,\s*/).filter(Boolean)] }],
      ),
      entries: [{ kind: "service", data: { recipient: s(c, "witness"), capacity: "Witness", process_type: "Summons", address: s(c, "address"), order_date: s(c, "order"), returnable_on: s(c, "returnable"), fee: s(c, "fee"), status: "To be dispatched" } }],
    }),
  },
];

/** The Daily Court Work Sheet: court-wise, then case serial-number-wise, under the five parts of the day. */
function daySheet(c: Ctx, title: string): Composed {
  const day = c.data.day!;
  const byCourt = new Map<string, DayMatter[]>();
  for (const m of [...day.matters].sort((a, b) => a.serial - b.serial)) byCourt.set(m.court || "Court not recorded", [...(byCourt.get(m.court || "Court not recorded") ?? []), m]);
  const blocks: Block[] = [];
  for (const [courtName, ms] of byCourt) {
    blocks.push({ type: "heading", text: courtName });
    for (const m of ms) {
      blocks.push({
        type: "kv",
        rows: [
          ["Case S.No.", `${String(m.serial).padStart(3, "0")}${m.fileCode ? ` · File ${m.fileCode}` : ""}`],
          ["Case", m.caseLabel],
          ["Cause title", m.causeTitle],
          ["Client", m.client ? `${m.client}${m.capacity ? `, ${m.capacity}` : ""}` : ""],
          ["Status (as recorded)", m.stage],
          ["Hearing purpose", m.purpose],
          ["Advocate", m.advocate],
          ["Source of date", m.source],
        ],
      });
    }
  }
  if (!day.matters.length) blocks.push({ type: "note", text: "No matters recorded for this date." });
  for (const slot of ["before_court", "during_court", "after_court", "evening", "tomorrow"] as TaskSlot[]) {
    const ts = day.tasks.filter((t) => t.slot === slot && t.status !== "completed" && t.status !== "closed");
    if (!ts.length) continue;
    blocks.push({ type: "heading", text: TASK_SLOT_LABELS[slot] });
    blocks.push({ type: "table", columns: ["Case", "Work", "Status", "Due", "With"], rows: ts.map((t) => [t.serial ? String(t.serial).padStart(3, "0") : "Office", `${t.workNo ? `[${t.workNo}] ` : ""}${t.title}`, TASK_STATUS_LABELS[t.status], t.due ? d(t.due) : "", t.assignee]) });
  }
  return { doc: record(`${title}: ${d(day.date)}`, blocks, [], "Court-wise, then case serial number-wise") };
}

export const getService = (no: number) => SERVICES.find((x) => x.no === no);

/** Required inputs left empty, by label. */
export function missingInputs(spec: ServiceSpec, i: Inputs): string[] {
  return spec.inputs
    .filter((f) => f.required)
    .filter((f) => {
      const v = i[f.key];
      return f.type === "list" ? !Array.isArray(v) || !v.some((r) => r.some((x) => x.trim())) : typeof v !== "string" || !v.trim();
    })
    .map((f) => f.label);
}

/** Inputs as received over the wire, trimmed, dates made ISO, money checked. Returns an error message on bad input. */
export function cleanInputs(spec: ServiceSpec, raw: unknown): Inputs | string {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Inputs = {};
  for (const f of spec.inputs) {
    const v = src[f.key];
    if (f.type === "list") {
      if (!Array.isArray(v)) continue;
      out[f.key] = v
        .slice(0, 200)
        .filter((r): r is unknown[] => Array.isArray(r))
        .map((r) => (f.columns ?? []).map((_, k) => (typeof r[k] === "string" ? (r[k] as string).trim().slice(0, 1000) : "")));
      continue;
    }
    let t = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
    t = t.slice(0, f.type === "long" || f.type === "paras" ? 8000 : 500);
    if (!t) continue;
    if (f.type === "date") {
      const iso = parseIndianDate(t);
      if (!iso) return `${f.label}: give the date as DD-MM-YYYY.`;
      t = iso;
    }
    if (f.type === "money" || f.type === "number") {
      const n = Number(t.replace(/[,₹\s]/g, ""));
      if (!Number.isFinite(n) || n < 0) return `${f.label} must be a number.`;
      t = String(n);
    }
    if (f.type === "choice" && f.options && !f.options.includes(t)) return `${f.label}: choose one of the options.`;
    out[f.key] = t;
  }
  return out;
}
