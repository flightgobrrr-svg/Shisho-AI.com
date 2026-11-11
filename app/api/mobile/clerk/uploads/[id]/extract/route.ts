import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { clerkRoute, clerkUser, getFile, loadMatter, ClerkError } from "@/lib/clerkStore";
import { runExtraction } from "@/lib/clerkIntake";

/** POST /api/mobile/clerk/uploads/[id]/extract: read a stored case-data file again (retry). */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    if (!isUuid(id)) throw new ClerkError(404, "That file was not found.");
    const { data: upload } = await supabase().from("clerk_uploads").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (!upload || upload.kind !== "case_data") throw new ClerkError(404, "That file was not found.");
    const { matter } = await loadMatter(user.id, upload.matter_id, "prepare");
    if (upload.status === "processing" && Date.now() - new Date(upload.created_at).getTime() < 5 * 60_000) {
      throw new ClerkError(409, "That file is still being read.");
    }
    const buf = await getFile(upload.storage_path);
    const reading = await runExtraction({ uploadId: id, officeId: matter.office_id, matterId: matter.id, userId: user.id, mimeType: upload.mime_type, buf, pages: upload.pages, filename: upload.filename });
    return NextResponse.json({ reading });
  });
}
