/**
 * Single source of truth for pricing. All amounts in INR, billed monthly.
 *
 * The landing page preview and the /courses comparison BOTH read from here.
 * A price must never appear as a literal in a component — if you find one,
 * that is a bug.
 */

export type TierId = "free" | "basic" | "core" | "proficient";

export type Tier = {
  id: TierId;
  name: string;
  /** Numeric rupee amount per month. Formatted at render, never hard-coded. */
  price: number;
  tagline: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
};

/** ₹ with Indian digit grouping — 12,499 not 12499. */
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
    id: "basic",
    name: "Basic",
    price: 9,
    tagline: "Everything to read and study — the bot stays on the free trial.",
    features: [
      "Full Starter course",
      "Full Legal Library access",
      "5 Draft Bot reviews per month",
    ],
    cta: { label: "Get Basic", href: "/draft-bot" },
  },
  {
    id: "core",
    name: "Core",
    price: 499,
    tagline: "The full foundation, and the bot without limits.",
    popular: true,
    features: [
      "Everything in Basic",
      "Draft Bot included — unlimited",
      "Downloadable case briefs",
    ],
    cta: { label: "Get Core", href: "/draft-bot" },
  },
  {
    id: "proficient",
    name: "Proficient",
    price: 999,
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
 * Feature-by-feature breakdown for the /pricing comparison table. A row per
 * capability rather than per tier, so a reader can scan "what do I get for
 * Draft Bot reviews" across all four plans at once instead of re-reading four
 * separate bullet lists.
 *
 * `true` renders as a check, `false` as a dash, a string renders as-is. Kept
 * in lockstep with each tier's `features` array above by hand — there is no
 * automatic derivation, because the wording differs per tier ("5 / month" vs
 * "5 Draft Bot reviews per month") for the two different contexts they render
 * in.
 */
export const COMPARISON_ROWS: {
  label: string;
  values: Record<TierId, string | boolean>;
}[] = [
  {
    label: "Draft Bot reviews",
    values: { free: "5 / month", basic: "5 / month", core: "Unlimited", proficient: "Unlimited" },
  },
  {
    label: "Citation-checked review",
    values: { free: false, basic: false, core: false, proficient: true },
  },
  {
    label: "Starter course",
    values: { free: "Preview", basic: "Full access", core: "Full access", proficient: "Full access" },
  },
  {
    label: "Proficient course",
    values: { free: false, basic: false, core: false, proficient: "Full access" },
  },
  {
    label: "Legal Library",
    values: { free: "Daily digest", basic: "Full access", core: "Full access", proficient: "Full access" },
  },
  {
    label: "Practitioner commentary",
    values: { free: false, basic: "Read", core: "Read", proficient: "Read + ask Shisho" },
  },
  {
    label: "Downloadable case briefs",
    values: { free: false, basic: false, core: true, proficient: true },
  },
  {
    label: "Drafting templates",
    values: { free: false, basic: false, core: false, proficient: true },
  },
];

/**
 * Not a tier — a way to buy the bot on its own. Deliberately kept out of the
 * comparison grid because it is not comparable to the four plans above.
 */
export const ADD_ON = {
  name: "Draft Bot only",
  price: 699,
  description:
    "Unlimited drafting and review, without the courses. For practitioners who want the assistant and nothing else.",
  cta: { label: "Add Draft Bot", href: "/draft-bot" },
} as const;
