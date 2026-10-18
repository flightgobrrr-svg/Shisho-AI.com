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
};

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
      {
        href: "/for/corporate",
        label: "Corporate lawyers",
        blurb: "Contract review, compliance, due diligence",
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
      {
        href: "/for/scholars",
        label: "Scholars",
        blurb: "Trace a doctrine across decades",
      },
      {
        href: "/for/judges",
        label: "Judges",
        blurb: "A clear record, close at hand",
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
      {
        href: "/for/lecturers",
        label: "Lecturers",
        blurb: "Lesson plans and case materials",
      },
      {
        href: "/for/clat",
        label: "CLAT",
        blurb: "Mock tests and legal reasoning",
      },
      {
        href: "/for/judicial-exams",
        label: "Judicial exams",
        blurb: "JCJ, District Judge and APP",
      },
      {
        href: "/for/court-staff",
        label: "Court staff exams",
        blurb: "Mock papers and a study plan",
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
      {
        href: "/for/citizens",
        label: "Citizens",
        blurb: "Know your rights, in plain language",
      },
      {
        href: "/for/advice",
        label: "Legal advice",
        blurb: "Clear guidance, one conversation at a time",
      },
    ],
  },
  {
    href: "/clerks",
    label: "Advocate Clerks",
    blurb: "The practice manual — registration, filing, scrutiny, A to Z",
    children: [
      {
        href: "/clerks#routine",
        label: "Daily routine",
        blurb: "Before, during and after court",
      },
      {
        href: "/clerks#manual",
        label: "The manual",
        blurb: "99 entries, A to Z",
      },
      {
        href: "/clerks#formats",
        label: "Practical formats",
        blurb: "Working formats for daily office use",
      },
    ],
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
      { href: "/limitation", label: "Limitation checker" },
      { href: "/ipc-bns", label: "IPC to BNS" },
      { href: "/courses", label: "Courses" },
      { href: "/map", label: "The Map" },
      { href: "/documents", label: "Documents" },
      { href: "/clerks", label: "Advocate Clerks" },
      { href: "/#audiences", label: "Who it's for" },
      { href: "/pricing", label: "Pricing" },
      { href: "/status", label: "What works today" },
      { href: "/how-it-works", label: "How Shisho works" },
      { href: "/corrections", label: "Corrections and gaps" },
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
