import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, readJson, str, ClerkError } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/offices: the offices the signed-in person belongs to, with their role.
 * POST /api/mobile/clerk/offices: create an office; its creator becomes the Office Administrator.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  return clerkRoute(async () => {
    const user = await clerkUser(request);
    const { data, error } = await supabase()
      .from("clerk_members")
      .select("role, office:clerk_offices(id, name, state, district, created_at)")
      .eq("user_id", user.id)
      .eq("active", true);
    if (error) throw error;
    return NextResponse.json({ offices: (data ?? []).map((r) => ({ ...(r.office as unknown as object), role: r.role })) });
  });
}

export async function POST(request: Request) {
  return clerkRoute(async () => {
    const user = await clerkUser(request);
    const body = await readJson(request);
    const name = str(body.name, 200);
    if (name.length < 2) throw new ClerkError(400, "Give the office a name.");
    const { data: office, error } = await supabase()
      .from("clerk_offices")
      .insert({ name, state: str(body.state, 80) || null, district: str(body.district, 80) || null, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    const { error: mErr } = await supabase().from("clerk_members").insert({ office_id: office.id, user_id: user.id, role: "office_admin", added_by: user.id });
    if (mErr) throw mErr;
    await audit(office.id, null, user.id, "office.created", { name });
    return NextResponse.json({ office: { ...office, role: "office_admin" } }, { status: 201 });
  });
}
