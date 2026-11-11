import { supabase } from "@/lib/supabase";
import { isPlan, type Plan } from "@/lib/entitlements";

/**
 * The logged-in-user counterpart to lib/entitlements.ts's cookie-based
 * `readPlan` — reads from the `profiles` table (supabase/schema.sql) via the
 * existing service_role client instead of a cookie. app/api/draft/route.ts
 * and app/api/assistant/route.ts use this when a request carries a real
 * session (lib/authSession.ts), and fall back to `readPlan` unchanged
 * otherwise — see those files for the branch.
 *
 * A `profiles` row is created automatically (a database trigger, see
 * supabase/schema.sql) the moment someone registers, so "authenticated but
 * no row yet" isn't a real state to handle here — but fails to "free"
 * anyway on any read error rather than throwing, matching this app's
 * existing fail-open posture for entitlement data (lib/usageCounters.ts).
 *
 * A paid month (lib/payments.ts) sets `plan_expires_at`; once that passes the
 * plan reads as free again. A plan with no expiry (set by hand) never lapses.
 */
export type PlanDetails = { plan: Plan; expiresAt: string | null };

export async function getUserPlanDetails(userId: string): Promise<PlanDetails> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return { plan: "free", expiresAt: null };
  const plan: Plan = isPlan(data.plan) ? data.plan : "free";
  const expiresAt = (data.plan_expires_at as string | null) ?? null;
  if (plan !== "free" && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return { plan: "free", expiresAt: null };
  }
  return { plan, expiresAt: plan === "free" ? null : expiresAt };
}

export async function getUserPlan(userId: string): Promise<Plan> {
  return (await getUserPlanDetails(userId)).plan;
}
