import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { cleanEntry, isRegisterKind } from "@/lib/clerkRegisters";
import { audit, clerkRoute, clerkUser, mayOpen, readJson, requireMember, ClerkError, must } from "@/lib/clerkStore";

/**
 * PATCH  /api/mobile/clerk/entries/[id]  { data }: update a register row (whole row re-validated).
 * DELETE /api/mobile/clerk/entries/[id]: soft delete.
 */
export const runtime = "nodejs";

async function load(userId: string, id: string) {
  if (!isUuid(id)) throw new ClerkError(404, "That entry was not found.");
  const { data: e } = await supabase().from("clerk_entries").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!e || !isRegisterKind(e.kind)) throw new ClerkError(404, "That entry was not found.");
  const role = await requireMember(userId, e.office_id, "view");
  const allowed = e.kind === "expense" ? ["office_admin", "senior_advocate", "advocate", "junior_advocate", "clerk", "accounts"] : ["office_admin", "senior_advocate", "advocate", "junior_advocate", "clerk"];
  if (!allowed.includes(role)) throw new ClerkError(403, "Your role in this office does not allow that.");
  if (e.matter_id) {
    const { data: m } = await supabase().from("clerk_matters").select("id, restricted").eq("id", e.matter_id).maybeSingle();
    if (m && !(await mayOpen(userId, role, m))) throw new ClerkError(404, "That entry was not found.");
  }
  return e;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const e = await load(user.id, id);
    const body = await readJson(request, 50_000);
    const c = cleanEntry(e.kind, { ...(e.data as Record<string, unknown>), ...((body.data ?? {}) as Record<string, unknown>) });
    if (typeof c === "string") throw new ClerkError(400, c);
    const { data, error } = await supabase().from("clerk_entries").update({ data: c.data, entry_date: c.date, status: c.status, amount: c.amount, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (error) throw error;
    await audit(e.office_id, e.matter_id, user.id, "entry.updated", { entry: id, kind: e.kind, from: e.status, to: c.status });
    return NextResponse.json({ entry: data });
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const e = await load(user.id, id);
    await must(supabase().from("clerk_entries").update({ deleted_at: new Date().toISOString() }).eq("id", id));
    await audit(e.office_id, e.matter_id, user.id, "entry.deleted", { entry: id, kind: e.kind });
    return NextResponse.json({ ok: true });
  });
}
