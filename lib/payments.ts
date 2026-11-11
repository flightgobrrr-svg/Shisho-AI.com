import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { ADD_ON, TIERS } from "@/lib/pricing";

/**
 * SERVER ONLY. Paying for a plan with Razorpay Payment Links.
 *
 *   1. createPaymentLink: a `payments` row, then a Razorpay payment link for
 *      exactly the lib/pricing.ts price. The app opens the link's page.
 *   2. Razorpay sends the payer back to /api/pay/razorpay/callback with a
 *      signature, and also calls /api/pay/razorpay/webhook. Either one calls
 *      confirmPayment, which re-reads the link FROM RAZORPAY (status and amount),
 *      never trusting the redirect's query string alone, and then grants the
 *      plan with grant_paid_plan (supabase/live-3-paid-plan-grant.sql), which
 *      marks the row paid in the same transaction. Running twice is harmless:
 *      a paid row is never granted again.
 *
 * One payment buys one 30-day month. Nothing renews automatically.
 *
 * Needs RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (test keys while testing), and
 * RAZORPAY_WEBHOOK_SECRET for the webhook. Never NEXT_PUBLIC_.
 */

export const PAID_PLANS = ["basic", "core", "proficient", "addon"] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];
export const isPaidPlan = (v: unknown): v is PaidPlan => typeof v === "string" && (PAID_PLANS as readonly string[]).includes(v);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rupees per month, straight from lib/pricing.ts. */
export function planPrice(plan: PaidPlan): number {
  if (plan === "addon") return ADD_ON.price;
  return TIERS.find((t) => t.id === plan)!.price;
}

export function planName(plan: PaidPlan): string {
  return plan === "addon" ? ADD_ON.name : TIERS.find((t) => t.id === plan)!.name;
}

function keys() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret ? { id, secret } : null;
}

export const paymentsConfigured = () => Boolean(keys() && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function razorpay<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const k = keys();
  if (!k) throw new Error("Razorpay keys are not set.");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init?.method ?? "GET",
    headers: {
      authorization: `Basic ${Buffer.from(`${k.id}:${k.secret}`).toString("base64")}`,
      "content-type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) throw new Error(`Razorpay ${response.status}: ${await response.text()}`);
  return (await response.json()) as T;
}

type LinkEntity = { id: string; short_url: string; status: string; amount: number; amount_paid: number; reference_id: string };

/** Buying this plan now would throw away paid time on the current one. */
export class PlanConflictError extends Error {}

export async function createPaymentLink(input: { userId: string; email: string; plan: PaidPlan; callbackUrl: string }) {
  const amountPaise = planPrice(input.plan) * 100;
  const db = supabase();

  // A different plan starts today (grant_paid_plan), so selling a cheaper one
  // over an active dearer one would forfeit what was already paid for.
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", input.userId)
    .maybeSingle();
  if (profileError) throw new Error(`profile read failed: ${profileError.message}`);
  const current = profile?.plan;
  const active = isPaidPlan(current) && (!profile?.plan_expires_at || new Date(profile.plan_expires_at).getTime() > Date.now());
  if (active && current !== input.plan && planPrice(current) > planPrice(input.plan)) {
    throw new PlanConflictError(`${planName(current)} is active until it lapses; ${planName(input.plan)} can be bought after that.`);
  }
  if (active && current === input.plan && !profile?.plan_expires_at) {
    throw new PlanConflictError(`${planName(current)} is already on your account and does not lapse.`);
  }

  const { data: row, error } = await db
    .from("payments")
    .insert({ user_id: input.userId, plan: input.plan, amount_paise: amountPaise })
    .select("id")
    .single();
  if (error || !row) throw new Error(`payments insert failed: ${error?.message}`);

  const link = await razorpay<LinkEntity>("/payment_links", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      description: `Shisho AI — ${planName(input.plan)}, one month`,
      reference_id: row.id,
      customer: { email: input.email },
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: input.callbackUrl,
      callback_method: "get",
      // Razorpay needs at least 15 minutes; an hour is plenty to pay.
      expire_by: Math.floor(Date.now() / 1000) + 60 * 60,
      notes: { user_id: input.userId, plan: input.plan },
    },
  });

  // confirmPayment can still find the row by the link's reference_id if this
  // fails, but a failure here is worth knowing about rather than ignoring.
  const { error: linkError } = await db.from("payments").update({ link_id: link.id }).eq("id", row.id);
  if (linkError) console.error(`[payments] saving link_id ${link.id} for payment ${row.id} failed:`, linkError);
  return { url: link.short_url, paymentId: row.id };
}

