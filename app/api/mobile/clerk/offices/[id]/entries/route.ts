import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { cleanEntry, isRegisterKind } from "@/lib/clerkRegisters";
import { audit, clerkRoute, clerkUser, hiddenMatterIds, loadMatter, readJson, requireMember, ClerkError } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/offices/[id]/entries?kind=&matter=: a register, office-wide or for one case.
 * POST /api/mobile/clerk/offices/[id]/entries  { kind, matterId?, data }: a new row.
 * Expenses are the accounts user's work too; every other register needs a preparing role.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const sp = new URL(request.url).searchParams;
    const kind = sp.get("kind");
    if (!isRegisterKind(kind)) throw new ClerkError(400, "Unknown register.");
    let q = supabase().from("clerk_entries").select("*").eq("office_id", id).eq("kind", kind).is("deleted_at", null).order("entry_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(500);
    const matter = sp.get("matter");
    if (matter) {
      if (!isUuid(matter)) throw new ClerkError(404, "That case was not found.");
      await loadMatter(user.id, matter, "view");
      q = q.eq("matter_id", matter);
    }
    const { data, error } = await q;
    if (error) throw error;
    const hidden = await hiddenMatterIds(user.id, role, id);
    const rows = (data ?? []).filter((e) => !e.matter_id || !hidden.includes(e.matter_id));
    const mids = [...new Set(rows.map((e) => e.matter_id).filter(Boolean))];
    const { data: ms } = mids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", mids) : { data: [] };
    return NextResponse.json({ entries: rows, matters: Object.fromEntries((ms ?? []).map((m) => [m.id, { serial: m.serial_no, caseLabel: m.case_label }])) });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const body = await readJson(request, 50_000);
    if (!isRegisterKind(body.kind)) throw new ClerkError(400, "Unknown register.");
    const role = await requireMember(user.id, id, "view");
    const allowed = body.kind === "expense" ? ["office_admin", "senior_advocate", "advocate", "junior_advocate", "clerk", "accounts"] : ["office_admin", "senior_advocate", "advocate", "junior_advocate", "clerk"];
    if (!allowed.includes(role)) throw new ClerkError(403, "Your role in this office does not allow that.");
    let matterId: string | null = null;
    if (body.matterId) {
      const { matter } = await loadMatter(user.id, String(body.matterId), "view");
      if (matter.office_id !== id) throw new ClerkError(404, "That case was not found.");
      matterId = matter.id;
    }
    const c = cleanEntry(body.kind, (body.data ?? {}) as Record<string, unknown>);
    if (typeof c === "string") throw new ClerkError(400, c);
    const { data, error } = await supabase()
      .from("clerk_entries")
      .insert({ office_id: id, matter_id: matterId, kind: body.kind, entry_date: c.date, status: c.status, amount: c.amount, data: c.data, created_by: user.id })
      .select("*")
      .single();
    if (error) throw error;
    await audit(id, matterId, user.id, "entry.created", { entry: data.id, kind: body.kind, status: c.status });
    return NextResponse.json({ entry: data }, { status: 201 });
  });
}
