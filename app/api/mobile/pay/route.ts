import { NextResponse } from "next/server";
import { authClient, bearerToken, mobileError, siteOrigin } from "@/lib/mobileApi";
import { createPaymentLink, isPaidPlan, paymentsConfigured, PlanConflictError } from "@/lib/payments";

/**
 * POST /api/mobile/pay { plan }: starts paying for one month of a plan.
 * Needs a signed-in account (the plan belongs to it). Answers with the
 * Razorpay page to open; the plan changes only after lib/payments.ts has
 * confirmed the payment with Razorpay.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!paymentsConfigured()) return mobileError(503, "Payments are not switched on yet.");
  const token = bearerToken(request);
  const client = authClient();
  if (!token || !client) return mobileError(401, "Sign in to buy a plan.");
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return mobileError(401, "Your session has ended. Sign in again.");

  let plan: unknown;
  try {
    plan = ((await request.json()) as { plan?: unknown })?.plan;
  } catch {
    return mobileError(400, "Malformed request.");
  }
  if (!isPaidPlan(plan)) return mobileError(400, "Pick a plan.");

  try {
    const link = await createPaymentLink({
      userId: data.user.id,
      email: data.user.email,
      plan,
      callbackUrl: `${siteOrigin(request)}/api/pay/razorpay/callback`,
    });
    return NextResponse.json({ url: link.url });
  } catch (e) {
    if (e instanceof PlanConflictError) return mobileError(409, e.message);
    console.error("[api/mobile/pay] could not create the payment link:", e);
    return mobileError(502, "The payment page could not be opened. Try again shortly.");
  }
}
