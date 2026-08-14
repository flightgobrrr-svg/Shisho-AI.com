/**
 * Single source of truth for site navigation. The nav and the footer both read
 * from here so a route can never exist in one and not the other.
 */

export type NavLink = {
  href: string;
  label: string;
  /** Shown in the mobile panel only — the desktop bar stays terse. */
  blurb?: string;
};

export const PRIMARY_NAV: NavLink[] = [
  {
    href: "/draft-bot",
    label: "Draft Bot",
    blurb: "Plaints, notices and contracts, drafted under Indian law",
  },
  {
    href: "/library",
    label: "Legal Library",
    blurb: "Supreme Court and High Court judgments, bare acts, commentary",
  },
  {
    href: "/courses",
    label: "Courses",
    blurb: "Structured tracks from first year to first brief",
  },
  {
    href: "/map",
    label: "The Map",
    blurb: "Every stage of a matter, from first meeting to written arguments",
  },
  {
    href: "/pricing",
    label: "Pricing",
    blurb: "Plans in ₹, built for student budgets",
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
      { href: "/draft-bot", label: "Draft Bot" },
      { href: "/library", label: "Legal Library" },
      { href: "/courses", label: "Courses" },
      { href: "/map", label: "The Map" },
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
