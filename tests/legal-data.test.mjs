// Guards the legal data against silent edits. Each pinned value below was
// checked against a published source (see the header of the file it tests);
// if one of these fails, either the data was changed by mistake or a source
// was re-checked and the test should be updated in the same change.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { LIMITATION_ENTRIES, lastDay } from "../lib/limitation.ts";
import { IPC_BNS, searchIpcBns } from "../lib/ipcBns.ts";
import { DOCUMENTS, findDocumentForAuthority } from "../lib/documents.ts";

const utc = (s) => new Date(`${s}T00:00:00Z`);
const iso = (d) => d.toISOString().slice(0, 10);

test("limitation: periods match the Schedule", () => {
  const expected = {
    "art-19": [3, "years"],
    "art-54": [3, "years"],
    "art-55": [3, "years"],
    "art-58": [3, "years"],
    "art-65": [12, "years"],
    "art-113": [3, "years"],
    "art-137": [3, "years"],
    "art-116a": [90, "days"],
    "art-116b": [30, "days"],
    "art-117": [30, "days"],
    "art-122": [30, "days"],
    "art-123": [30, "days"],
    o8r1: [30, "days"],
  };
  assert.equal(LIMITATION_ENTRIES.length, Object.keys(expected).length);
  for (const entry of LIMITATION_ENTRIES) {
    const [n, unit] = expected[entry.id] ?? [];
    assert.equal(entry.period.n, n, `${entry.id} period`);
    assert.equal(entry.period.unit, unit, `${entry.id} unit`);
    assert.ok(entry.source.url.startsWith("https://"), `${entry.id} has a source`);
    assert.ok(entry.runsFrom && entry.description, `${entry.id} has text`);
  }
});

test("limitation: written statement has a 90-day outer limit", () => {
  const o8 = LIMITATION_ENTRIES.find((e) => e.id === "o8r1");
  assert.deepEqual(o8.outer.period, { n: 90, unit: "days" });
});

test("limitation: entry ids are unique", () => {
  const ids = LIMITATION_ENTRIES.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("limitation: lastDay arithmetic", () => {
  assert.equal(iso(lastDay(utc("2023-01-10"), { n: 3, unit: "years" })), "2026-01-10");
  assert.equal(iso(lastDay(utc("2020-02-29"), { n: 12, unit: "years" })), "2032-02-29");
  // No 29 February in the target year: ends on the 28th.
  assert.equal(iso(lastDay(utc("2024-02-29"), { n: 3, unit: "years" })), "2027-02-28");
  assert.equal(iso(lastDay(utc("2025-01-10"), { n: 90, unit: "days" })), "2025-04-10");
  assert.equal(iso(lastDay(utc("2025-03-01"), { n: 30, unit: "days" })), "2025-03-31");
  assert.equal(iso(lastDay(utc("2025-03-01"), { n: 90, unit: "days" })), "2025-05-30");
});

test("ipc-bns: pinned mappings", () => {
  const bns = (ipc) => IPC_BNS.find((r) => r.ipc === ipc)?.bns;
  assert.equal(bns("302"), "103(1)");
  assert.equal(bns("304B"), "80");
  assert.equal(bns("307"), "109");
  assert.equal(bns("379"), "303");
  assert.equal(bns("420"), "318");
  assert.equal(bns("498A"), "85");
  assert.equal(bns("34"), "3(5)");
});

test("ipc-bns: omitted sections stay omitted, disputed ones stay out", () => {
  assert.equal(IPC_BNS.find((r) => r.ipc === "377")?.bns, "");
  assert.equal(IPC_BNS.find((r) => r.ipc === "497")?.bns, "");
  // Sources disagree on these; they must not be added without re-checking.
  assert.equal(IPC_BNS.find((r) => r.ipc === "376"), undefined);
  assert.equal(IPC_BNS.find((r) => r.ipc === "124A"), undefined);
});

test("ipc-bns: no duplicate IPC rows, search works both ways", () => {
  const ipcs = IPC_BNS.map((r) => r.ipc);
  assert.equal(new Set(ipcs).size, ipcs.length);
  assert.equal(searchIpcBns(IPC_BNS, "420")[0].bns, "318");
  assert.ok(searchIpcBns(IPC_BNS, "theft").some((r) => r.ipc === "379"));
  assert.equal(searchIpcBns(IPC_BNS, "zzzz").length, 0);
});

test("documents: unique slugs, every document names its provision", () => {
  const slugs = DOCUMENTS.map((d) => d.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const d of DOCUMENTS) {
    assert.ok(d.provision.cite.length > 0, `${d.slug} cite`);
    assert.ok(d.provision.gist.length > 0, `${d.slug} gist`);
  }
});

test("documents: authority matching is strict", () => {
  const slug = (a) => findDocumentForAuthority(a)?.slug;
  assert.equal(slug("Order VIII Rr. 3–5, CPC 1908"), "written-statement");
  assert.equal(slug("Order XXXIX Rr. 1–2, CPC 1908"), "petition");
  assert.equal(slug("Order XIX R. 3, CPC 1908"), "affidavit");
  assert.equal(slug("Order XVIII R. 2(3A), CPC 1908"), "written-arguments");
  assert.equal(slug("Order VII Rule 11 CPC"), "plaint");
  // No match rather than a wrong match.
  assert.equal(slug("Order VI R. 15, CPC 1908"), undefined);
  assert.equal(slug("Art. 226(2), Constitution of India"), undefined);
  assert.equal(slug("s. 124, Indian Contract Act 1872"), undefined);
});
