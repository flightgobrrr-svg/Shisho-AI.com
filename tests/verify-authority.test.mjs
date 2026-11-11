// The citation check used by every Shisho tool in the app. It must accept the
// Library's own judgments and provisions and refuse anything else.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { checkAuthority } = await import("../lib/verifyAuthority.ts");

test("verified judgments match by citation or by both parties", () => {
  assert.equal(checkAuthority("Kesavananda Bharati v. State of Kerala").verified, true);
  assert.equal(checkAuthority("(1973) 4 SCC 225").verified, true);
  assert.equal(checkAuthority("Maneka Gandhi v Union of India, (1978) 1 SCC 248").verified, true);
});

test("provisions in the Bare Acts collection match", () => {
  assert.equal(checkAuthority("Order VII Rule 11, CPC").verified, true);
  assert.equal(checkAuthority("Order XXXIX Rule 1 of the Code of Civil Procedure").verified, true);
  assert.equal(checkAuthority("Article 21, Constitution of India").verified, true);
  assert.equal(checkAuthority("Section 143, Bharatiya Sakshya Adhiniyam, 2023").verified, true);
});

test("anything outside the verified lists is not vouched for", () => {
  assert.equal(checkAuthority("Sharma v. Gupta, (2031) 9 SCC 1").verified, false);
  assert.equal(checkAuthority("Section 999, Indian Contract Act").verified, false);
  assert.equal(checkAuthority("Kesavananda").verified, false);
  assert.equal(checkAuthority("Section 139").verified, false);
});

test("titles with brackets never break the check", () => {
  // "State (CBI/SPE)" once produced an invalid pattern and threw, failing the whole tool answer.
  assert.doesNotThrow(() => checkAuthority("Narasimha Rao case on parliamentary immunity"));
  assert.equal(checkAuthority("P.V. Narasimha Rao v. State (CBI/SPE), (1998) 4 SCC 626").verified, true);
  for (const t of ["(", ")", "[x]", "a+b", "x?*", "State (CBI", "\\"]) assert.doesNotThrow(() => checkAuthority(t), t);
});
