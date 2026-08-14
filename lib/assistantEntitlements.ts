/**
 * ============================================================================
 * ASSISTANT ENTITLEMENTS — a second, independent quota, mirroring the shape
 * of lib/entitlements.ts (MOCK, same caveats — see that file's header).
 * ============================================================================
 *
 * The drafting agent is metered separately from the draft reviewer: chatting
 * with Shisho and asking for a clause-by-clause review are different costs,
 * and sharing one counter would mean a free user burns their review quota
 * just by talking to the agent (or vice versa). This file is deliberately its
 * own module rather than an addition to lib/entitlements.ts, which stays
 * untouched — it only *imports* `Plan` from there, so plan ids and the free/
 * paid distinction stay single-sourced in the file that owns them.
 */

import type { Plan } from "@/lib/entitlements";

/** Cookie name. Distinct from `shisho_reviews_used` — see header above. */
export const ASSISTANT_USAGE_COOKIE = "shisho_assistant_used";

/**
 * Free tier gets a trial of the agent, same "trial not a locked door"
 * philosophy as FREE_MONTHLY_REVIEWS. One turn (one message sent, regardless
 * of how long the reply or a drafted document ends up being) is one unit —
 * simple per-call metering, matching how the reviewer counts a review
 * regardless of how many annotations come back.
 */
export const FREE_MONTHLY_ASSISTANT_MESSAGES = 5;

/** `null` means unlimited. */
export function assistantQuotaFor(plan: Plan): number | null {
  return plan === "free" ? FREE_MONTHLY_ASSISTANT_MESSAGES : null;
}

export function readAssistantUsage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export type AssistantEntitlement = {
  plan: Plan;
  used: number;
  quota: number | null;
  /** False once a free user has spent their monthly trial messages. */
  allowed: boolean;
  remaining: number | null;
};

export function assistantEntitlementFor(
  plan: Plan,
  used: number,
): AssistantEntitlement {
  const quota = assistantQuotaFor(plan);

  if (quota === null) {
    return { plan, used, quota: null, allowed: true, remaining: null };
  }

  const remaining = Math.max(0, quota - used);
  return { plan, used, quota, allowed: remaining > 0, remaining };
}
