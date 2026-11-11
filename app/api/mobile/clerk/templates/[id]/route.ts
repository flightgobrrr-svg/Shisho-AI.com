import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, readJson, requireMember, str, ClerkError, must } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/templates/[id]  { action: "approve" | "archive" | "activate" | "reviewed" | "details", name?, forum?, state?, district?, proceedingType?, language? }
 *
 * An approved template is never edited in place: its mapping is fixed, and a
 * changed mapping is saved as a new version when the form is next used.
 * Approval, like a document's, is an advocate's or the administrator's.
 */
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    if (!isUuid(id)) throw new ClerkError(404, "That template was not found.");
    const { data: t } = await supabase().from("clerk_templates").select("*").eq("id", id).maybeSingle();
    if (!t) throw new ClerkError(404, "That template was not found.");
    const body = await readJson(request);
    const now = new Date().toISOString();
    let update: Record<string, unknown> = {};
    switch (body.action) {
      case "approve":
        await requireMember(user.id, t.office_id, "approve");
        if (t.approved_at) throw new ClerkError(409, "Already approved.");
        update = { approved_by: user.id, approved_at: now, last_reviewed_at: now, status: "active" };
        break;
      case "archive":
        await requireMember(user.id, t.office_id, "approve");
        update = { status: "archived" };
        break;
      case "activate":
        await requireMember(user.id, t.office_id, "approve");
        update = { status: "active" };
        break;
      case "reviewed":
        await requireMember(user.id, t.office_id, "approve");
        update = { last_reviewed_at: now };
        break;
      case "details":
        await requireMember(user.id, t.office_id, "prepare");
        update = {
          name: str(body.name, 200) || t.name,
          forum: body.forum !== undefined ? str(body.forum, 200) || null : t.forum,
          state: body.state !== undefined ? str(body.state, 80) || null : t.state,
          district: body.district !== undefined ? str(body.district, 80) || null : t.district,
          proceeding_type: body.proceedingType !== undefined ? str(body.proceedingType, 80) || null : t.proceeding_type,
          language: ["en", "te", "bilingual"].includes(String(body.language)) ? body.language : t.language,
        };
        break;
      default:
        throw new ClerkError(400, "Unknown action.");
    }
    await must(supabase().from("clerk_templates").update(update).eq("id", id));
    await audit(t.office_id, null, user.id, `template.${body.action}`, { template: id, version: t.version });
    return NextResponse.json({ ok: true });
  });
}
