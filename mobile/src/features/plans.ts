import { ADD_ON, TIERS, formatINR } from "@/lib/pricing";
import type { Plan } from "@/api/endpoints";

/**
 * The plans the app can sell, with names and prices from lib/pricing.ts, the
 * same source the server charges from (lib/payments.ts), so the button and
 * the charge can never differ.
 */
export const PAID_PLANS = ["basic", "core", "proficient", "addon"] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export function planPrice(plan: PaidPlan): number {
  return plan === "addon" ? ADD_ON.price : TIERS.find((t) => t.id === plan)!.price;
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  basic: "Basic",
  core: "Core",
  proficient: "Proficient",
  addon: ADD_ON.name,
};

export const payLabel = (plan: PaidPlan) => `Pay ${formatINR(planPrice(plan))} for one month`;
