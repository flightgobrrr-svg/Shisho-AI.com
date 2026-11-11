/**
 * ============================================================================
 * ENTITLEMENTS — MOCK. THIS IS NOT ACCESS CONTROL YET.
 * ============================================================================
 *
 * There is no auth system in this project. Plan state is read from a plain
 * cookie that the visitor can set themselves, and the free-tier review counter
 * lives in a second cookie that clearing site data resets.
 *
 * That is deliberate and sufficient for building and demonstrating the UI, but
 * it must not be mistaken for a paywall:
 *
 *   Signed-in visitors get their plan from the profile (lib/profile.ts).
 *   For everyone else, `readPlan` honours the cookie only outside
 *   production, so editing it in production grants nothing.
 *
 * What IS real, and must stay real: the gate is enforced in the route handler
 * (app/api/draft/route.ts), not in the client. Moving that check to the
 * browser would make it decorative.
 */

export type Plan = "free" | "basic" | "core" | "proficient" | "addon";

export const PLANS: Plan[] = ["free", "basic", "core", "proficient", "addon"];

/** Free and Basic share the trial allowance; Basic adds study access, not the bot (lib/pricing.ts). */
export const isTrialPlan = (plan: Plan) => plan === "free" || plan === "basic";

/**
 * The Library in the app: Free gets one new judgment digest a day (lib/pricing.ts
 * sells Free as "Daily digest" and Basic upward as "Full access"). Digests
 * already saved on the phone stay readable on every plan. The Shisho-only
 * add-on is sold "without the courses", so it reads the Library as Free does.
 */
export const FREE_DAILY_DIGESTS = 1;
export const libraryIsLimited = (plan: Plan) => plan === "free" || plan === "addon";

/** Cookie names. Both are mock storage — see the warning above. */
export const PLAN_COOKIE = "shisho_plan";
export const USAGE_COOKIE = "shisho_reviews_used";

/**
 * Free tier gets a trial of the bot rather than a locked door.
 * Kept in sync with the Free tier's feature list in lib/pricing.ts.
 */
export const FREE_MONTHLY_REVIEWS = 5;

export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && (PLANS as string[]).includes(value);
}

/**
 * Parses the plan cookie, defaulting to free. In production it is always free:
 * the cookie is visitor-editable and exists for the dev-only PlanSwitcher, so
 * a paid plan there comes only from the signed-in profile (lib/profile.ts).
 */
export function readPlan(value: string | undefined): Plan {
  if (process.env.NODE_ENV === "production") return "free";
  return isPlan(value) ? value : "free";
}

/** `null` means unlimited. */
export function reviewQuotaFor(plan: Plan): number | null {
  return isTrialPlan(plan) ? FREE_MONTHLY_REVIEWS : null;
}

export function readUsage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export type Entitlement = {
  plan: Plan;
  used: number;
  quota: number | null;
  /** False once a free user has spent their monthly trial reviews. */
  allowed: boolean;
  remaining: number | null;
};

export function entitlementFor(plan: Plan, used: number): Entitlement {
  const quota = reviewQuotaFor(plan);

  if (quota === null) {
    return { plan, used, quota: null, allowed: true, remaining: null };
  }

  const remaining = Math.max(0, quota - used);
  return { plan, used, quota, allowed: remaining > 0, remaining };
}

/** Human-readable plan name, for the upgrade panel and the dev switcher. */
export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  basic: "Basic",
  core: "Core",
  proficient: "Proficient",
  addon: "Draft Bot only",
};
