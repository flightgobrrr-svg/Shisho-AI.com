// Advocate Clerk Work: the 63-service configuration, permissions, conflict
// handling, and the form engine end to end on a blank vakalatnama with a
// backside docket (the module's acceptance case). The case facts below are
// invented test data, not a real matter.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { PDFDocument, StandardFonts } from "pdf-lib";

register("./alias-hooks.mjs", import.meta.url);
const { CLERK_WORK, getWork, can, ROLES, documentFilename, isAmbiguousForum } = await import("../lib/clerkWork.ts");
const { analyseBlankForm, fillBlankForm } = await import("../lib/clerkForms.ts");
const { generateDocument, filenamesFor } = await import("../lib/clerkGenerate.ts");
const { conflicts, chosenValues } = await import("../lib/clerkCore.ts");
const { shapeExtraction } = await import("../lib/clerkExtract.ts");
const { extractText, getDocumentProxy } = await import("unpdf");

const D = (n) => ".".repeat(n);

/** A plain blank vakalatnama: page 1 the form, page 2 its backside docket. */
async function blankVakalat() {
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([595, 842]);
  const lines = [
    `IN THE COURT OF ${D(70)}`,
    `O.S. No. ${D(14)} of ${D(10)}`,
    "Between:",
    `${D(60)} Plaintiff`,
    "AND",
    `${D(60)} Defendant`,
    "VAKALATNAMA",
    `I/We ${D(40)} S/o ${D(30)}, aged ${D(6)} years,`,
    `residing at ${D(80)}`,
    `being the ${D(20)} in the above case, appoint Sri ${D(36)} Advocate,`,
    `Enrolment No. ${D(18)} to appear for me/us in the above case.`,
    `Place: ${D(22)}   Date: ${D(20)}`,
    `Signature of the executant: ${D(34)}`,
    `Identified by: ${D(30)}`,
    `Accepted: ${D(30)} Advocate`,
    "FOR COURT USE",
    `Order: ${D(50)}`,
  ];
  lines.forEach((t, i) => p1.drawText(t, { x: 50, y: 780 - i * 26, size: 10, font: f }));
  const p2 = doc.addPage([595, 842]);
  [`BACKSIDE DOCKET`, `IN THE COURT OF ${D(60)}`, `O.S. No. ${D(14)} of ${D(10)}`, `VAKALATNAMA`, `Filed by: ${D(40)}`, `Advocate for ${D(24)}`].forEach((t, i) =>
    p2.drawText(t, { x: 300, y: 760 - i * 26, size: 10, font: f }),
  );
  return doc.save();
}

const row = (key, value, extra = {}) => ({ id: `${key}-1`, matter_id: "m", upload_id: "u1", key, value, page: 1, quote: null, confidence: "high", status: "confirmed", chosen: true, as_of: null, decided_by: null, decided_at: null, created_at: "", ...extra });

/** Case Serial No. 7, as the reviewer confirmed it. */
const CASE7 = {
  court_name: row("court_name", "II Additional Senior Civil Judge, Guntur"),
  court_place: row("court_place", "Guntur"),
  case_type: row("case_type", "O.S."),
  case_number: row("case_number", "125"),
  case_year: row("case_year", "2025"),
  cause_title: row("cause_title", "K. Ramaiah v. P. Venkata Rao"),
  petitioner_side: row("petitioner_side", "1. K. Ramaiah, S/o K. Subbaiah, aged 58 years, agriculturist, residing at Door No. 4-12, Pedakakani village and mandal, Guntur District 522509"),
  respondent_side: row("respondent_side", "P. Venkata Rao"),
  client_name: row("client_name", "K. Ramaiah"),
  client_capacity: row("client_capacity", "Plaintiff"),
  client_parentage: row("client_parentage", "K. Subbaiah"),
  client_age: row("client_age", "58"),
  client_address: row("client_address", "Door No. 4-12, Pedakakani, Guntur District 522509"),
  advocate_name: row("advocate_name", "M. Lakshmi"),
  advocate_enrolment: row("advocate_enrolment", "AP/1234/2010"),
  advocate_address: row("advocate_address", "Advocate, 2nd Lane, Brodipet, Guntur"),
};

test("there are exactly 63 services, numbered 1 to 63 in alphabetical order", () => {
  assert.equal(CLERK_WORK.length, 63);
  CLERK_WORK.forEach((w, i) => assert.equal(w.no, i + 1));
  assert.equal(getWork(60).name, "Vakalatnama");
  assert.equal(getWork(26).name, "Docket — Backside");
  assert.equal(getWork(27).name, "Docket — Front");
  assert.equal(getWork(60).blankForm, "required");
  for (const w of CLERK_WORK) assert.ok(w.rule.length > 20, `${w.no} has its rule`);
});

