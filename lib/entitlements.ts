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
 *   TODO BEFORE LAUNCH — replace `readPlan` and the usage counter with a
 *   real session lookup against your account store. Until then, anyone who
 *   edits a cookie gets Proficient for free.
 *
 * What IS real, and must stay real: the gate is enforced in the route handler
 * (app/api/draft/route.ts), not in the client. Moving that check to the
 * browser would make it decorative.
 */

export type Plan = "free" | "core" | "proficient" | "addon";

export const PLANS: Plan[] = ["free", "core", "proficient", "addon"];

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

/** Parses a cookie value into a plan, defaulting to free. */
export function readPlan(value: string | undefined): Plan {
  return isPlan(value) ? value : "free";
}

/** `null` means unlimited. */
export function reviewQuotaFor(plan: Plan): number | null {
  return plan === "free" ? FREE_MONTHLY_REVIEWS : null;
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
  core: "Core",
  proficient: "Proficient",
  addon: "Draft Bot only",
};
