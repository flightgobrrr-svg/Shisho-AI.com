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
};

export const AUDIENCES: Audience[] = [
  {
    slug: "advocates",
    name: "Advocates",
    eyebrow: "For advocates",
    headline: "Draft with *precision*. Argue with authority.",
    blurb:
      "From first instructions to final submissions, with the right authority beside every ground.",
    chips: ["Research", "Drafting", "Precedents", "Hearing prep"],
    href: "/draft-bot",
    cta: "Try Shisho",
  },
  {
    slug: "corporate",
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

/** Audiences not yet served by an existing page; each gets a homepage section. */
export const PLANNED_AUDIENCES = AUDIENCES.filter((a) => !a.href);

export function getAudience(slug: string): Audience | undefined {
  return PLANNED_AUDIENCES.find((a) => a.slug === slug);
}