test("only advocates and the administrator approve; read-only and accounts cannot prepare", () => {
  for (const r of ROLES) assert.equal(can(r, "approve"), ["office_admin", "senior_advocate", "advocate"].includes(r), r);
  assert.equal(can("clerk", "prepare"), true);
  assert.equal(can("junior_advocate", "approve"), false);
  assert.equal(can("read_only", "prepare"), false);
  assert.equal(can("accounts", "prepare"), false);
  assert.equal(can("clerk", "manage_members"), false);
});

test("file names follow the case serial / case number / work / date / version pattern", () => {
  assert.equal(documentFilename({ serial: 7, caseType: "OS", caseNumber: "125", caseYear: "2025", work: "Vakalatnama", date: "2026-10-25", version: 1, ext: "pdf" }), "007_OS_125_2025_Vakalatnama_2026-10-25_v1.pdf");
  assert.equal(filenamesFor({ serial: 7, fields: CASE7, workNo: 60, date: "2026-10-25", version: 1 }).pdf, "007_OS_125_2025_Vakalatnama_2026-10-25_v1.pdf");
  assert.equal(documentFilename({ serial: 12, work: "Docket — Front", date: "2026-10-25", version: 2, ext: "docx" }), "012_Unnumbered_Docket_Front_2026-10-25_v2.docx");
});

test("'Martial Court' is flagged as ambiguous, Court-Martial is not", () => {
  assert.equal(isAmbiguousForum("Martial Court"), true);
  assert.equal(isAmbiguousForum("General Court-Martial"), false);
});

test("rival readings with none chosen are a conflict; a chosen one settles it", () => {
  const a = row("case_number", "125", { id: "a", chosen: false, status: "unverified" });
  const b = row("case_number", "152", { id: "b", chosen: false, status: "unverified", upload_id: "u2" });
  assert.deepEqual(conflicts([a, b]), ["case_number"]);
  assert.deepEqual(conflicts([a, { ...b, chosen: true }]), []);
  assert.deepEqual(conflicts([a, { ...a, id: "c", value: "125 " }]), [], "the same value twice is agreement");
  assert.equal(chosenValues([a, { ...b, chosen: true }]).case_number.value, "152");
});

test("a reading is shaped: unknown keys dropped, no page means not high confidence", () => {
  const e = shapeExtraction({ document_kind: "Plaint", document_date: "12-03-2025", fields: [
    { key: "case_number", value: "125", page: 1, quote: "O.S. No. 125", confidence: "high" },
    { key: "made_up", value: "x", page: 1, quote: "", confidence: "high" },
    { key: "cnr", value: "APGT010012342025", page: 99, quote: "", confidence: "high" },
    { key: "client_name", value: "  ", page: 1, quote: "", confidence: "high" },
  ] }, 3);
  assert.equal(e.items.length, 2);
  assert.equal(e.items[1].page, null);
  assert.equal(e.items[1].confidence, "medium");
});

test("the blank form's blanks are found, and signature, attestation and court-use spaces are protected", async () => {
  const a = await analyseBlankForm(await blankVakalat());
  assert.equal(a.hasText, true);
  assert.equal(a.hasDocket, true);
  const s = (label) => a.placeholders.find((p) => p.label.endsWith(label));
  assert.equal(s("IN THE COURT OF").suggested, "court_name");
  assert.equal(s("O.S. No.").suggested, "case_number");
  assert.equal(s("I/We").suggested, "client_name");
  assert.equal(s("S/o").suggested, "client_parentage");
  assert.equal(s("aged").suggested, "client_age");
  assert.equal(s("residing at").suggested, "client_address");
  assert.equal(s("being the").suggested, "client_capacity");
  assert.equal(s("appoint Sri").suggested, "advocate_name");
  assert.equal(s("Enrolment No.").suggested, "advocate_enrolment");
  assert.equal(s("Place").suggested, "court_place");
  assert.equal(s("Date").suggested, "filing_date");
  assert.equal(s("Filed by").suggested, "advocate_name");
  assert.equal(s("Advocate for").suggested, "client_capacity");
  // Each blank starts where its dots are printed, never over its label.
  const helv = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
  for (const [label, text] of [["IN THE COURT OF", "IN THE COURT OF "], ["O.S. No.", "O.S. No. "], ["I/We", "I/We "]]) {
    const expected = 50 + helv.widthOfTextAtSize(text, 10);
    assert.ok(s(label).x >= expected - 0.5 && s(label).x < expected + 4, `${label}: blank at ${s(label).x.toFixed(1)}, dots at ${expected.toFixed(1)}`);
  }
  const plaintiffLine = a.placeholders.find((p) => p.after === "Plaintiff");
  assert.equal(plaintiffLine.suggested, "petitioner_side");
  for (const label of ["Signature of the executant", "Identified by", "Accepted", "Order"]) {
    assert.equal(s(label).protected, true, `${label} is protected`);
  }
});