const hmac = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The redirect's signature: link id | reference id | status | payment id, keyed by the key secret. */
export function verifyCallbackSignature(q: { linkId: string; referenceId: string; status: string; paymentId: string; signature: string }) {
  const k = keys();
  if (!k) return false;
  return safeEqual(hmac(k.secret, `${q.linkId}|${q.referenceId}|${q.status}|${q.paymentId}`), q.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return Boolean(secret) && safeEqual(hmac(secret!, rawBody), signature);
}

export type ConfirmResult = { status: "paid"; plan: PaidPlan; expiresAt: string } | { status: "unpaid" | "unknown" };

/**
 * Grants the plan once Razorpay itself says the link is paid in full.
 * Idempotent: a row already marked paid returns its plan without granting again.
 */
export async function confirmPayment(linkId: string, paymentId: string | null): Promise<ConfirmResult> {
  const db = supabase();
  const columns = "id, user_id, plan, amount_paise, status";
  const { data: byLink, error: readError } = await db.from("payments").select(columns).eq("link_id", linkId).maybeSingle();
  if (readError) throw new Error(`payment read failed: ${readError.message}`);
  let row = byLink;

  let link: LinkEntity | null = null;
  if (!row) {
    // link_id is saved after the link is made. If that save failed, the link's
    // reference_id (our payments row id) still finds the row.
    link = await razorpay<LinkEntity>(`/payment_links/${encodeURIComponent(linkId)}`);
    if (!UUID.test(link.reference_id ?? "")) return { status: "unknown" };
    const { data: byRef, error: refError } = await db
      .from("payments")
      .select(columns)
      .eq("id", link.reference_id)
      .is("link_id", null)
      .maybeSingle();
    if (refError) throw new Error(`payment read failed: ${refError.message}`);
    if (byRef) {
      const { error: linkError } = await db.from("payments").update({ link_id: linkId }).eq("id", byRef.id);
      if (linkError) throw new Error(`saving link_id failed: ${linkError.message}`);
    }
    row = byRef;
  }
  if (!row || !isPaidPlan(row.plan)) return { status: "unknown" };

  if (row.status === "paid") {
    const { data: profile } = await db.from("profiles").select("plan_expires_at").eq("id", row.user_id).maybeSingle();
    return { status: "paid", plan: row.plan, expiresAt: profile?.plan_expires_at ?? new Date().toISOString() };
  }

  link ??= await razorpay<LinkEntity>(`/payment_links/${encodeURIComponent(linkId)}`);
  if (link.status !== "paid" || link.amount_paid < row.amount_paise || link.reference_id !== row.id) {
    return { status: "unpaid" };
  }

  // Marks the row paid and grants the plan in one transaction
  // (supabase/live-3-paid-plan-grant.sql), so a failure leaves neither done and
  // a retry grants it; a callback and a webhook arriving together grant once.
  // A database error is thrown: the webhook answers 5xx and Razorpay retries.
  const { data: expiresAt, error } = await db.rpc("grant_paid_plan", { p_payment: row.id, p_payment_ref: paymentId });
  if (error) throw new Error(`plan grant failed: ${error.message}`);
  return { status: "paid", plan: row.plan, expiresAt: (expiresAt as string | null) ?? new Date().toISOString() };
}
