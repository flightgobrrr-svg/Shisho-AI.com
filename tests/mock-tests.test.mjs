// Every question a mock test can ask is built from verified data
// (lib/mockTests.ts). These checks keep each one fair: four distinct options,
// exactly one of them the answer, and a named source.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { EXAMS, buildTest, questionBank } = await import("../lib/mockTests.ts");
const { PREVIEW_CASES } = await import("../lib/library.ts");

for (const exam of EXAMS) {
  test(`${exam.id}: every question is well formed`, () => {
    for (const seed of [1, 2, 3, 99]) {
      const bank = questionBank(exam.id, seed);
      assert.ok(bank.length >= exam.length, `${exam.id} has only ${bank.length} questions`);
      for (const q of bank) {
        assert.equal(q.options.length, 4, q.id);
        assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4, `duplicate option in ${q.id}`);
        assert.ok(q.answer >= 0 && q.answer < 4, q.id);
        assert.ok(q.source.length > 0, q.id);
        assert.ok(q.prompt.length > 10, q.id);
      }
    }
  });

  test(`${exam.id}: a sitting has the right length, no repeats, and is repeatable`, () => {
    const a = buildTest(exam.id, 42);
    assert.equal(a.length, exam.length);
    assert.equal(new Set(a.map((q) => q.id)).size, a.length);
    assert.deepEqual(buildTest(exam.id, 42).map((q) => q.id), a.map((q) => q.id));
  });
}

test("judgment questions never offer a second judgment on the same topic", () => {
  const byTitle = new Map(PREVIEW_CASES.map((c) => [c.title, c]));
  for (const exam of EXAMS) {
    for (const q of questionBank(exam.id, 7).filter((q) => q.id.startsWith("case:"))) {
      const right = byTitle.get(q.options[q.answer]);
      for (const [i, o] of q.options.entries()) {
        if (i === q.answer) continue;
        const wrong = byTitle.get(o);
        assert.ok(wrong, o);
        assert.notEqual(wrong.topic, right.topic, q.id);
      }
    }
  }
});

test("document questions never offer a wrong option that names part of the answer", () => {
  // e.g. "Section 143, BSA" against the answer "Order XVIII Rule 4 CPC; Section 143, BSA".
  const key = (cite) =>
    cite.split(";").map((p) => p.toLowerCase().match(/(order [ivxl]+(?: rules? [\w()–-]+)?|section \d+[a-z]?|article \d+[a-z]?)/)?.[1]).filter(Boolean);
  for (const exam of EXAMS) {
    for (const q of questionBank(exam.id, 11).filter((q) => q.id.startsWith("doc:"))) {
      const answer = key(q.options[q.answer]);
      for (const [i, o] of q.options.entries()) {
        if (i === q.answer) continue;
        for (const k of key(o)) {
          assert.ok(!answer.some((a) => a === k || a.startsWith(k + " ") || k.startsWith(a + " ")), `${q.id}: "${o}" overlaps the answer`);
        }
      }
    }
  }
});

test("no question gives away its own answer", () => {
  // e.g. "…within thirty days…" asking for the period, or a clerk duty that names itself.
  const n = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  for (const exam of EXAMS) {
    for (const seed of [1, 5, 9]) {
      for (const q of questionBank(exam.id, seed)) {
        const a = n(q.options[q.answer]);
        if (a.length > 6) assert.ok(!n(q.prompt).includes(a), `${q.id} gives away "${q.options[q.answer]}"`);
      }
    }
  }
});
