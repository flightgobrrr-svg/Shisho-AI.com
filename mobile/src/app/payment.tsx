import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Button, Notice, Screen, T } from "@/ui/components";
import { fetchMe, type Plan } from "@/api/endpoints";
import { describeError } from "@/api/client";
import { PLAN_LABEL } from "@/features/plans";

/**
 * Where shisho://payment lands when the browser hands the payer back to the
 * app on its own. The query string only says what the browser saw; the plan
 * shown is read from the account, which the server sets after checking the
 * payment with Razorpay.
 */
export default function PaymentReturn() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const [plan, setPlan] = useState<{ plan: Plan; until?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((r) => setPlan({ plan: r.plan, until: r.planExpiresAt }))
      .catch((e) => setError(describeError(e)));
  }, []);

  return (
    <Screen>
      <T v="label" tone="indigo">Payment</T>
      {status === "paid" ? (
        <T v="h2">Payment received.</T>
      ) : status === "unpaid" ? (
        <T v="h2">The payment did not go through.</T>
      ) : (
        <T v="h2">Checking your payment.</T>
      )}
      {plan ? (
        <Notice
          title={`Your plan: ${PLAN_LABEL[plan.plan]}`}
          body={plan.until ? `Until ${new Date(plan.until).toLocaleDateString("en-IN")}. It does not renew by itself.` : undefined}
        />
      ) : error ? (
        <T tone="seal">{error}</T>
      ) : (
        <T tone="soft">Reading your account…</T>
      )}
      <Button label="Back to plans" href="/pricing" variant="ghost" />
    </Screen>
  );
}
