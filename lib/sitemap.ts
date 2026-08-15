/**
 * ============================================================================
 * THE PRODUCT MAP — transcribed from the hand-drawn flow sketch.
 * ============================================================================
 *
 * This began as a transcription of a photographed pen-and-paper flowchart, so
 * parts of it were a READING of handwriting rather than a fact. Every label
 * has since been confirmed or removed by the author, so nothing here is a
 * guess today and no box currently sets `unread`.
 *
 * The `unread` flag is kept anyway, because the rule it enforces still holds:
 * a label that cannot be read with confidence gets flagged, draws dashed with
 * a "?", and is never quietly presented as settled — the same rule
 * lib/library.ts applies to citations. Set it rather than inventing a label.
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
  /**
   * Turns the box into a choice. Each option is a real destination, so the
   * menu navigates rather than just setting a value — every box on the map
   * leads somewhere.
   *
   * Mutually exclusive with `href`: a box cannot be both a link and a control
   * without nesting one interactive element inside another.
   */
  options?: readonly { label: string; href: string }[];
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
  /**
   * Renders the state / union-territory picker under this stage's boxes.
   * A flag rather than the component itself, so this stays a data module the
   * server can render and /map keeps deciding what to draw.
   */
  statePicker?: boolean;
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
    title: "Advocate",
    summary: "Who brings the matter, and which forum it belongs in.",
    serves: ["courses", "library"],
    /* Order confirmed against the sketch: lawyers, student, clerk, High Court,
       trial courts, drafts. Refs renumbered to follow that order rather than
       leaving 2A, 2C, 2B running down the row. */
    boxes: [
      { label: "Lawyers", ref: "2A", href: "/courses#proficient" },
      { label: "Student", ref: "2B", href: "/courses#starter" },
      { label: "Clerk", ref: "2C", href: "/documents" },
      { label: "High Court", href: "/library?court=high-court" },
      { label: "Trial Courts", href: "/library?court=trial-courts" },
      { label: "Drafts", href: "/documents" },
    ],
  },
  {
    n: 3,
    title: "State",
    summary: "The matter moves up: writ jurisdiction and the Supreme Court.",
    serves: ["library"],
    boxes: [{ label: "Supreme Court", href: "/library?court=supreme-court" }],
    statePicker: true,
  },
  {
    n: 4,
    title: "Draft",
    summary: "The first document goes on paper, checked against the bare act.",
    serves: ["draft-bot", "library"],
    /* 4B is Bare Acts and 4C is Thesis, both confirmed — "Thesis" is the word
       this transcription had misread as "Thorp". Petition moves to 4D. */
    boxes: [
      { label: "Draft", ref: "4A", href: "/draft-bot" },
      { label: "Bare Acts", ref: "4B", href: "/library?collection=acts" },
      { label: "Thesis", ref: "4C", href: "/courses" },
      { label: "Petition", ref: "4D", href: "/documents/petition" },
    ],
  },
  {
    n: 5,
    title: "Interlocutory Application",
    summary:
      "Relief sought while the suit is pending — the application, the affidavit it rests on, and the replies to it.",
    serves: ["draft-bot"],
    boxes: [
      { label: "Affidavit", href: "/documents/affidavit" },
      { label: "Petition", href: "/documents/petition" },
      { label: "Counter-claim", href: "/documents/counter-claim" },
      { label: "Rejoinder", href: "/documents/rejoinder" },
    ],
  },
  {
    n: 6,
    title: "Pleadings / Issues",
    summary:
      "The suit and the answer to it, down to the issues the court frames.",
    serves: ["draft-bot", "courses"],
    /* Pleadings close before the trial opens, so the plaint sits here with the
       written statement and counter-claim rather than a stage of its own, and
       the stage ends where the issues are settled. */
    boxes: [
      { label: "Plaint", href: "/documents/plaint" },
      { label: "Written statement", href: "/documents/written-statement" },
      { label: "Counter-claim", href: "/documents/counter-claim" },
      { label: "Rejoinder", href: "/documents/rejoinder" },
      { label: "Issues", href: "/documents/issues" },
    ],
  },
  {
    n: 7,
    title: "Trial",
    summary: "Evidence and argument, once the issues are settled.",
    serves: ["draft-bot", "courses"],
    boxes: [
      { label: "Examination-in-chief", ref: "7A", href: "/documents/examination-in-chief" },
      { label: "Cross-examination", ref: "7B", href: "/documents/cross-examination" },
      {
        label: "Arguments",
        ref: "7C",
        options: [
          { label: "Oral", href: "/documents/oral-arguments" },
          { label: "Written", href: "/documents/written-arguments" },
        ],
      },
    ],
  },
  {
    n: 8,
    title: "Citations",
    summary: "Every proposition tied to an authority that actually binds.",
    serves: ["library"],
    boxes: [
      { label: "SC citations", href: "/library?court=supreme-court" },
      { label: "HC citations", href: "/library?court=high-court" },
    ],
  },
  {
    n: 9,
    title: "Beyond the matter",
    summary: "What comes after the file closes.",
    serves: [],
    boxes: [{ label: "Internship", href: "/internship" }],
  },
];

/**
 * The stages a given product answers, derived from `serves` rather than listed
 * again. This is what lets a product page say where it sits on the map without
 * a second copy of that relationship drifting out of step with this one.
 */
export function stagesServedBy(product: Product) {
  return MAP_STAGES.filter((s) => s.serves.includes(product));
}
