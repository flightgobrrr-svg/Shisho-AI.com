import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { getWork } from "@/lib/clerkWork";
import { analyseBlankForm, isMapTarget, targetLabel, type MapTarget } from "@/lib/clerkForms";
import { chosenValues, clerkRoute, clerkUser, getFile, loadMatter, matterFields, readJson, ClerkError } from "@/lib/clerkStore";
import { valuesFor } from "@/lib/clerkGenerate";

/**
 * POST /api/mobile/clerk/matters/[id]/form  { uploadId, workNo, filingDate? }
 *
 * Finds every blank on an uploaded blank form and proposes the field for each,
 * with the value that would go in. If the office has already confirmed a
 * mapping for this exact form (same file fingerprint), that mapping is used.
 * Nothing is written to the form here; this is the mapping the person reviews.
 */
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request);
    const work = getWork(Number(body.workNo));
    if (!work) throw new ClerkError(400, "Choose the clerk work (1–63).");
    if (!isUuid(body.uploadId)) throw new ClerkError(400, "Choose the blank form.");
    const { data: upload } = await supabase().from("clerk_uploads").select("*").eq("id", body.uploadId).eq("matter_id", id).eq("kind", "blank_form").is("deleted_at", null).maybeSingle();
    if (!upload) throw new ClerkError(404, "That blank form was not found.");

    const analysis = await analyseBlankForm(new Uint8Array(await getFile(upload.storage_path)));
    if (!analysis.hasText) {
      throw new ClerkError(422, "This blank form is a scan with no text layer, so its blanks cannot be located. Upload the court's fillable or text PDF of the form.");
    }

    const { data: template } = await supabase()
      .from("clerk_templates")
      .select("id, name, version, mapping, approved_at")
      .eq("office_id", matter.office_id)
      .eq("sha256", upload.sha256)
      .eq("status", "active")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    const saved = (template?.mapping ?? {}) as Record<string, unknown>;

    const values = valuesFor(chosenValues(await matterFields(id)), work, typeof body.filingDate === "string" ? body.filingDate : "", typeof body.documentName === "string" ? body.documentName.slice(0, 200) : "");
    const blanks = analysis.placeholders.map((p) => {
      const fromTemplate = isMapTarget(saved[p.id]) ? (saved[p.id] as MapTarget) : null;
      const target: MapTarget = p.protected ? "blank" : (fromTemplate ?? p.suggested);
      return {
        id: p.id,
        page: p.page,
        label: p.label,
        after: p.after,
        protected: p.protected,
        target,
        targetLabel: targetLabel(target),
        reason: fromTemplate ? "saved mapping for this form" : p.reason,
        value: target === "blank" ? "" : (values[target] ?? ""),
      };
    });

    return NextResponse.json({
      pages: analysis.pages.length,
      hasDocket: analysis.hasDocket,
      template: template ? { id: template.id, name: template.name, version: template.version, approved: Boolean(template.approved_at) } : null,
      blanks,
    });
  });
}
