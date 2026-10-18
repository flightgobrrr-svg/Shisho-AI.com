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
 */
export async function getUserPlan(userId: string): Promise<Plan> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return "free";
  return isPlan(data.plan) ? data.plan : "free";
}
