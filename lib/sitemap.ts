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

/**
 * Which part of the product serves a stage. This is the join between the
 * sketch and the site: the map describes a matter's lifecycle, and every
 * stage of it is answered by Draft Bot, the Legal Library, or the Courses.
 * A stage with no `serves` is one nothing on the site handles yet — that is
 * information, not an omission to paper over.
 */
export type Product = "draft-bot" | "library" | "courses";

export const PRODUCT_META: Record<Product, { label: string; href: string }> = {
  "draft-bot": { label: "Shisho", href: "/draft-bot" },
  library: { label: "Legal Library", href: "/library" },
  courses: { label: "Courses", href: "/courses" },
};

export type MapBox = {
  label: string;
  /** Sub-reference as written on the sketch, e.g. "4C". */
  ref?: string;
  /** True when the handwriting could not be read with confidence. */
  unread?: boolean;
  /** Where this box goes, when something on the site actually serves it. */
  href?: string;
};

export type MapStage = {
  n: number;
  /** The stage's own heading on the sketch. */
  title: string;
  /** One line on what happens at this stage. */
  summary: string;
  /** Parts of the product that answer this stage, most relevant first. */
  serves: Product[];
  boxes: MapBox[];
};

export const MAP_STAGES: MapStage[] = [
  {
    n: 1,
    title: "Homepage",
    summary: "Where someone lands, and what Shisho is.",
    serves: [],
    boxes: [
      { label: "Shisho.in", href: "/" },
      { label: "About Shisho", href: "/" },
    ],
  },
  {
    n: 2,
    title: "Client",
    summary:
      "Who is bringing the matter, and which forum it belongs in.",
    serves: ["courses", "library"],
    boxes: [
      { label: "Lawyers", ref: "2A" },
      { label: "Clerk", ref: "2B" },
      { label: "Study", ref: "2C", href: "/courses" },
      { label: "Trial Courts", href: "/library" },
      { label: "Drafts", href: "/draft-bot" },
      { label: "High Court", href: "/library" },
    ],
  },
  {
    n: 3,
    title: "State",
    summary: "The matter moves up: writ jurisdiction and the Supreme Court.",
    serves: ["library"],
    boxes: [
      { label: "Supreme Court", href: "/library" },
      { label: "SO 1049", unread: true },
    ],
  },
  {
    n: 4,
    title: "Draft",
    summary: "The first document goes on paper, checked against the bare act.",
    serves: ["draft-bot", "library"],
    boxes: [
      { label: "Draft", ref: "4A", href: "/draft-bot" },
      { label: "Thorp", ref: "4B", unread: true },
      { label: "Petition", ref: "4C", href: "/draft-bot" },
      { label: "Acts", ref: "4D", href: "/library" },
    ],
  },
  {
    n: 5,
    title: "Affidavit",
    summary: "Sworn on oath, verified, and attested before it is filed.",
    serves: ["draft-bot"],
    boxes: [{ label: "Affidavit", href: "/draft-bot" }],
  },
  {
    n: 6,
    title: "Plaint",
    summary: "The suit itself — cause of action, jurisdiction, prayer.",
    serves: ["draft-bot", "courses"],
    boxes: [{ label: "Plaint", href: "/draft-bot" }],
  },
  {
    n: 7,
    title: "Pleadings & trial",
    summary: "Reply, evidence, and argument, once the other side is heard.",
    serves: ["draft-bot", "courses"],
    boxes: [
      { label: "Examination-in-chief", ref: "7A" },
      { label: "Cross-examination", ref: "7B" },
      { label: "Written arguments", ref: "7C", href: "/draft-bot" },
      { label: "Written statement", href: "/draft-bot" },
      { label: "Counter-claim / Rejoinder", href: "/draft-bot" },
    ],
  },
  {
    n: 8,
    title: "Citations",
    summary: "Every proposition tied to an authority that actually binds.",
    serves: ["library"],
    boxes: [
      { label: "SC citations", href: "/library" },
      { label: "HC citations", href: "/library" },
      { label: "Zone hearing query", unread: true },
    ],
  },
  {
    n: 9,
    title: "Beyond the matter",
    summary: "What comes after the file closes.",
    serves: [],
    boxes: [
      { label: "Internship" },
      { label: "Grand pay", unread: true },
      { label: "Digital", unread: true },
    ],
  },
];
