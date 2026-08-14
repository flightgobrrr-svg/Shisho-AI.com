/**
 * ============================================================================
 * THE PRODUCT MAP — transcribed from the hand-drawn flow sketch.
 * ============================================================================
 *
 * This is a transcription of a photographed pen-and-paper flowchart, so parts
 * of it are a READING of someone's handwriting rather than a fact. Anything
 * that could not be read with confidence carries `unread: true` and is drawn
 * with a dashed outline and a "?" marker, so the page never quietly presents a
 * guess as settled — the same rule lib/library.ts applies to citations.
 *
 * When a label is confirmed, drop the `unread` flag. Do not invent labels for
 * the unread boxes; leave the guess visible and marked until it is checked
 * against the original sketch.
 *
 * `ref` is the sub-reference written on the sketch itself (2A, 4C, 7B …).
 */

export type MapBox = {
  label: string;
  /** Sub-reference as written on the sketch, e.g. "4C". */
  ref?: string;
  /** True when the handwriting could not be read with confidence. */
  unread?: boolean;
};

export type MapStage = {
  n: number;
  /** The stage's own heading on the sketch. */
  title: string;
  boxes: MapBox[];
};

export const MAP_STAGES: MapStage[] = [
  {
    n: 1,
    title: "Homepage",
    boxes: [{ label: "Shisho.in" }, { label: "About Shisho" }],
  },
  {
    n: 2,
    title: "Client",
    boxes: [
      { label: "Lawyers", ref: "2A" },
      { label: "Clerk", ref: "2B" },
      { label: "Study", ref: "2C" },
      { label: "Trial Courts" },
      { label: "Drafts" },
      { label: "High Court" },
    ],
  },
  {
    n: 3,
    title: "State",
    boxes: [
      { label: "Supreme Court" },
      { label: "SO 1049", unread: true },
    ],
  },
  {
    n: 4,
    title: "Draft",
    boxes: [
      { label: "Draft", ref: "4A" },
      { label: "Thorp", ref: "4B", unread: true },
      { label: "Petition", ref: "4C" },
      { label: "Acts", ref: "4D" },
    ],
  },
  {
    n: 5,
    title: "Affidavit",
    boxes: [{ label: "Affidavit" }],
  },
  {
    n: 6,
    title: "Plaint",
    boxes: [{ label: "Plaint" }],
  },
  {
    n: 7,
    title: "Pleadings & trial",
    boxes: [
      { label: "Examination-in-chief", ref: "7A" },
      { label: "Cross-examination", ref: "7B" },
      { label: "Written arguments", ref: "7C" },
      { label: "Written statement" },
      { label: "Counter-claim / Rejoinder" },
    ],
  },
  {
    n: 8,
    title: "Citations",
    boxes: [
      { label: "SC citations" },
      { label: "HC citations" },
      { label: "Zone hearing query", unread: true },
    ],
  },
  {
    n: 9,
    title: "Beyond the matter",
    boxes: [
      { label: "Internship" },
      { label: "Grand pay", unread: true },
      { label: "Digital", unread: true },
    ],
  },
];
