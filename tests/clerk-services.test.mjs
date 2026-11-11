// Advocate Clerk Work: every one of the 63 services generates. The 60 typed
// services are rendered with sample answers (invented test data) and checked
// for a real PDF and Word file, the safeguards they promise, and the register
// rows they file.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { CLERK_WORK, getWork } = await import("../lib/clerkWork.ts");
const { SERVICES, getService, missingInputs, cleanInputs } = await import("../lib/clerkServices.ts");
const { generateDocument } = await import("../lib/clerkGenerate.ts");
const { cleanEntry, parseIndianDate, redact, REGISTERS } = await import("../lib/clerkRegisters.ts");
const { extractText, getDocumentProxy } = await import("unpdf");

const row = (key, value) => ({ id: `${key}-1`, matter_id: "m", upload_id: "u1", key, value, page: 1, quote: null, confidence: "high", status: "confirmed", chosen: true, as_of: null, decided_by: null, decided_at: null, created_at: "" });
const CASE = Object.fromEntries(
  Object.entries({
    court_name: "II Additional Senior Civil Judge, Guntur",
    court_place: "Guntur",
    case_type: "O.S.",
    case_number: "125",
    case_year: "2025",
    cause_title: "K. Ramaiah v. P. Venkata Rao",
    petitioner_side: "K. Ramaiah, S/o K. Subbaiah, aged 58 years, residing at Pedakakani, Guntur District 522509",
    respondent_side: "P. Venkata Rao, S/o P. Narasimha Rao, aged 61 years",
    client_name: "K. Ramaiah",
    client_capacity: "Plaintiff",
    client_parentage: "S/o K. Subbaiah",
    client_age: "58",
    client_occupation: "Agriculturist",
    client_address: "Door No. 4-12, Pedakakani, Guntur District 522509",
    advocate_name: "M. Lakshmi",
    advocate_enrolment: "AP/1234/2010",
    advocate_address: "2nd Lane, Brodipet, Guntur 522002",
    next_hearing_date: "14-11-2026",
    next_hearing_purpose: "appearance of defendant",
    stage: "Appearance",
    court_directions: "File the original sale deed within two weeks.",
  }).map(([k, v]) => [k, row(k, v)]),
);

