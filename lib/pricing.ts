/**
 * Single source of truth for pricing. All amounts in INR, billed monthly.
 *
 * The landing page preview and the /courses comparison BOTH read from here.
 * A price must never appear as a literal in a component — if you find one,
 * that is a bug.
 */

export type Tier = {
  id: "free" | "core" | "proficient";
  name: string;
  /** Numeric rupee amount per month. Formatted at render, never hard-coded. */
  price: number;
  tagline: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
};

/** ₹ with Indian digit grouping — 2,499 not 2499. */
export function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "See how a mentor marks your work.",
    features: [
      "Starter course preview",
      "5 Draft Bot reviews per month",
      "Legal Library — daily judgment digest",
    ],
    cta: { label: "Start free", href: "/draft-bot" },
  },
  {
    id: "core",
    name: "Core",
    price: 999,
    tagline: "The full foundation, and the bot without limits.",
    popular: true,
    features: [
      "Full Starter course",
      "Full Legal Library access",
      "Draft Bot included — unlimited",
      "Downloadable case briefs",
    ],
    cta: { label: "Get Core", href: "/draft-bot" },
  },
  {
    id: "proficient",
    name: "Proficient",
    price: 2499,
    tagline: "For advocates and final-year students in practice.",
    features: [
      "Everything in Core",
      "Full Proficient course",
      "Priority Draft Bot with citation checks",
      "Drafting templates — pleadings and contracts",
    ],
    cta: { label: "Get Proficient", href: "/draft-bot" },
  },
];

/**
 * Not a tier — a way to buy the bot on its own. Deliberately kept out of the
 * comparison grid because it is not comparable to the three plans above.
 */
export const ADD_ON = {
  name: "Draft Bot only",
  price: 699,
  description:
    "Unlimited drafting and review, without the courses. For practitioners who want the assistant and nothing else.",
  cta: { label: "Add Draft Bot", href: "/draft-bot" },
} as const;
