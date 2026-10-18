/**
 * What each audience gets on the site — kept apart from lib/audiences.ts so
 * the pitch (headline, sample) and the product truth (what is live) are
 * separate, and a feature is never marked live that is not.
 *
 *   live    — works on the site today, at `href`.
 *   planned — described in the pitch, not built.
 *
 * `TODAY` is the "Available today" list on each /for/[slug] page: the parts of
 * the site that already serve that audience. `EXTRAS` is the "More for you"
 * block added to the three pages that already existed (/draft-bot, /clerks,
 * /courses).
 */

export type AudienceItem = {
  label: string;
  note: string;
  status: "live" | "planned";
  href?: string;
};

export const TODAY: Record<string, AudienceItem[]> = {
  corporate: [
    {
      label: "Contract drafting",
      note: "Shisho drafts notices and contracts under Indian law.",
      status: "live",
      href: "/draft-bot",
    },
    {
      label: "Clause-level review",
      note: "Paste a draft and get margin notes naming the provision.",
      status: "live",
      href: "/draft-bot?mode=review#review",
    },
    {
      label: "Bare Acts",
      note: "Central Acts, searchable.",
      status: "live",
      href: "/library/acts",
    },
  ],
  scholars: [
    {
      label: "Legal Library",
      note: "Judgments and commentary with every citation verified.",
      status: "live",
      href: "/library",
    },
    {
      label: "Landmark judgments",
      note: "Each with a case digest drawn from the judgment's own text.",
      status: "live",
      href: "/library#landmarks",
    },
    {
      label: "Citation lookup",
      note: "Check a citation before you rely on it.",
      status: "live",
      href: "/library/lookup",
    },
  ],
  judges: [
    {
      label: "Judgments",
      note: "Supreme Court and High Court judgments in the Library.",
      status: "live",
      href: "/library#collections",
    },
    {
      label: "Documents",
      note: "What each pleading must contain, and where it fails.",
      status: "live",
      href: "/documents",
    },
    {
      label: "The Map",
      note: "Every stage of a matter, from first meeting to arguments.",
      status: "live",
      href: "/map",
    },
  ],
  lecturers: [
    {
      label: "Landmark judgments",
      note: "The cases every student is expected to know.",
      status: "live",
      href: "/library#landmarks",
    },
    {
      label: "Document reference pages",
      note: "A ready teaching aid for each pleading.",
      status: "live",
      href: "/documents",
    },
    {
      label: "Courses",
      note: "Starter and Proficient tracks, to set alongside your own.",
      status: "live",
      href: "/courses",
    },
  ],
  clat: [
    {
      label: "Legal English",
      note: "Reading a judgment and writing a pleading, recorded and live.",
      status: "live",
      href: "/courses/english",
    },
    {
      label: "Starter course",
      note: "How to read law, from the first principles.",
      status: "live",
      href: "/courses#starter",
    },
  ],
  "judicial-exams": [
    {
      label: "Bare Acts",
      note: "Central Acts, and state Acts state-wise.",
      status: "live",
      href: "/library/acts",
    },
    {
      label: "Civil procedure",
      note: "The stages of a civil matter, with the documents at each.",
      status: "live",
      href: "/map",
    },
    {
      label: "Documents",
      note: "Provisions and contents for each pleading.",
      status: "live",
      href: "/documents",
    },
  ],
  "court-staff": [
    {
      label: "Advocate clerks' manual",
      note: "Registration, filing and scrutiny, A to Z.",
      status: "live",
      href: "/clerks",
    },
    {
      label: "Legal English",
      note: "Reading and writing court documents.",
      status: "live",
      href: "/courses/english",
    },
  ],
  citizens: [
    {
      label: "The Map",
      note: "How a case moves through the system, stage by stage.",
      status: "live",
      href: "/map",
    },
    {
      label: "Documents",
      note: "What a court paper is, and what it must contain.",
      status: "live",
      href: "/documents",
    },
  ],
  advice: [
    {
      label: "The Map",
      note: "See where a dispute sits and what usually comes next.",
      status: "live",
      href: "/map",
    },
    {
      label: "Documents",
      note: "What a notice or plaint is for, in plain terms.",
      status: "live",
      href: "/documents",
    },
  ],
};

export const EXTRAS: Record<"advocates" | "clerks" | "students", AudienceItem[]> = {
  advocates: [
    {
      label: "Drafting",
      note: "Plaints, notices, applications and appeals, drafted from the facts.",
      status: "live",
      href: "#drafts",
    },
    {
      label: "Authority in the margin",
      note: "Each defect marked with the Indian provision it breaches.",
      status: "live",
    },
    {
      label: "Research",
      note: "Verified citations in the Legal Library.",
      status: "live",
      href: "/library",
    },
    {
      label: "Hearing prep",
      note: "Ask Shisho to prepare you: issues, likely bench questions and provisions to check. Authorities are listed only when certain.",
      status: "live",
      href: "/draft-bot?mode=ask#ask",
    },
  ],
  clerks: [
    {
      label: "Filing checklist",
      note: "A five-point check before you file, below.",
      status: "live",
      href: "#formats",
    },
    {
      label: "Cause lists",
      note: "The daily court case sheet and result format.",
      status: "live",
      href: "#formats",
    },
    {
      label: "Next-date reminder",
      note: "Put a next date in your calendar, with an alert the day before.",
      status: "live",
      href: "#reminder",
    },
  ],
  students: [
    {
      label: "Case briefs",
      note: "Every Library judgment carries a digest: facts, issue, held, ratio.",
      status: "live",
      href: "/library",
    },
    {
      label: "Case-brief practice",
      note: "Write your own brief, then compare it with the digest.",
      status: "live",
      href: "/courses/case-brief",
    },
    {
      label: "Internship guide",
      note: "The Bar Council requirement, and how to meet it.",
      status: "live",
      href: "/internship",
    },
    {
      label: "Revision",
      note: "Saved briefs come back after 1, 7 and 30 days.",
      status: "live",
      href: "/courses/revision",
    },
    {
      label: "Moot kit",
      note: "A memorial outline, an oral-round checklist and a timer.",
      status: "live",
      href: "/courses/moot",
    },
    {
      label: "Exam revision",
      note: "Revision notes and questions drawn from your course.",
      status: "planned",
    },
  ],
};
