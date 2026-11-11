import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { ADVOCATE_STATUSES, TASK_STATUS_LABELS, isTaskSlot, isTaskStatus, parseIndianDate } from "@/lib/clerkRegisters";
import { can } from "@/lib/clerkWork";
import { audit, clerkRoute, clerkUser, mayOpen, readJson, requireMember, roleIn, str, ClerkError, must } from "@/lib/clerkStore";

/**
 * GET    /api/mobile/clerk/tasks/[id]: the task and every status change, with who and when.
 * PATCH  /api/mobile/clerk/tasks/[id]: { status?, note?, assignTo?, due?, slot?, title? }
 *        "Approved" and "Corrections Required" are an advocate's or the administrator's to set.
 * DELETE /api/mobile/clerk/tasks/[id]: soft delete.
 */
export const runtime = "nodejs";

async function load(userId: string, id: string, action: "view" | "prepare" | "delete") {
  if (!isUuid(id)) throw new ClerkError(404, "That task was not found.");
  const { data: task } = await supabase().from("clerk_tasks").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!task) throw new ClerkError(404, "That task was not found.");
  const role = await requireMember(userId, task.office_id, action === "delete" ? "prepare" : action);
  if (task.matter_id) {
    const { data: m } = await supabase().from("clerk_matters").select("id, restricted").eq("id", task.matter_id).maybeSingle();
    if (m && !(await mayOpen(userId, role, m))) throw new ClerkError(404, "That task was not found.");
  }
  return { task, role };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { task } = await load(user.id, id, "view");
    const { data: events } = await supabase().from("clerk_task_events").select("status, note, actor, at").eq("task_id", id).order("at");
    const pids = [...new Set([...(events ?? []).map((e) => e.actor), task.assigned_to, task.created_by].filter(Boolean))];
    const { data: ps } = pids.length ? await supabase().from("profiles").select("id, email").in("id", pids) : { data: [] };
    return NextResponse.json({ task, events: events ?? [], people: Object.fromEntries((ps ?? []).map((p) => [p.id, p.email])) });
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { task, role } = await load(user.id, id, "prepare");
    const body = await readJson(request);
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let newStatus: string | null = null;

    if (body.status !== undefined) {
      if (!isTaskStatus(body.status)) throw new ClerkError(400, "Unknown status.");
      if (ADVOCATE_STATUSES.includes(body.status) && !can(role, "approve")) throw new ClerkError(403, `Only an advocate or the administrator can mark work "${TASK_STATUS_LABELS[body.status]}".`);
      if (body.status !== task.status) newStatus = body.status;
      update.status = body.status;
    }
    if (body.assignTo !== undefined) {
      if (body.assignTo === null || body.assignTo === "") update.assigned_to = null;
      else {
        if (!isUuid(body.assignTo) || !(await roleIn(String(body.assignTo), task.office_id))) throw new ClerkError(400, "That person is not in this office.");
        update.assigned_to = body.assignTo;
        if (task.status === "not_started" && !newStatus) {
          newStatus = "assigned";
          update.status = "assigned";
        }
      }
    }
    if (body.due !== undefined) {
      const due = body.due ? parseIndianDate(String(body.due)) : null;
      if (body.due && !due) throw new ClerkError(400, "Give the due date as DD-MM-YYYY.");
      update.due_on = due;
    }
    if (body.slot !== undefined) update.slot = isTaskSlot(body.slot) ? body.slot : null;
    if (body.title !== undefined) {
      const t = str(body.title, 300);
      if (t.length < 2) throw new ClerkError(400, "Say what the work is.");
      update.title = t;
    }
    if (body.notes !== undefined) update.notes = str(body.notes, 2000) || null;

    const { data, error } = await supabase().from("clerk_tasks").update(update).eq("id", id).select("*").single();
    if (error) throw error;
    const note = str(body.note, 500) || null;
    if (newStatus || note) await must(supabase().from("clerk_task_events").insert({ task_id: id, status: newStatus ?? task.status, note, actor: user.id }));
    await audit(task.office_id, task.matter_id, user.id, newStatus ? "task.status" : "task.updated", { task: id, title: data.title, from: task.status, to: newStatus ?? task.status, note });
    return NextResponse.json({ task: data });
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { task, role } = await load(user.id, id, "delete");
    if (task.created_by !== user.id && !can(role, "delete")) throw new ClerkError(403, "Only the person who created it or an administrator can remove a task.");
    await must(supabase().from("clerk_tasks").update({ deleted_at: new Date().toISOString() }).eq("id", id));
    await audit(task.office_id, task.matter_id, user.id, "task.deleted", { task: id, title: task.title });
    return NextResponse.json({ ok: true });
  });
}
