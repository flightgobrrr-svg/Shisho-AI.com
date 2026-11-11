import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { rerender } from "@/lib/clerkCreate";
import { audit, clerkRoute, clerkUser, loadMatter, putFile, readJson, requireMember, ClerkError, must } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/documents/[id]: one generated document, its report and approval record.
 * POST /api/mobile/clerk/documents/[id]  { action: "approve" }
 *
 * Only an advocate or the administrator approves. Approval re-renders the
 * document from exactly the values, answers and register data it was drafted
 * with, minus the draft label, and marks it "Ready for Execution". It is still
 * unsigned: nothing here records it as executed, filed or accepted.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

async function load(userId: string, id: string, action: "view" | "approve") {
  if (!isUuid(id)) throw new ClerkError(404, "That document was not found.");
  const { data: doc } = await supabase().from("clerk_documents").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!doc) throw new ClerkError(404, "That document was not found.");
  if (doc.matter_id) {
    const { matter, role } = await loadMatter(userId, doc.matter_id, action);
    return { doc, matter: matter as { id: string; serial_no: number; case_label: string | null; cause_title: string | null } | null, role };
  }
  const role = await requireMember(userId, doc.office_id, action);
  return { doc, matter: null, role };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { doc, matter, role } = await load(user.id, id, "view");
    const ids = [doc.created_by, doc.approved_by].filter(Boolean);
    const { data: people } = await supabase().from("profiles").select("id, email").in("id", ids);
    const email = Object.fromEntries((people ?? []).map((p) => [p.id, p.email]));
    let vq = supabase().from("clerk_documents").select("id, version, status, created_at").eq("office_id", doc.office_id).eq("work_no", doc.work_no).is("deleted_at", null).order("version", { ascending: false });
    vq = doc.matter_id ? vq.eq("matter_id", doc.matter_id) : vq.is("matter_id", null);
    const { data: versions } = await vq;
    const { serviceData: _omit, translation: _tr, ...options } = (doc.options ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      document: {
        id: doc.id,
        workNo: doc.work_no,
        version: doc.version,
        status: doc.status,
        pdfName: doc.pdf_path ? doc.pdf_name : null,
        docxName: doc.docx_path ? doc.docx_name : null,
        options,
        inputs: doc.inputs ?? {},
        report: doc.report,
        createdAt: doc.created_at,
        createdBy: email[doc.created_by] ?? "",
        approvedAt: doc.approved_at,
        approvedBy: doc.approved_by ? (email[doc.approved_by] ?? "") : null,
      },
      matter: matter ? { id: matter.id, serial_no: matter.serial_no, case_label: matter.case_label, cause_title: matter.cause_title } : null,
      officeId: doc.office_id,
      versions: versions ?? [],
      role,
    });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const body = await readJson(request);
    if (body.action !== "approve") throw new ClerkError(400, "Unknown action.");
    const { doc } = await load(user.id, id, "approve");
    if (doc.status === "ready_for_execution") throw new ClerkError(409, "This version is already approved.");

    const out = await rerender(doc);
    const base = `offices/${doc.office_id}/${doc.matter_id ? `matters/${doc.matter_id}` : "office"}/documents/${doc.id}`;
    const update: Record<string, unknown> = { status: "ready_for_execution", approved_by: user.id, approved_at: new Date().toISOString(), report: { ...out.report, draftFiles: { pdf: doc.pdf_path, docx: doc.docx_path } } };
    if (doc.pdf_path) {
      await putFile(`${base}/approved.pdf`, Buffer.from(out.pdf), "application/pdf");
      update.pdf_path = `${base}/approved.pdf`;
    }
    if (doc.docx_path) {
      await putFile(`${base}/approved.docx`, out.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      update.docx_path = `${base}/approved.docx`;
    }
    await must(supabase().from("clerk_documents").update(update).eq("id", doc.id));
    await audit(doc.office_id, doc.matter_id, user.id, "document.approved", { document: doc.id, work: doc.work_no, version: doc.version });
    return NextResponse.json({ ok: true, status: "ready_for_execution" });
  });
}
