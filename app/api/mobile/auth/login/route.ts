import { NextResponse } from "next/server";
import { authClient, isEmail, mobileError, toMobileSession } from "@/lib/mobileApi";
import { getUserPlan } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/usageCounters";

/** POST /api/mobile/auth/login: { email, password } -> tokens, user and plan. */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = authClient();
  if (!client) return mobileError(503, "Accounts aren't set up yet.");

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return mobileError(400, "Malformed JSON body.");
  }
  if (!isEmail(body.email)) return mobileError(400, "Enter a valid email address.");
  if (typeof body.password !== "string" || body.password.length < 1 || body.password.length > 256) {
    return mobileError(400, "Enter your password.");
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: body.email.trim(),
    password: body.password,
  });
  const session = toMobileSession(data.session);
  if (error || !session) {
    // One message for wrong password and unknown email: do not reveal which accounts exist.
    return mobileError(401, "That email and password do not match.");
  }

  const plan = isSupabaseConfigured() ? await getUserPlan(session.user.id) : "free";
  return NextResponse.json({ session, plan });
}
