import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase";

/**
 * The Supabase-backed replacement for the cookie-editable usage counter —
 * see supabase/schema.sql's header for the full reasoning and its stated
 * limit (this closes the "edit the number in devtools" hole, not the
 * "clear all cookies" one; that needs real login, which is out of scope).
 *
 * Falls back to the exact previous cookie-count behaviour whenever Supabase
 * isn't configured — same convention app/api/draft/route.ts already uses for
 * ANTHROPIC_API_KEY, so this ships safely before SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY exist and starts working the moment they do,
 * with no separate flag or redeploy needed either way.
 */

export const VISITOR_COOKIE = "shisho_visitor";

/** Mirrors the old cookies' maxAge — a 30-day rolling window, not a
 *  calendar-month one. Changing this to a calendar reset is a real product
 *  decision, not a bug fix; keeping the existing behaviour on purpose. */
const PERIOD_MS = 1000 * 60 * 60 * 24 * 30;

export type UsageKind = "review" | "assistant";

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reuses a valid existing id; otherwise mints a fresh one. Never throws on
 *  a malformed/tampered cookie value — that just reads as "new visitor". */
export function readVisitorId(value: string | undefined): string {
  return value && UUID_RE.test(value) ? value : randomUUID();
}

/**
 * Current count for this visitor+kind. A row older than PERIOD_MS reads as
 * 0 rather than being deleted — incrementUsageCount is what actually starts
 * the new period, on the same request that earns it, so a visitor who never
 * comes back doesn't leave an expired row to clean up for no reason.
 *
 * Fails OPEN (returns 0) on a Supabase error rather than blocking the
 * request — this gates a free trial, not a paywall with money behind it,
 * and the existing philosophy here is "a trial, not a locked door"
 * (lib/entitlements.ts). A transient Supabase hiccup should not turn into a
 * hard 402 for a free user who did nothing wrong.
 */
export async function readUsageCount(
  visitorId: string,
  kind: UsageKind,
): Promise<number> {
  const { data, error } = await supabase()
    .from("usage_counters")
    .select("count, period_start")
    .eq("visitor_id", visitorId)
    .eq("kind", kind)
    .maybeSingle();

  if (error) {
    console.error("[usageCounters] read failed, failing open:", error);
    return 0;
  }
  if (!data) return 0;

  const expired = Date.now() - new Date(data.period_start).getTime() > PERIOD_MS;
  return expired ? 0 : data.count;
}

/** Increments the count, starting a fresh period if the previous one (or
 *  the absence of any row at all) has expired. Errors are logged, not
 *  thrown — a failed write here should not fail the request whose review
 *  or draft the visitor is actually waiting on. */
export async function incrementUsageCount(
  visitorId: string,
  kind: UsageKind,
): Promise<void> {
  const client = supabase();

  const { data } = await client
    .from("usage_counters")
    .select("count, period_start")
    .eq("visitor_id", visitorId)
    .eq("kind", kind)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const expired =
    !data || Date.now() - new Date(data.period_start).getTime() > PERIOD_MS;

  const { error } = await client.from("usage_counters").upsert(
    {
      visitor_id: visitorId,
      kind,
      count: !data || expired ? 1 : data.count + 1,
      period_start: !data || expired ? nowIso : data.period_start,
      updated_at: nowIso,
    },
    { onConflict: "visitor_id,kind" },
  );

  if (error) console.error("[usageCounters] increment failed:", error);
}
