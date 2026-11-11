/**
 * Single source of truth for site navigation. The nav and the footer both read
 * from here so a route can never exist in one and not the other.
 */

export type NavLink = {
  href: string;
  label: string;
  /** Shown in the mobile panel only — the desktop bar stays terse. */
  blurb?: string;
  /**
   * Sub-destinations, shown in a dropdown on desktop and inline on mobile.
   *
   * Every `href` here must resolve to a real element id on the target page —
   * a menu that scrolls someone to the top of a page they were already on is
   * worse than no menu. `scroll-padding-top` in globals.css keeps the landing
   * position clear of the sticky bar.
   */
  children?: NavLink[];
  /**
   * Labelled sections, for a menu too long to read as one list. Rendered as
   * columns in a wide panel on desktop and as headed lists on mobile.
   */
  groups?: NavGroup[];
  /** Planned audiences say so in the menu, not only on their page. */
  planned?: boolean;
};

export type NavGroup = { heading: string; links: NavLink[] };

/**
 * The twelve audiences from the promo video, sorted into four sections under
 * one "Who it's for" menu in the main bar. Three already have a home on the
 * site; the other nine go to their /for/ page, which says plainly that they
 * are planned, and the menu marks them so too. Slugs follow lib/audiences.ts.
 */
export const AUDIENCE_GROUPS: NavGroup[] = [
  {
    heading: "Practice",
    links: [
      { href: "/for/junior-advocates", label: "Junior advocates" },
      { href: "/for/senior-advocates", label: "Senior advocates" },
      { href: "/for/designated-senior-advocates", label: "Designated senior advocates" },
      { href: "/for/corporate", label: "Corporate lawyers", planned: true },
      { href: "/clerks", label: "Advocate clerks" },
    ],
  },
  {
    heading: "Study and teaching",
    links: [
      { href: "/courses", label: "Law students" },
      { href: "/for/lecturers", label: "Lecturers", planned: true },
      { href: "/for/scholars", label: "Scholars", planned: true },
    ],
  },
  {
    heading: "Exams",
    links: [
      { href: "/for/clat", label: "CLAT", planned: true },
      { href: "/for/judicial-exams", label: "Judicial exams", planned: true },
      { href: "/for/court-staff", label: "Court staff exams", planned: true },
    ],
  },
  {
    heading: "Bench and public",
    links: [
      { href: "/for/judges", label: "Judges", planned: true },
      { href: "/for/citizens", label: "Citizens", planned: true },
      { href: "/for/advice", label: "Legal advice", planned: true },
    ],
  },
];

export const PRIMARY_NAV: NavLink[] = [
  {
    href: "/draft-bot",
    label: "Shisho",
    blurb: "Plaints, notices and contracts, drafted under Indian law",
    children: [
      {
        href: "/draft-bot?mode=ask#ask",
        label: "Ask Shisho",
        blurb: "Describe the facts and get a first draft",
      },
      {
        href: "/draft-bot?mode=review#review",
        label: "Review a draft",
        blurb: "Paste a document for clause-level notes",
      },
      {
        href: "/draft-bot#drafts",
        label: "What it drafts",
        blurb: "Pleadings, applications, notices, appeals",
      },
      {
        href: "/draft-bot/formats",
        label: "Formats",
        blurb: "99 civil and criminal formats to draft from",
      },
    ],
  },
  {
    href: "/library",
    label: "Legal Library",
    blurb: "Supreme Court and High Court judgments, bare acts, commentary",
    children: [
      {
        href: "/library#collections",
        label: "Collections",
        blurb: "Judgments, bare acts, commentary",
      },
      {
        href: "/library#landmarks",
        label: "Landmark judgments",
        blurb: "The cases every student is expected to know",
      },
      {
        href: "/library/acts",
        label: "Bare Acts",
        blurb: "Central Acts, and state Acts state-wise",
      },
      {
        href: "/limitation",
        label: "Limitation checker",
        blurb: "The last day to file, under the Limitation Act",
      },
      {
        href: "/ipc-bns",
        label: "IPC to BNS",
        blurb: "Find the new section for an old one",
      },
    ],
  },
  {
    href: "/courses",
    label: "Courses",
    blurb: "Structured tracks from first year to first brief",
    children: [
      {
        href: "/courses#starter",
        label: "Starter",
        blurb: "How to read law, and put the first document on paper",
      },
      {
        href: "/courses#proficient",
        label: "Proficient",
        blurb: "Interim relief, commercial drafting, litigation strategy",
      },
      {
        href: "/courses/english",
        label: "Legal English",
        blurb: "Reading a judgment, writing a pleading — recorded & live",
      },
      {
        href: "/courses/spoken-english",
        label: "Spoken English",
        blurb: "Oral argument and courtroom submissions — recorded & live",
      },
    ],
  },
  {
    href: "/map",
    label: "The Map",
    blurb: "Every stage of a matter, from first meeting to written arguments",
    children: [
      {
        href: "/documents",
        label: "Documents",
        blurb: "Every pleading, and what it must contain",
      },
      {
        href: "/map#stage-2",
        label: "Advocate & forum",
        blurb: "Who brings the matter, and where it belongs",
      },
      {
        href: "/map#stage-4",
        label: "Drafting",
        blurb: "The first document, checked against the bare act",
      },
      {
        href: "/map#stage-6",
        label: "Pleadings & issues",
        blurb: "The suit, the answer, and the issues framed",
      },
      {
        href: "/map#stage-7",
        label: "Trial",
        blurb: "Evidence and argument",
      },
      {
        href: "/map#stage-8",
        label: "Citations",
        blurb: "Authorities that actually bind",
      },
    ],
  },
  /* Advocate Clerks is one of the twelve audiences, so it lives in the
     "Who it's for" panel (Practice) rather than as a top item of its own:
     seven items did not fit the bar on one line at 1280–1440px. */
  {
    href: "/#audiences",
    label: "Who it's for",
    blurb: "Advocates, students, exam takers, judges and the public",
    groups: AUDIENCE_GROUPS,
  },
  {
    href: "/pricing",
    label: "Pricing",
    blurb: "Plans in ₹, built for student budgets",
    children: [
      {
        href: "/pricing#plans",
        label: "Plans",
        blurb: "Free, Basic, Core and Proficient",
      },
      {
        href: "/pricing#compare",
        label: "Compare features",
        blurb: "Every plan, feature by feature",
      },
    ],
  },
];

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      { href: "/draft-bot", label: "Shisho" },
      { href: "/library", label: "Legal Library" },
      { href: "/library/acts", label: "Bare Acts" },
      { href: "/courses", label: "Courses" },
      { href: "/map", label: "The Map" },
      { href: "/documents", label: "Documents" },
      { href: "/clerks", label: "Advocate Clerks" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { href: "/limitation", label: "Limitation checker" },
      { href: "/ipc-bns", label: "IPC to BNS" },
      { href: "/courses/moot", label: "Moot kit" },
      { href: "/courses/case-brief", label: "Case-brief practice" },
      { href: "/courses/revision", label: "Revision" },
    ],
  },
  {
    heading: "Study",
    links: [
      { href: "/courses", label: "Constitutional Law" },
      { href: "/courses", label: "Contract & Specific Relief" },
      { href: "/courses", label: "Criminal Procedure" },
      { href: "/courses", label: "Drafting, Pleading & Conveyancing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How Shisho works" },
      { href: "/status", label: "What works today" },
      { href: "/corrections", label: "Corrections and gaps" },
      { href: "/#audiences", label: "Who it's for" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of use" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/refund", label: "Refund policy" },
    ],
  },
];
