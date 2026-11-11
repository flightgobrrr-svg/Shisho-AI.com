/**
 * The sample draft in the homepage's "See what a marked-up draft looks like"
 * preview, shared by the website and the app so both show the same excerpt.
 * A readable excerpt rather than placeholder bars; each flagged line carries a
 * numbered marker that matches its note in the margin (`note` indexes the
 * dictionary's `productShowcase.miniNotes`).
 */
export const DRAFT_EXCERPT: { text: string; note?: number; heading?: boolean }[] = [
  { text: "IN THE HIGH COURT OF JUDICATURE", heading: true },
  { text: "Writ Petition (Civil) No. ____ of 2026", heading: true },
  { text: "1. The Petitioner is a citizen of India and carries on business in the city." },
  { text: "2. The Respondents are “State” within the meaning of Article 12.", note: 0 },
  { text: "3. The impugned order was passed without notice to the Petitioner." },
  { text: "PRAYER: stay the operation of the impugned order pending the petition.", note: 1 },
  { text: "Place: ____     Date: ____     Petitioner", note: 2 },
];

/** The intro on the Shisho page (/draft-bot, and the app's Shisho tab). */
export const SHISHO_INTRO =
  "Tell Shisho the facts and attach a file if you have one — it drafts the document, then marks it up in the margin the same way a senior hands back your work, with Indian authorities named where they apply.";

/** "What it drafts" on the Shisho page. */
export const DRAFT_TYPES = [
  "Plaints, written statements & rejoinders",
  "Interim applications & stay drafts",
  "Bail applications under the BNSS",
  "Legal notices & replies",
  "Writ petitions under Articles 226 & 32",
  "Synopsis, list of dates & grounds of appeal",
];

/** The sample beside "For advocates" on the Shisho page. */
export const GROUNDS_SAMPLE = {
  label: "Memorandum of grounds",
  rows: [
    { term: "Ground 1", detail: "Authority beside it" },
    { term: "Ground 2", detail: "Authority beside it" },
    { term: "Ground 3", detail: "Authority beside it" },
  ],
};
