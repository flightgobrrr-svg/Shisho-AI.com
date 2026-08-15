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
        href: "/draft-bot#ask",
        label: "Ask Shisho",
        blurb: "Describe the facts and get a first draft",
      },
      {
        href: "/draft-bot#review",
        label: "Review a draft",
        blurb: "Paste a document for clause-level notes",
      },
      {
        href: "/draft-bot#drafts",
        label: "What it drafts",
        blurb: "Pleadings, applications, notices, appeals",
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
      { href: "/courses", label: "Courses" },
      { href: "/map", label: "The Map" },
      { href: "/documents", label: "Documents" },
      { href: "/pricing", label: "Pricing" },
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
      { href: "/", label: "About" },
      { href: "/", label: "Careers" },
      { href: "/", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/", label: "Terms of use" },
      { href: "/", label: "Privacy policy" },
      { href: "/", label: "Refund policy" },
    ],
  },
];
