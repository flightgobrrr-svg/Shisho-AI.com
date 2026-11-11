import { NextResponse } from "next/server";
import { isEmail } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { isRole } from "@/lib/clerkWork";
import { audit, clerkRoute, clerkUser, exactEmail, readJson, requireMember, ClerkError } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/offices/[id]/members: who is in the office and their roles.
 * POST /api/mobile/clerk/offices/[id]/members: add someone (by the email of their
 *      Shisho account) or change their role or remove them. Administrator only.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "view");
    const { data, error } = await supabase().from("clerk_members").select("user_id, role, active, created_at").eq("office_id", id);
    if (error) throw error;
    const ids = (data ?? []).map((m) => m.user_id);
    const { data: profiles } = ids.length ? await supabase().from("profiles").select("id, email").in("id", ids) : { data: [] };
    const email = new Map((profiles ?? []).map((p) => [p.id, p.email]));
    return NextResponse.json({ members: (data ?? []).map((m) => ({ ...m, email: email.get(m.user_id) ?? "" })) });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "manage_members");
    const body = await readJson(request);
    if (!isEmail(body.email)) throw new ClerkError(400, "Enter the email of their Shisho account.");
    const remove = body.remove === true;
    if (!remove && !isRole(body.role)) throw new ClerkError(400, "Choose a role.");

    const { data: profile } = await supabase().from("profiles").select("id").ilike("email", exactEmail(String(body.email))).maybeSingle();
    if (!profile) throw new ClerkError(404, "No Shisho account uses that email. Ask them to sign up in the app first.");
    if (profile.id === user.id && (remove || body.role !== "office_admin")) {
      throw new ClerkError(400, "You cannot remove yourself or drop your own administrator role.");
    }

    const { error } = await supabase()
      .from("clerk_members")
      .upsert({ office_id: id, user_id: profile.id, role: remove ? "read_only" : body.role, active: !remove, added_by: user.id }, { onConflict: "office_id,user_id" });
    if (error) throw error;
    await audit(id, null, user.id, remove ? "member.removed" : "member.set", { member: profile.id, role: remove ? null : body.role });
    return NextResponse.json({ ok: true });
  });
}
