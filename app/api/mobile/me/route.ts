import { NextResponse } from "next/server";
import { authClient, bearerToken, mobileError } from "@/lib/mobileApi";
import { getUserPlanDetails } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/usageCounters";

/** GET /api/mobile/me: the signed-in person and their plan. */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");
  const token = bearerToken(request);
  if (!token) return mobileError(401, "Sign in first.");

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return mobileError(401, "Your session has ended. Sign in again.");

  const details = isSupabaseConfigured()
    ? await getUserPlanDetails(data.user.id)
    : { plan: "free" as const, expiresAt: null };
  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    plan: details.plan,
    planExpiresAt: details.expiresAt,
  });
}
