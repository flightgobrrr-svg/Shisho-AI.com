import { useState } from "react";
import { Platform, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Button, T } from "@/ui/components";
import { apiConfigured, describeError } from "@/api/client";
import { fetchMe, startPayment } from "@/api/endpoints";
import { useSession } from "@/state/auth";
import { PLAN_LABEL, payLabel, type PaidPlan } from "@/features/plans";

/**
 * Buying one month of a plan with Razorpay. The server makes the payment
 * page for the lib/pricing.ts price; the app opens it in the system browser
 * and, when Razorpay sends the payer back (shisho://payment), asks the server
 * for the plan. The plan only changes once the server has confirmed the
 * payment with Razorpay itself, so this screen never decides anything.
 *
 * Android first: Apple requires its own in-app purchase for digital plans, so
 * iPhone gets a plain note instead of a button.
 */
export function PayButton({ plan, variant = "primary" }: { plan: PaidPlan; variant?: "primary" | "ghost" }) {
  const { session } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "seal" | "indigo" } | null>(null);

  if (!apiConfigured) return null;
  if (Platform.OS === "ios") {
    return <T v="small" tone="faint">Buying a plan in the iPhone app is not available yet.</T>;
  }
  if (!session) return <Button label="Sign in to buy" href="/account" variant="ghost" />;

  const pay = async () => {
    setMessage(null);
    setBusy(true);
    try {
      // The plan's end date before paying: a confirmed month always moves it.
      const before = await fetchMe().catch(() => null);
      const { url } = await startPayment(plan);
      if (Platform.OS === "web") {
        window.open(url, "_blank");
        setMessage({ text: "The payment page opened in a new tab. Your plan updates once it is paid.", tone: "indigo" });
        return;
      }
      await WebBrowser.openAuthSessionAsync(url, "shisho://payment");
      // Whatever the browser reported, the account is the truth.
      const me = await fetchMe();
      setMessage(
        me.plan === plan && me.planExpiresAt && me.planExpiresAt !== before?.planExpiresAt
          ? { text: `Paid. ${PLAN_LABEL[plan]} is on your account${me.planExpiresAt ? ` until ${new Date(me.planExpiresAt).toLocaleDateString("en-IN")}` : ""}.`, tone: "indigo" }
          : { text: "No payment was confirmed. If money left your account, your plan will update within a few minutes.", tone: "seal" },
      );
    } catch (e) {
      setMessage({ text: describeError(e), tone: "seal" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      <Button label={busy ? "Opening Razorpay…" : payLabel(plan)} variant={variant} disabled={busy} onPress={pay} />
      {message ? <T v="small" tone={message.tone} accessibilityLiveRegion="polite">{message.text}</T> : null}
    </View>
  );
}