test("acceptance: Work 60 for Case 7 fills front and backside, leaves protected spaces blank, saves DOCX and PDF", async () => {
  const blank = await blankVakalat();
  const a = await analyseBlankForm(blank);
  const mapping = Object.fromEntries(a.placeholders.map((p) => [p.id, p.suggested]));
  const out = await generateDocument({ work: getWork(60), fields: CASE7, filingDate: "2026-10-25", blank, mapping, draft: true }, new Map([["u1", "case-7-plaint.pdf"]]));

  // Nothing is drawn in a protected space, and the protected ones are reported as left blank.
  const protectedIds = a.placeholders.filter((p) => p.protected).map((p) => p.id);
  assert.ok(protectedIds.length >= 4);
  for (const id of protectedIds) {
    assert.ok(!out.report.filled.some((f) => f.id === id), `${id} not filled`);
    assert.ok(out.report.leftBlank.some((b) => b.id === id), `${id} reported blank`);
  }
  // The long petitioner description goes to a continuation sheet rather than overlapping.
  assert.ok(out.report.continued.some((c) => c.target === "petitioner_side"));
  assert.equal(out.report.docketAdded, false, "the form already has its backside docket");
  assert.equal(out.report.pageCount, 3, "front, backside docket, continuation sheet");

  const text = (await extractText(await getDocumentProxy(out.pdf), { mergePages: false })).text;
  assert.match(text[0], /II Additional Senior Civil Judge, Guntur/);
  assert.match(text[0], /K\. Ramaiah/);
  assert.match(text[0], /AP\/1234\/2010/);
  assert.match(text[0], /DRAFT FOR ADVOCATE REVIEW/);
  assert.match(text[1], /M\. Lakshmi/);
  assert.match(text[1], /Plaintiff/);
  assert.match(text[2], /CONTINUATION SHEET/);

  // Every inserted field carries its source document and page.
  const court = out.report.sources.find((s) => s.field === "court_name");
  assert.equal(court.source, "case-7-plaint.pdf");
  assert.equal(court.page, 1);

  // The editable DOCX is a real Word file.
  assert.equal(out.docx.subarray(0, 2).toString(), "PK");
  // Same inputs, same pages: the approved copy only drops the draft label.
  const clean = await generateDocument({ work: getWork(60), fields: CASE7, filingDate: "2026-10-25", blank, mapping, draft: false }, new Map());
  const cleanText = (await extractText(await getDocumentProxy(clean.pdf), { mergePages: true })).text;
  assert.doesNotMatch(cleanText, /DRAFT FOR ADVOCATE REVIEW/);
  assert.equal(clean.report.filled.length, out.report.filled.length);
});

test("a vakalatnama is never generated without the prescribed blank form", async () => {
  await assert.rejects(generateDocument({ work: getWork(60), fields: CASE7, filingDate: "", blank: null, mapping: null, draft: true }, new Map()), /prescribed blank Vakalatnama/);
});

test("the backside docket is generated on its own, with empty registry and signature spaces", async () => {
  const out = await generateDocument({ work: getWork(26), fields: CASE7, filingDate: "", blank: null, mapping: null, draft: true, documentName: "Written Statement" }, new Map());
  assert.equal(out.report.docketAdded, true);
  const text = (await extractText(await getDocumentProxy(out.pdf), { mergePages: true })).text;
  assert.match(text, /O\.S\. No\. 125 of 2025/);
  assert.match(text, /K\. Ramaiah/);
  assert.match(text, /\.\.\. Plaintiff/);
  assert.match(text, /\.\.\. Defendant/);
  assert.match(text, /WRITTEN STATEMENT/);
  assert.match(text, /FOR REGISTRY \/ COURT USE/);
  assert.match(text, /Date: _+/, "no filing date given, so it stays blank");
});

test("a scanned blank (no text layer) is refused rather than guessed at", async () => {
  const doc = await PDFDocument.create();
  doc.addPage([595, 842]);
  const a = await analyseBlankForm(await doc.save());
  assert.equal(a.hasText, false);
  await assert.rejects(generateDocument({ work: getWork(60), fields: CASE7, filingDate: "", blank: await doc.save(), mapping: {}, draft: true }, new Map()), /no text layer/);
});

test("a mapping cannot fill a protected space even if asked to", async () => {
  const blank = await blankVakalat();
  const a = await analyseBlankForm(blank);
  const sig = a.placeholders.find((p) => p.label.startsWith("Signature"));
  const { report } = await fillBlankForm(blank, a, { [sig.id]: "client_name" }, { client_name: "K. Ramaiah" }, { draft: true });
  assert.ok(!report.filled.some((f) => f.id === sig.id));
});
