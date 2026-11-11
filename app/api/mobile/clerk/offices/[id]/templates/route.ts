import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clerkRoute, clerkUser, requireMember } from "@/lib/clerkStore";

/** GET /api/mobile/clerk/offices/[id]/templates: the template library (saved form mappings, every version). */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const { data, error } = await supabase()
      .from("clerk_templates")
      .select("id, work_no, name, forum, state, district, proceeding_type, language, version, status, created_by, created_at, approved_by, approved_at, last_reviewed_at, mapping")
      .eq("office_id", id)
      .order("name")
      .order("version", { ascending: false });
    if (error) throw error;
    const pids = [...new Set((data ?? []).flatMap((t) => [t.created_by, t.approved_by]).filter(Boolean))];
    const { data: ps } = pids.length ? await supabase().from("profiles").select("id, email").in("id", pids) : { data: [] };
    return NextResponse.json({
      templates: (data ?? []).map(({ mapping, ...t }) => ({ ...t, fields: Object.values((mapping ?? {}) as Record<string, string>).filter((v) => v !== "blank").length })),
      people: Object.fromEntries((ps ?? []).map((p) => [p.id, p.email])),
      role,
    });
  });
}
