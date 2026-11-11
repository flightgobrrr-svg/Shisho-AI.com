import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clerkRoute, clerkUser, requireMember } from "@/lib/clerkStore";

/** GET /api/mobile/clerk/offices/[id]/documents: the office-wide daily sheets generated so far (newest first). */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "view");
    const { data } = await supabase().from("clerk_documents").select("id, work_no, version, status, pdf_name, docx_name, created_at").eq("office_id", id).is("matter_id", null).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
    return NextResponse.json({ documents: data ?? [] });
  });
}
