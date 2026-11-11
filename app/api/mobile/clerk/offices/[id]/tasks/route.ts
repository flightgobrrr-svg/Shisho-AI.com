import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { DONE_STATUSES, isTaskSlot, parseIndianDate } from "@/lib/clerkRegisters";
import { getWork } from "@/lib/clerkWork";
import { audit, clerkRoute, clerkUser, hiddenMatterIds, loadMatter, readJson, requireMember, roleIn, str, ClerkError, must } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/offices/[id]/tasks?matter=&open=1&mine=1: clerk tasks.
 * POST /api/mobile/clerk/offices/[id]/tasks: a new task (status "Not Started",
 *      or "Assigned" when someone is assigned).
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const sp = new URL(request.url).searchParams;
    let q = supabase().from("clerk_tasks").select("*").eq("office_id", id).is("deleted_at", null).order("due_on", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }).limit(500);
    const matter = sp.get("matter");
    if (matter && isUuid(matter)) q = q.eq("matter_id", matter);
    if (sp.get("open") === "1") q = q.not("status", "in", `(${DONE_STATUSES.join(",")})`);
    if (sp.get("mine") === "1") q = q.eq("assigned_to", user.id);
    const { data, error } = await q;
    if (error) throw error;
    const hidden = await hiddenMatterIds(user.id, role, id);
    const tasks = (data ?? []).filter((t) => !t.matter_id || !hidden.includes(t.matter_id));
    const mids = [...new Set(tasks.map((t) => t.matter_id).filter(Boolean))];
    const pids = [...new Set(tasks.flatMap((t) => [t.assigned_to, t.created_by]).filter(Boolean))];
    const [{ data: ms }, { data: ps }] = await Promise.all([
      mids.length ? supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", mids) : Promise.resolve({ data: [] as { id: string; serial_no: number; case_label: string | null }[] }),
      pids.length ? supabase().from("profiles").select("id, email").in("id", pids) : Promise.resolve({ data: [] as { id: string; email: string }[] }),
    ]);
    return NextResponse.json({
      tasks,
      matters: Object.fromEntries((ms ?? []).map((m) => [m.id, { serial: m.serial_no, caseLabel: m.case_label }])),
      people: Object.fromEntries((ps ?? []).map((p) => [p.id, p.email])),
    });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "prepare");
    const body = await readJson(request);
    const title = str(body.title, 300);
    if (title.length < 2) throw new ClerkError(400, "Say what the work is.");
    let matterId: string | null = null;
    if (body.matterId) {
      const { matter } = await loadMatter(user.id, String(body.matterId), "prepare");
      if (matter.office_id !== id) throw new ClerkError(404, "That case was not found.");
      matterId = matter.id;
    }
    const workNo = body.workNo === undefined || body.workNo === null || body.workNo === "" ? null : Number(body.workNo);
    if (workNo !== null && !getWork(workNo)) throw new ClerkError(400, "Unknown clerk work number.");
    const due = body.due ? parseIndianDate(String(body.due)) : null;
    if (body.due && !due) throw new ClerkError(400, "Give the due date as DD-MM-YYYY.");
    let assignee: string | null = null;
    if (body.assignTo) {
      if (!isUuid(body.assignTo) || !(await roleIn(String(body.assignTo), id))) throw new ClerkError(400, "That person is not in this office.");
      assignee = String(body.assignTo);
    }
    const status = assignee ? "assigned" : "not_started";
    const { data, error } = await supabase()
      .from("clerk_tasks")
      .insert({ office_id: id, matter_id: matterId, work_no: workNo, title, notes: str(body.notes, 2000) || null, status, slot: isTaskSlot(body.slot) ? body.slot : null, due_on: due, assigned_to: assignee, created_by: user.id })
      .select("*")
      .single();
    if (error) throw error;
    await must(supabase().from("clerk_task_events").insert({ task_id: data.id, status, note: "Created", actor: user.id }));
    await audit(id, matterId, user.id, "task.created", { task: data.id, title, status, due });
    return NextResponse.json({ task: data }, { status: 201 });
  });
}
