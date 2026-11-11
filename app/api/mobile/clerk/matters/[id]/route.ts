import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CASE_FIELDS } from "@/lib/clerkWork";
import { audit, clerkRoute, clerkUser, conflicts, loadMatter, matterFields, readJson, str, must } from "@/lib/clerkStore";

/**
 * GET   /api/mobile/clerk/matters/[id]: the whole case sheet: matter, every candidate
 *       field with its source and confidence, conflicts, uploads, generated documents,
 *       connected matters and the activity history.
 * PATCH /api/mobile/clerk/matters/[id]: the office file code.
 * DELETE /api/mobile/clerk/matters/[id]: soft delete (recoverable by the administrator).
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter, role } = await loadMatter(user.id, id, "view");
    const db = supabase();
    const [fields, uploads, documents, history, connected, hearings, tasks, entries] = await Promise.all([
      matterFields(id),
      db.from("clerk_uploads").select("id, kind, filename, mime_type, bytes, pages, status, error, created_at").eq("matter_id", id).is("deleted_at", null).order("created_at"),
      db.from("clerk_documents").select("id, work_no, version, status, pdf_name, docx_name, created_at, created_by, approved_by, approved_at, report").eq("matter_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
      db.from("clerk_audit").select("action, actor, detail, at").eq("matter_id", id).order("at", { ascending: false }).limit(60),
      db.from("clerk_matters").select("id, serial_no, case_label, cause_title").eq("parent_id", id).is("deleted_at", null),
      db.from("clerk_hearings").select("id, hearing_on, purpose, result, source, next_on, next_purpose, directions, confirmed_at, created_at").eq("matter_id", id).is("deleted_at", null).order("hearing_on", { ascending: false }).limit(50),
      db.from("clerk_tasks").select("id, title, status, slot, due_on, assigned_to, work_no").eq("matter_id", id).is("deleted_at", null).not("status", "in", "(completed,closed)").order("due_on", { ascending: true, nullsFirst: false }),
      db.from("clerk_entries").select("kind, status").eq("matter_id", id).is("deleted_at", null),
    ]);
    const entryCounts: Record<string, number> = {};
    for (const e of entries.data ?? []) entryCounts[e.kind] = (entryCounts[e.kind] ?? 0) + 1;

    // Who did what, by email, for the history and the approval record.
    const actors = new Set<string>([...(history.data ?? []).map((h) => h.actor), ...(documents.data ?? []).flatMap((d) => [d.created_by, d.approved_by].filter(Boolean) as string[]), ...((tasks.data ?? []).map((t) => t.assigned_to).filter(Boolean) as string[])]);
    const { data: people } = actors.size ? await db.from("profiles").select("id, email").in("id", [...actors]) : { data: [] };
    const email = Object.fromEntries((people ?? []).map((p) => [p.id, p.email]));

    let parent = null;
    if (matter.parent_id) parent = (await db.from("clerk_matters").select("id, serial_no, case_label").eq("id", matter.parent_id).maybeSingle()).data;

    return NextResponse.json({
      matter,
      role,
      parent,
      connected: connected.data ?? [],
      fields,
      conflicts: conflicts(fields),
      missing: CASE_FIELDS.filter((f) => !fields.some((r) => r.key === f.key && r.chosen)).map((f) => f.key),
      uploads: uploads.data ?? [],
      documents: documents.data ?? [],
      history: history.data ?? [],
      hearings: hearings.data ?? [],
      tasks: tasks.data ?? [],
      entryCounts,
      people: email,
    });
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request);
    const fileCode = str(body.fileCode, 60) || null;
    await must(supabase().from("clerk_matters").update({ file_code: fileCode, updated_at: new Date().toISOString() }).eq("id", id));
    await audit(matter.office_id, id, user.id, "matter.updated", { fileCode });
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "delete");
    await must(supabase().from("clerk_matters").update({ deleted_at: new Date().toISOString() }).eq("id", id));
    await audit(matter.office_id, id, user.id, "matter.deleted", {});
    return NextResponse.json({ ok: true });
  });
}
