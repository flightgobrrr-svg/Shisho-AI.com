import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, readJson, requireMember, ClerkError, must } from "@/lib/clerkStore";

/**
 * GET   /api/mobile/clerk/offices/[id]: the office and your role in it.
 * PATCH /api/mobile/clerk/offices/[id]  { retentionDays: number | null }: how long deleted cases are kept (administrator).
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const { data } = await supabase().from("clerk_offices").select("id, name, state, district, retention_days, created_at").eq("id", id).maybeSingle();
    return NextResponse.json({ office: { ...data, role } });
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "manage_members");
    const body = await readJson(request);
    const days = body.retentionDays === null ? null : Number(body.retentionDays);
    if (days !== null && (!Number.isInteger(days) || days < 30 || days > 36500)) throw new ClerkError(400, "Keep deleted cases for at least 30 days, or choose to keep them until removed by hand.");
    await must(supabase().from("clerk_offices").update({ retention_days: days }).eq("id", id));
    await audit(id, null, user.id, "office.retention", { days });
    return NextResponse.json({ ok: true });
  });
}
