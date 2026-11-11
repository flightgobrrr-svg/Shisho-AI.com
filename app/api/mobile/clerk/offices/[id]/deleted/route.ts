import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clerkRoute, clerkUser, requireMember } from "@/lib/clerkStore";

/** GET /api/mobile/clerk/offices/[id]/deleted: deleted cases that can still be restored (administrator / senior advocate). */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "delete");
    const [{ data }, { data: office }] = await Promise.all([
      supabase().from("clerk_matters").select("id, serial_no, case_label, cause_title, deleted_at").eq("office_id", id).not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(200),
      supabase().from("clerk_offices").select("retention_days").eq("id", id).maybeSingle(),
    ]);
    return NextResponse.json({ matters: data ?? [], retentionDays: office?.retention_days ?? null });
  });
}
