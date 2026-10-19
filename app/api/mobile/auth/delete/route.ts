import { NextResponse } from "next/server";
import { authClient, bearerToken, mobileError } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/usageCounters";

/**
 * POST /api/mobile/auth/delete: deletes the signed-in person's account.
 *
 * App stores expect an in-app way to delete an account that was created in the
 * app, so it exists from day one. It removes the Supabase user (the profile row
 * cascades from it) and that person's usage counters. The caller must present
 * a valid access token; the user ID comes from the token, never from the body.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = authClient();
  const token = bearerToken(request);
  if (!client || !isSupabaseConfigured()) return mobileError(503, "Accounts aren't set up yet.");
  if (!token) return mobileError(401, "Sign in to delete your account.");

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return mobileError(401, "Your session has ended. Sign in again.");
  const userId = data.user.id;

  const admin = supabase();
  await admin.from("usage_counters").delete().eq("visitor_id", userId);
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("[mobile delete] failed:", deleteError.message);
    return mobileError(500, "We could not delete the account. Try again, or contact us.");
  }
  return NextResponse.json({ ok: true });
}