function sampleInputs(spec) {
  const out = {};
  for (const f of spec.inputs) {
    if (f.type === "list") out[f.key] = [f.columns.map((c, k) => (/date|on \(/i.test(c) ? "14-11-2026" : /pages|amount|mb/i.test(c) ? String(3 + k) : /yes\/no/i.test(c) ? "yes" : /actual/i.test(c) ? "Actual" : `${c} sample`))];
    else if (f.type === "date") out[f.key] = "14-11-2026";
    else if (f.type === "money") out[f.key] = "1500";
    else if (f.type === "number") out[f.key] = "3";
    else if (f.type === "choice") out[f.key] = f.options[0];
    else if (f.type === "paras") out[f.key] = "The defendant has not appeared.\nThe plaintiff seeks the relief prayed for.";
    else if (f.key === "address") out[f.key] = "Door No. 1-2, Main Road, Tenali, Guntur District 522201";
    else out[f.key] = `${f.label} (sample)`;
  }
  return out;
}

const DAY = {
  date: "2026-11-14",
  matters: [{ serial: 7, fileCode: "CIV/2025/031", court: "II Addl. Senior Civil Judge, Guntur", caseLabel: "O.S. 125/2025", causeTitle: "K. Ramaiah v. P. Venkata Rao", client: "K. Ramaiah", capacity: "Plaintiff", advocate: "M. Lakshmi", purpose: "Appearance", stage: "Appearance", source: "Case record" }],
  tasks: [{ serial: 7, caseLabel: "O.S. 125/2025", title: "File process memo", status: "in_progress", slot: "before_court", due: "2026-11-14", assignee: "Ravi", workNo: 49, updatedOn: "2026-11-14" }],
  entries: [
    { kind: "expense", data: { purpose: "Process fee", head: "Process fee / batta", amount: "150", receipt: "Yes", reference: "R-12", nature: "Actual expenditure" }, entry_date: "2026-11-14", status: null, amount: 150, serial: 7, case_label: "O.S. 125/2025" },
    { kind: "expense", data: { purpose: "Postage", head: "Postage", amount: "45", receipt: "No", nature: "Actual expenditure" }, entry_date: "2026-11-14", status: null, amount: 45, serial: 7, case_label: "O.S. 125/2025" },
  ],
  hearingsEntered: [],
};
const ENTRIES = [
  { kind: "objection", data: { objection: "Court fee short by Rs. 10", raised_on: "2026-11-01", action: "Paid the balance", status: "Corrected", supporting: "Receipt" }, entry_date: "2026-11-01", status: "Corrected", amount: null },
  { kind: "objection", data: { objection: "Index not paginated", raised_on: "2026-11-01", status: "Open" }, entry_date: "2026-11-01", status: "Open", amount: null },
  { kind: "filing", data: { document: "Plaint", filed_on: "2026-10-01", status: "Under scrutiny", filing_number: "SR 4521" }, entry_date: "2026-10-01", status: "Under scrutiny", amount: null },
  { kind: "custody", data: { document: "Sale deed", original: "Yes", where: "In office", received_on: "2026-09-01" }, entry_date: "2026-09-01", status: "In office", amount: null },
  { kind: "service", data: { recipient: "P. Venkata Rao", process_type: "Notice", status: "Dispatched", dispatched_on: "2026-11-02" }, entry_date: "2026-11-02", status: "Dispatched", amount: null },
  { kind: "copy", data: { documents: "Order dated 01-11-2026", applied_on: "2026-11-03", status: "Applied" }, entry_date: "2026-11-03", status: "Applied", amount: null },
];

test("every one of the 63 services has a builder", () => {
  assert.equal(SERVICES.length, 60);
  for (const w of CLERK_WORK) {
    if ([26, 27, 60].includes(w.no)) assert.notEqual(w.generator, "typed");
    else assert.ok(getService(w.no), `service ${w.no} ${w.name}`);
  }
  assert.equal(new Set(SERVICES.map((s) => s.no)).size, 60);
});

for (const spec of SERVICES) {
  const work = getWork(spec.no);
  test(`${spec.no}. ${work.name} generates a PDF and Word file`, async () => {
    const cleaned = cleanInputs(spec, sampleInputs(spec));
    assert.equal(typeof cleaned, "object", String(cleaned));
    assert.deepEqual(missingInputs(spec, cleaned), []);
    const out = await generateDocument({ work, fields: spec.officeWide ? {} : CASE, filingDate: "2026-11-14", blank: null, mapping: null, draft: true, inputs: cleaned, data: { entries: ENTRIES, day: DAY } }, new Map([["u1", "plaint.pdf"]]));
    assert.ok(out.report.pageCount >= 1);
    assert.equal(out.docx.subarray(0, 2).toString(), "PK");
    const text = (await extractText(await getDocumentProxy(out.pdf), { mergePages: true })).text;
    assert.match(text, /DRAFT FOR ADVOCATE REVIEW/);
    assert.ok(text.length > 120, `${spec.no} produced almost nothing`);
    assert.doesNotMatch(text, /undefined|NaN|\[object Object\]/, `${spec.no} printed a broken value`);
  });
}

test("a typed service refuses to generate with its required answers missing", async () => {
  await assert.rejects(generateDocument({ work: getWork(3), fields: CASE, filingDate: "", blank: null, mapping: null, draft: true, inputs: {} }, new Map()), /Fill in: .*actual reason/);
});

const gen = async (no, inputs, extra = {}) => generateDocument({ work: getWork(no), fields: CASE, filingDate: "2026-11-14", blank: null, mapping: null, draft: false, inputs: cleanInputs(getService(no), inputs), data: { entries: ENTRIES, day: DAY }, ...extra }, new Map());
const textOf = async (out) => (await extractText(await getDocumentProxy(out.pdf), { mergePages: true })).text;

test("an adjournment petition carries the party's own reason and asks only for the period given, with a docket", async () => {
  const out = await gen(3, { hearing: "14-11-2026", stage: "evidence", reason: "The plaintiff's counsel is engaged in a part-heard trial before the Principal District Judge.", period: "two weeks" });
  const t = await textOf(out);
  assert.match(t, /PETITION FOR ADJOURNMENT/);
  assert.match(t, /part-heard trial/);
  assert.match(t, /adjourn the matter by two weeks/);
  assert.match(t, /Counsel for the Plaintiff/);
  assert.equal(out.report.docketAdded, true);
  assert.doesNotMatch(t, /illness|consent/i);
});

test("a service affidavit for dispatch only never claims service", async () => {
  const out = await gen(54, { name: "Ravi", role: "clerk to the counsel for the Plaintiff", recipient: "P. Venkata Rao", document: "notice", mode: "Registered post with acknowledgment", sent: "02-11-2026", outcome: "Dispatched: delivery not yet confirmed", own: "I personally booked the article at the Guntur head post office." });
  const t = await textOf(out);
  assert.match(t, /dispatch only/);
  assert.doesNotMatch(t, /was delivered|duly served/);
  assert.match(t, /VERIFICATION/);
  assert.match(t, /attestation/i);
});

test("a returned cover memo reproduces the endorsement and leaves service to the court", async () => {
  const out = await gen(52, { recipient: "P. Venkata Rao", article: "RA123456789IN", dispatched: "02-11-2026", endorsement: "Addressee left, returned to sender" });
  const t = await textOf(out);
  assert.match(t, /"Addressee left, returned to sender"/);
  assert.doesNotMatch(t, /deemed served|duly served/i);
  assert.equal(out.entries[0].kind, "service");
  assert.equal(out.entries[0].data.status, "Returned unserved");
});

test("an acknowledgment with an unclear signature says the recipient is not confirmed", async () => {
  const t = await textOf(await gen(1, { recipient: "P. Venkata Rao", article: "RA1", dispatched: "02-11-2026", signature: "Is signed but the signature is not clear" }));
  assert.match(t, /identity of the person\s+who received the article is not confirmed/);
});

test("full compliance without proof is written as part compliance", async () => {
  const out = await gen(18, { direction: "File the original deed", order: "01-11-2026", action: "filed a certified copy", extent: "In full, shown by the documents filed" });
  const t = await textOf(out);
  assert.match(t, /complied with in part/);
  assert.ok(out.report.warnings.some((w) => /in part/.test(w)));
});

test("a clerk's report hearing entry is recorded as unconfirmed", async () => {
  const out = await gen(38, { on: "14-11-2026", source: "Clerk's report (to be confirmed)", result: "Adjourned for counter", next: "28-11-2026" });
  assert.equal(out.hearing.source, "clerk_report");
  assert.equal(out.hearing.next_on, "2026-11-28");
  assert.match(await textOf(out), /NOT CONFIRMED/);
});

test("the exhibit index keeps proposed markings apart from those the court marked", async () => {
  const t = await textOf(await gen(33, { items: [["P1", "Sale deed", "2010", "yes"], ["P2", "Tax receipt", "2011", "no"]] }));
  assert.match(t, /Marked by the Court[\s\S]*P1[\s\S]*Proposed[\s\S]*\(P2\)/);
});

test("the expense statement totals actual spend and flags missing receipts", async () => {
  const out = await generateDocument({ work: getWork(22), fields: {}, filingDate: "", blank: null, mapping: null, draft: false, inputs: cleanInputs(getService(22), { date: "14-11-2026", advance: "1000" }), data: { entries: [], day: DAY } }, new Map());
  const t = await textOf(out);
  assert.match(t, /Total spent\s*₹?195|Total spent[\s\S]*195/);
  assert.match(t, /Closing balance[\s\S]*805/);
  assert.match(t, /MISSING/);
});

test("a filing index numbers pages continuously", async () => {
  const t = await textOf(await gen(35, { papers: [["Plaint", "01-10-2026", "12", ""], ["Affidavit", "01-10-2026", "3", ""]] }));
  assert.match(t, /1[–-]12[\s\S]*13[–-]15/);
});

test("Indian dates are read day-first and nonsense is refused", () => {
  assert.equal(parseIndianDate("14-11-2026"), "2026-11-14");
  assert.equal(parseIndianDate("14/11/2026"), "2026-11-14");
  assert.equal(parseIndianDate("14.11.2026"), "2026-11-14");
  assert.equal(parseIndianDate("14th Nov 2026"), "2026-11-14");
  assert.equal(parseIndianDate("2026-11-14"), "2026-11-14");
  assert.equal(parseIndianDate("31-02-2026"), null);
  assert.equal(parseIndianDate("next Monday"), null);
});

test("register entries are validated per kind", () => {
  assert.match(String(cleanEntry("expense", { purpose: "Postage" })), /Head is needed|Date is needed|Amount/);
  const ok = cleanEntry("expense", { purpose: "Postage", head: "Postage", spent_on: "14-11-2026", amount: "₹ 1,200", nature: "Actual expenditure", receipt: true });
  assert.equal(ok.amount, 1200);
  assert.equal(ok.date, "2026-11-14");
  assert.equal(ok.data.receipt, "Yes");
  assert.equal(REGISTERS.length, 7);
});

test("redaction masks Aadhaar, PAN and account numbers, keeping the last four", () => {
  const r = redact("Aadhaar 1234 5678 9012, PAN ABCDE1234F, A/c No. 123456789012");
  assert.match(r, /XXXX XXXX 9012/);
  assert.doesNotMatch(r, /1234 5678/);
  assert.doesNotMatch(r, /ABCDE1234F/);
  assert.match(r, /XXXXXXXX9012/);
});

test("bilingual output: English paper, then the Telugu paper drawn with shaped Telugu", async () => {
  const { makeTranslator, teluguFonts } = await import("../lib/clerkLanguage.ts");
  const TE = {
    "PETITION FOR ADJOURNMENT": "వాయిదా కోసం పిటిషన్",
    "Between:": "మధ్య:",
    AND: "మరియు",
    Place: "స్థలం",
    Date: "తేదీ",
  };
  // A stand-in for Claude: known phrases in Telugu, everything else unchanged.
  const fake = async (strings) => strings.map((s) => TE[s] ?? (s.startsWith("The above matter") ? "పై కేసు 14-11-2026 తేదీన సాక్ష్యం కోసం వాయిదా పడింది." : s));
  const out = await generateDocument(
    { work: getWork(3), fields: CASE, filingDate: "2026-11-14", blank: null, mapping: null, draft: true, inputs: cleanInputs(getService(3), { hearing: "14-11-2026", stage: "evidence", reason: "Counsel is engaged in a part-heard trial.", period: "two weeks" }), translate: makeTranslator("bilingual", fake), fonts: teluguFonts },
    new Map(),
  );
  assert.ok(out.report.pageCount >= 3, "English paper, Telugu paper, docket");
  assert.deepEqual(out.report.unprintable, []);
  assert.ok(out.report.warnings.some((w) => /machine translation/.test(w)));
  const { writeFileSync } = await import("node:fs");
  if (process.env.CLERK_SAVE_SAMPLES) writeFileSync(`${process.env.CLERK_SAVE_SAMPLES}/bilingual.pdf`, out.pdf);
  const text = (await extractText(await getDocumentProxy(out.pdf.slice()), { mergePages: false })).text;
  assert.match(text[0], /PETITION FOR ADJOURNMENT/);
});

test("an affidavit's verification points at the facts the person marked as information received", async () => {
  const out = await gen(5, { facts: "First fact.\nSecond fact.\nThird fact, told by the village elders.", info: "3" });
  const t = await textOf(out);
  // Paragraph 1 is the opening; the third fact prints as paragraph 4.
  const flat = t.replace(/\s+/g, " ");
  assert.match(flat, /paragraphs 1, 2, 3 above are true to my personal knowledge/);
  assert.match(flat, /paragraph 4 are based on information received/);
});
