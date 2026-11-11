import { confirmPayment, planName, verifyCallbackSignature } from "@/lib/payments";

/**
 * GET /api/pay/razorpay/callback: where Razorpay sends the payer after the
 * payment page. The signature is checked, then confirmPayment asks Razorpay
 * itself before granting anything. The page hands the result back to the app
 * (shisho://payment) and also says it in words, in case the browser does not
 * switch back by itself.
 */
export const runtime = "nodejs";

const APP_RETURN = "shisho://payment";

function page(status: "paid" | "unpaid" | "error", message: string) {
  const back = `${APP_RETURN}?status=${status}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shisho AI payment</title>
<style>body{font-family:system-ui,sans-serif;background:#EAE8E1;color:#1C1A17;margin:0;padding:48px 24px;line-height:1.5}main{max-width:420px;margin:auto}a{display:inline-block;margin-top:16px;padding:12px 18px;background:#1C1A17;color:#EAE8E1;text-decoration:none}</style>
</head><body><main><h1 style="font-weight:600;font-size:22px">${message}</h1><a href="${back}">Return to the app</a></main>
<script>setTimeout(function(){location.href=${JSON.stringify(back)}},600)</script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const linkId = q.get("razorpay_payment_link_id") ?? "";
  const referenceId = q.get("razorpay_payment_link_reference_id") ?? "";
  const status = q.get("razorpay_payment_link_status") ?? "";
  const paymentId = q.get("razorpay_payment_id") ?? "";
  const signature = q.get("razorpay_signature") ?? "";

  if (!linkId || !signature || !verifyCallbackSignature({ linkId, referenceId, status, paymentId, signature })) {
    return page("error", "This payment could not be checked. If money left your account, it will be matched shortly.");
  }
  try {
    const result = await confirmPayment(linkId, paymentId || null);
    if (result.status === "paid") return page("paid", `Paid. ${planName(result.plan)} is now on your account.`);
    return page("unpaid", "The payment did not go through. Nothing was charged for the plan.");
  } catch (e) {
    console.error("[pay/razorpay/callback] confirm failed:", e);
    return page("error", "Your payment is being confirmed. Check your plan in the app in a few minutes.");
  }
}
