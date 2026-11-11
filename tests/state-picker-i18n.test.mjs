// Every homepage language names every state, union territory and High Court
// in the picker. A missing entry would not break the page — the picker falls
// back to the English name — so without this a gap would show up only as one
// English word in the middle of a translated list.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { LOCALES } from "../lib/i18n/dictionaries.ts";
import { getStatePickerCopy } from "../lib/i18n/statePicker.ts";
import { HIGH_COURT_BY_STATE, STATES, UNION_TERRITORIES } from "../lib/states.ts";

const names = [...STATES, ...UNION_TERRITORIES];
const courts = [...new Set(Object.values(HIGH_COURT_BY_STATE))];

for (const locale of LOCALES.filter((l) => l !== "en")) {
  test(`state picker: ${locale} names every state, territory and court`, () => {
    const copy = getStatePickerCopy(locale);
    for (const name of names) assert.ok(copy.states?.[name], `${locale}: no name for ${name}`);
    for (const court of courts) assert.ok(copy.courts?.[court], `${locale}: no name for ${court}`);
    // No leftovers either: a key that is not a real state or court is a typo.
    assert.deepEqual(Object.keys(copy.states).sort(), [...names].sort());
    assert.deepEqual(Object.keys(copy.courts).sort(), [...courts].sort());
    assert.ok(copy.answerLabel && !copy.answerSentence, `${locale}: answer should be a label`);
  });
}

test("state picker: English uses the legal names unchanged", () => {
  const copy = getStatePickerCopy("en");
  assert.equal(copy.states, undefined);
  assert.equal(copy.courts, undefined);
  assert.deepEqual(copy.answerSentence, ["Writ jurisdiction lies with the", "."]);
});
