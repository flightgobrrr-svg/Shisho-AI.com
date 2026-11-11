// Shisho downloads in the MSN house format: lines are laid out the way the
// firm's DRT application is, and no word of the draft is changed. The sample
// text below is invented test data.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import JSZip from "jszip";

register("./alias-hooks.mjs", import.meta.url);
const { classify, msnDocx, msnPdf, sameText } = await import("../lib/msnFormat.ts");

const PETITION = [
  "BEFORE THE DEBTS RECOVERY TRIBUNAL AT VISAKHAPATNAM",
  "S.A. No. _____ of 2026",
  "Between",
  "Sri Test Kumar, S/o. Sri Example Rao, aged about 50 years, residing at Visakhapatnam .. Applicant",
  "And",
  "1. Example Bank Ltd., represented by its Authorised Officer, Visakhapatnam .. Respondent",
  "SECURITISATION APPLICATION Under Section 17(1) of the SARFAESI Act, 2002",
  "Facts:",
  "1. The Applicant is the owner of the property.",
  "Main Prayer: The Applicant prays that the measure be declared invalid. (i) Set aside the notice. (ii) Restore possession.",
  "Schedule of Property All that house at Visakhapatnam, bounded by: East: Road West: House of A North: Lane South: Open land",
  "Place: Visakhapatnam Date: [Date]",
  "Counsel for Applicant Applicant",
  "VERIFICATION I, Test Kumar, verify the above.",
  "BEFORE THE DEBTS RECOVERY TRIBUNAL AT VISAKHAPATNAM",
  "I.A. No. _____ of 2026 in S.A. No. _____ of 2026",
  "Sri Test Kumar ... Applicant Versus Example Bank Ltd. ... Respondent",
  "AFFIDAVIT IN SUPPORT",
  "1. I am the Applicant.",
  "DEPONENT",
].join("\n");

test("the DRT layout: headings, parties, cause title, prayers, schedule, signatures", () => {
  const blocks = classify(PETITION);
  const kinds = blocks.map((b) => `${b.kind}${b.pageBreak ? "+break" : ""}:${b.text.slice(0, 24)}`);
  assert.deepEqual(kinds, [
    "court:BEFORE THE DEBTS RECOVER",
    "center_b:S.A. No. _____ of 2026",
    "both_b:Between",
    "party:Sri Test Kumar, S/o. Sri",
    "center_b:And",
    "party:1. Example Bank Ltd., re",
    "center_b:SECURITISATION APPLICATI",
    "center_b:Under Section 17(1) of t",
    "heading:Facts:",
    "both:1. The Applicant is the ",
    "heading:Main Prayer:",
    "both:The Applicant prays that",
    "both:(i) Set aside the notice",
    "both:(ii) Restore possession.",
    "heading:Schedule of Property",
    "both:All that house at Visakh",
    "lines:East: Road\nWest: House o",
    "split:Place: Visakhapatnam",
    "split:Counsel for Applicant",
    "heading:VERIFICATION",
    "both:I, Test Kumar, verify th",
    "court+break:BEFORE THE DEBTS RECOVER",
    "center_b:I.A. No. _____ of 2026 i",
    "split:Sri Test Kumar",
    "center:Versus",
    "split:Example Bank Ltd.",
    "heading:AFFIDAVIT IN SUPPORT",
    "both:1. I am the Applicant.",
    "both_b:DEPONENT",
  ]);
  assert.ok(sameText(PETITION, blocks));
});

test("an ordinary Shisho draft keeps every word, and the Word file uses the MSN template", async () => {
  const draft = [
    "LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881",
    "To,",
    "Mr. Example Payer, Hyderabad.",
    "Sub: Dishonour of cheque No. 000123 dated 01.09.2026 for ₹2,50,000 — notice of demand",
    "1. My client issued goods to you on credit; you gave the above cheque in discharge of the debt.",
    "2. The cheque was returned unpaid with the remark “Funds Insufficient” on 10.09.2026.",
    "You are called upon to pay the amount within 15 days of receipt of this notice.",
    "Place: Visakhapatnam Date: 20.09.2026",
  ].join("\n");
  const blocks = classify(draft);
  assert.ok(sameText(draft, blocks));
  assert.equal(blocks[0].kind, "center_b");
  assert.equal(blocks.at(-1).kind, "split");

  const docx = await msnDocx(blocks);
  const zip = await JSZip.loadAsync(docx);
  const xml = await zip.file("word/document.xml").async("string");
  assert.ok(!xml.includes("{{BODY}}"));
  assert.ok(xml.includes("w:w=\"11952\"") || xml.includes("11952"), "the template's page size");
  const words = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("");
  const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  assert.equal(unescape(words).replace(/\s+/g, ""), draft.replace(/\s+/g, ""));
  const styles = await zip.file("word/styles.xml").async("string");
  assert.match(styles, /Times New Roman/);

  const { pdf, report } = await msnPdf(blocks);
  assert.ok(pdf.length > 1000);
  // Times has no ₹, so the PDF prints it as "Rs." (the Word file keeps ₹); nothing is unprintable.
  assert.deepEqual(report.unprintable, []);
});

test("Telugu text is laid out with the Telugu face and the same blocks", async () => {
  const { teluguFonts } = await import("../lib/clerkLanguage.ts");
  const draft = "విశాఖపట్నం జిల్లా కోర్టు ముందు\n1. దరఖాస్తుదారు ఆస్తి యజమాని.\nPlace: Visakhapatnam Date: [Date]";
  const blocks = classify(draft);
  assert.ok(sameText(draft, blocks));
  const { pdf, report } = await msnPdf(blocks, teluguFonts);
  assert.ok(pdf.length > 1000);
  assert.deepEqual(report.unprintable, []);
  const zip = await JSZip.loadAsync(await msnDocx(blocks, { telugu: true }));
  assert.match(await zip.file("word/document.xml").async("string"), /Noto Sans Telugu/);
});
