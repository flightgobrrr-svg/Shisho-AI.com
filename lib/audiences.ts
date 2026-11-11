/**
 * Who Shisho AI is for — twelve audiences, one source of truth.
 *
 * Three already have a home on the site (Advocates, Clerks, Students), so they
 * carry an `href` and no page of their own. The other nine are described on
 * /for/[slug] and are `planned`: the page says so plainly. PRODUCT.md's
 * pre-launch rule applies — capability may be shown, adoption may not be
 * implied, and nothing here claims a feature is live that is not.
 *
 * `sample` is a small illustration of the kind of output the audience would
 * get. It is labelled "Sample" on the page and contains no scores, counts or
 * results, because there is no data behind any of it yet.
 */

export type AudienceSample = {
  label: string;
  rows: { term: string; detail?: string }[];
  note?: string;
};

export type Audience = {
  slug: string;
  /** Short name — the chip on the homepage and the row on /for. */
  name: string;
  /** Mono eyebrow above the headline. */
  eyebrow: string;
  /** Headline; the word between asterisks gets the brand emphasis. */
  headline: string;
  blurb: string;
  chips: string[];
  /** Where an audience that is already served goes. Absent = planned. */
  href?: string;
  cta?: string;
  sample?: AudienceSample;
  /** Extra line for audiences that must not be mistaken for legal advice. */
  disclaimer?: string;
  /**
   * Has its own /for page AND is served today, so the page says "Available
   * now" and offers no "tell me when this opens" sign-up.
   */
  live?: boolean;
  /** A short factual note on the page, about the law that shapes this audience. */
  aside?: string;
  /** Where `aside` comes from, and when it was checked (PRODUCT.md). */
  sources?: string;
  /**
   * The portrait photo shown beside the sample, as on the promo video's
   * slides. People in these photos appear with no name and no quote: an
   * illustration of who the section is for, never an endorsement (the Bar
   * Council of India's rules restrict advocates from advertising). Rights and
   * consent are recorded in the asset register.
   */
  photo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** CSS object-position for the crop; defaults to the upper middle. */
    focus?: string;
  };
};

