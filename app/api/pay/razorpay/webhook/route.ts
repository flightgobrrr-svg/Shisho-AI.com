import { NextResponse } from "next/server";
import { confirmPayment, verifyWebhookSignature } from "@/lib/payments";

/**
 * POST /api/pay/razorpay/webhook: Razorpay's server-to-server notice. It
 * covers the payer who closes the browser before the callback page loads.
 * Set this URL and RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard, with
 * the `payment_link.paid` event.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 1_000_000) return NextResponse.json({ ok: false }, { status: 413 });
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const event = JSON.parse(raw) as {
    event?: string;
    payload?: { payment_link?: { entity?: { id?: string } }; payment?: { entity?: { id?: string } } };
  };
  const linkId = event.payload?.payment_link?.entity?.id;
  if (event.event !== "payment_link.paid" || !linkId) return NextResponse.json({ ok: true });
  try {
    const result = await confirmPayment(linkId, event.payload?.payment?.entity?.id ?? null);
    // Still 200: a link with no payments row will never match, and retrying it
    // would only get the webhook disabled. Logged so a paid-but-lost one is seen.
    if (result.status === "unknown") console.error(`[pay/razorpay/webhook] paid link ${linkId} matches no payment row`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[pay/razorpay/webhook] confirm failed:", e);
    // A 5xx makes Razorpay retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
