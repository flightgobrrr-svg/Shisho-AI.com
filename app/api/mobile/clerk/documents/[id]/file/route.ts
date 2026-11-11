import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, getFile, loadMatter, requireMember, ClerkError } from "@/lib/clerkStore";

/**
 * GET /api/mobile/clerk/documents/[id]/file?kind=pdf|docx
 *
 * Streams a generated file to a member of its office (and, for a restricted
 * case, only to those on its list). There is no public or signed URL; every
 * download is checked here and recorded in the history.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const kind = new URL(request.url).searchParams.get("kind") === "docx" ? "docx" : "pdf";
    if (!isUuid(id)) throw new ClerkError(404, "That document was not found.");
    const { data: doc } = await supabase().from("clerk_documents").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (!doc) throw new ClerkError(404, "That document was not found.");
    if (doc.matter_id) await loadMatter(user.id, doc.matter_id, "view");
    else await requireMember(user.id, doc.office_id, "view");
    const path = kind === "pdf" ? doc.pdf_path : doc.docx_path;
    const name = kind === "pdf" ? doc.pdf_name : doc.docx_name;
    if (!path || !name) throw new ClerkError(404, `This version has no ${kind.toUpperCase()}.`);
    const buf = await getFile(path);
    await audit(doc.office_id, doc.matter_id, user.id, "document.downloaded", { document: doc.id, kind, version: doc.version, status: doc.status, work: doc.work_no });
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
        "cache-control": "private, no-store",
      },
    });
  });
}