export const AUDIENCES: Audience[] = [
  /* Advocates, in three: the junior in a senior's chambers, the senior who
     runs them, and the senior advocate designated under Section 16 of the
     Advocates Act, 1961. "Senior advocate" in the Act means only the
     designated kind; the middle group is the everyday sense of "my senior",
     and its page says so. Shisho serves all three today, so each is `live`. */
  {
    slug: "junior-advocates",
    photo: { src: "/audiences/junior-advocates.jpg", alt: "Young advocates in robes working through files and books in a library", width: 600, height: 912 },
    name: "Junior advocates",
    eyebrow: "For junior advocates",
    headline: "Learn the craft on real *drafts*.",
    blurb:
      "The first years of practice: first drafts, research for your senior, court duty and the listing. Shisho drafts with you and marks your work clause by clause, naming the provision behind each note.",
    chips: ["First drafts", "Research for your senior", "Court duty"],
    live: true,
    sample: {
      label: "First draft, marked",
      rows: [
        { term: "Cause title", detail: "Court and parties, as the registry wants them" },
        { term: "Verification", detail: "Missing: Order VI Rule 15, CPC" },
        { term: "Prayer", detail: "Each relief asked for separately" },
        { term: "Limitation", detail: "Plead the date the cause of action arose" },
      ],
    },
  },
  {
    slug: "senior-advocates",
    name: "Senior advocates",
    eyebrow: "For senior advocates in practice",
    headline: "Every draft *checked* before it is filed.",
    blurb:
      "You run the chambers and your juniors draft the matters. Check a draft for defects before it reaches the registry, confirm the last day to file, and prepare for the hearing with the authorities in one place.",
    chips: ["Draft review", "Limitation", "Hearing prep"],
    live: true,
    photo: {
      src: "/audiences/senior-advocates.webp",
      // A full-length portrait: keep his face in the crop, not his knees.
      focus: "50% 14%",
      alt: "An advocate in a black jacket and white bands, his gown over one arm, on the steps of a court building",
      width: 853,
      height: 1280,
    },
    aside:
      "Here \u201csenior\u201d means the advocate who runs chambers and briefs juniors. In the Advocates Act, 1961, \u201csenior advocate\u201d means one designated by the Supreme Court or a High Court; that has its own page.",
    sample: {
      label: "Before it goes to the registry",
      rows: [
        { term: "Limitation", detail: "Last day checked against the Schedule" },
        { term: "Pleadings", detail: "Clause notes on the junior\u2019s draft" },
        { term: "Authorities", detail: "Each one checked before it is cited" },
        { term: "Hearing", detail: "Issues and questions to expect from the bench" },
      ],
    },
  },
  {
    slug: "designated-senior-advocates",
    name: "Designated senior advocates",
    eyebrow: "For designated senior advocates",
    headline: "Walk into court with the *authorities* ready.",
    blurb:
      "You argue the matter, with the advocate who briefs you beside you. Shisho prepares a hearing note and lets you check every authority in the brief before you rely on it.",
    chips: ["Hearing notes", "Authority checks", "Judgment digests"],
    live: true,
    aside:
      "Designation is under Section 16(2) of the Advocates Act, 1961. The Bar Council of India Rules (Part VI, Chapter I) bar a senior advocate from accepting instructions to draft pleadings or affidavits, though not from settling a draft with the advocate who briefs them. So Shisho\u2019s drafting is for that advocate; for you it is hearing preparation and authority checks.",
    sources:
      "Advocates Act, 1961, Section 16; Bar Council of India Rules, Part VI, Chapter I. Checked 19 October 2026.",
    sample: {
      label: "Hearing note",
      rows: [
        { term: "Issues", detail: "What the court must decide" },
        { term: "Authorities", detail: "The paragraph that carries each point" },
        { term: "From the bench", detail: "Questions to expect" },
        { term: "Relief", detail: "What you will ask the court for" },
      ],
    },
  },
  {
    slug: "corporate",
    photo: { src: "/audiences/corporate.jpg", alt: "Lawyers at a boardroom table with papers and a data screen, a city skyline behind", width: 600, height: 912 },
    name: "Corporate",
    eyebrow: "For corporate lawyers",
    headline: "Close the deal. Protect the *business*.",
    blurb:
      "Review contracts, track compliance dates and prepare due diligence summaries in a fraction of the time.",
    chips: ["Contract review", "Compliance", "Due diligence"],
    sample: {
      label: "Contract review",
      rows: [
        { term: "Confidentiality", detail: "Standard" },
        { term: "Indemnity", detail: "Review" },
        { term: "Payment terms", detail: "Flagged" },
        { term: "Termination", detail: "Standard" },
        { term: "Governing law", detail: "Review" },
      ],
    },
  },
  {
    slug: "clerks",
    photo: { src: "/audiences/clerks.jpg", alt: "Advocate clerks with lanyards carrying and checking stacks of court files", width: 600, height: 912 },
    name: "Clerks",
    eyebrow: "For advocate clerks",
    headline: "Every filing, date and file in *order*.",
    blurb:
      "The practice manual, daily routine and working formats for filing, scrutiny and case tracking.",
    chips: ["Filing checklists", "Cause lists", "Reminders"],
    href: "/clerks",
    cta: "Open the practice manual",
  },
  {
    slug: "scholars",
    photo: { src: "/audiences/scholars.jpg", alt: "Researchers around a library table piled with old books and papers", width: 600, height: 912 },
    name: "Scholars",
    eyebrow: "For scholars",
    headline: "Trace a doctrine across *decades*.",
    blurb:
      "Follow judgments, statutes and commentary as one connected body of thought, with every source kept in view.",
    chips: ["Citations", "Comparative law", "Annotations"],
    sample: {
      label: "Doctrine map",
      rows: [
        { term: "Judgment" },
        { term: "Statute" },
        { term: "Commentary" },
        { term: "Journal" },
        { term: "Report" },
        { term: "Comparative" },
      ],
    },
  },
  {
    slug: "judges",
    photo: { src: "/audiences/judges.jpg", alt: "Judges in black robes and white bands beneath the scales of justice", width: 600, height: 912 },
    name: "Judges",
    eyebrow: "For judges",
    headline: "A clear record, close at *hand*.",
    blurb:
      "Issues, facts and authorities arranged for quick reference, so the bench can spend its time on reasoning.",
    chips: ["Case summary", "Chronology", "Authorities"],
    sample: {
      label: "Case record",
      rows: [
        { term: "Issues", detail: "Questions framed for determination" },
        { term: "Facts", detail: "Material facts in order of date" },
        { term: "Authorities", detail: "Cited on each side, with pinpoint pages" },
        { term: "Orders", detail: "Earlier directions and compliance" },
      ],
    },
  },
  {
    slug: "lecturers",
    photo: { src: "/audiences/lecturers.jpg", alt: "A group of law teachers in a faculty room", width: 600, height: 912 },
    name: "Lecturers",
    eyebrow: "For lecturers",
    headline: "Spend class time *teaching*, not preparing.",
    blurb:
      "Build lesson plans, gather case materials and set questions in minutes, then bring the classroom to life.",
    chips: ["Lesson plans", "Case materials", "Assessments"],
    sample: {
      label: "Lecture plan",
      rows: [
        { term: "Learning outcomes" },
        { term: "Landmark cases to discuss" },
        { term: "Questions for the class" },
        { term: "Short quiz and reading list" },
      ],
    },
  },
  {
    slug: "students",
    photo: { src: "/audiences/students.jpg", alt: "Law students around a table with laptops and books in a library", width: 600, height: 912 },
    name: "Students",
    eyebrow: "For law students",
    headline: "Learn the law. Then learn to *apply* it.",
    blurb:
      "Turn long judgments into clear case briefs, and prepare for moots, exams and internships with confidence.",
    chips: ["Case briefs", "Moot prep", "Exam revision"],
    href: "/courses",
    cta: "Start with courses",
  },
  {
    slug: "clat",
    photo: { src: "/audiences/clat.jpg", alt: "A modern classroom: a teacher at a large screen and students at their desks", width: 600, height: 912 },
    name: "CLAT",
    eyebrow: "For CLAT — Common Law Admission Test",
    headline: "Practise smart. Walk into the exam *ready*.",
    blurb:
      "Prepare for the Common Law Admission Test with timed mock tests, passage-based practice and clear explanations, and see where to improve next.",
    chips: ["Mock tests", "Legal reasoning", "Current affairs"],
    sample: {
      label: "Mock test sections",
      rows: [
        { term: "English Language" },
        { term: "Current Affairs" },
        { term: "Legal Reasoning" },
        { term: "Logical Reasoning" },
        { term: "Quantitative Techniques" },
      ],
    },
  },
  {
    slug: "judicial-exams",
    photo: { src: "/audiences/judicial-exams.jpg", alt: "Exam aspirants in robes studying among stacks of books", width: 600, height: 912 },
    name: "JCJ · DJ · APP",
    eyebrow: "For judiciary and prosecution exams",
    headline: "Prepare for the bench and the *prosecution*.",
    blurb:
      "Practise for Junior Civil Judge, District Judge and Assistant Public Prosecutor exams with topic tests, judgment writing and clear explanations.",
    chips: [
      "Junior Civil Judge",
      "District Judge",
      "Asst. Public Prosecutor",
      "Judgment writing",
    ],
    sample: {
      label: "Topic tests",
      rows: [
        { term: "Civil law" },
        { term: "Criminal law" },
        { term: "Evidence and procedure" },
        { term: "Prosecution practice" },
        { term: "Judgment writing" },
      ],
    },
  },
  {
    slug: "court-staff",
    photo: { src: "/audiences/court-staff.jpg", alt: "Candidates at computers in a modern lab, with a screen of icons", width: 600, height: 912 },
    name: "Court staff",
    eyebrow: "For court staff exams",
    headline: "Get ready for judiciary *employee* exams.",
    blurb:
      "Timed mock papers, typing and computer practice, and a clear study plan for court staff recruitment tests.",
    chips: ["Mock papers", "Computer skills", "Study plan"],
    sample: {
      label: "Study plan",
      rows: [
        { term: "Court procedure and office rules" },
        { term: "Typing and computer skills" },
        { term: "Reasoning and English" },
        { term: "General knowledge" },
        { term: "Timed mock paper" },
      ],
    },
  },
  {
    slug: "citizens",
    photo: { src: "/audiences/citizens.jpg", alt: "Families, workers and a wheelchair user in front of a court building", width: 600, height: 912 },
    name: "Citizens",
    eyebrow: "For citizens",
    headline: "Know your rights, in plain *language*.",
    blurb:
      "Understand a notice, a document or a process in words anyone can follow, and learn what a sensible next step looks like.",
    chips: ["Plain language", "Know your rights", "Next steps"],
    sample: {
      label: "Plain-language answer",
      rows: [
        { term: "You ask", detail: "What does this legal notice mean for me?" },
        {
          term: "Shisho explains",
          detail: "What it says in simple words, what it asks you to do, and by when.",
        },
        {
          term: "Next step",
          detail: "Speak to an advocate with these papers. We can help you prepare questions.",
        },
      ],
    },
    disclaimer: "General information, not legal advice.",
  },
  {
    slug: "advice",
    photo: { src: "/audiences/advice.jpg", alt: "A senior lawyer advising two clients at a round table", width: 600, height: 912 },
    name: "Legal advice",
    eyebrow: "For legal advice",
    headline: "Clear guidance, one conversation at a *time*.",
    blurb:
      "Prepare for a consultation, understand your options in plain words and leave with clear next steps.",
    chips: ["Consultation notes", "Options explained", "Next steps"],
    sample: {
      label: "Advice summary",
      rows: [
        {
          term: "Your question",
          detail: "What can I do about money lent without a written agreement?",
        },
        { term: "Options", detail: "Legal notice, mediation or a court case." },
        { term: "Next step", detail: "Gather proof and speak to your advocate." },
      ],
    },
    disclaimer: "General information. Advice comes from your own lawyer.",
  },
];

/** Audiences with a /for page of their own; each gets a homepage section. */
export const PAGE_AUDIENCES = AUDIENCES.filter((a) => !a.href);

/** Of those, the ones not built yet: these say "Planned" and take sign-ups. */
export const PLANNED_AUDIENCES = PAGE_AUDIENCES.filter((a) => !a.live);

export function getAudience(slug: string): Audience | undefined {
  return PAGE_AUDIENCES.find((a) => a.slug === slug);
}
