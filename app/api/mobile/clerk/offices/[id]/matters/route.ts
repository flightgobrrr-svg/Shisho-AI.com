import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, hiddenMatterIds, readJson, requireMember, str, ClerkError } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/offices/[id]/matters?q=: the case register, searchable by
 *      case serial number, case number, CNR, party, client, advocate, court or hearing date.
 * POST /api/mobile/clerk/offices/[id]/matters: open a new matter. It gets the next
 *      case serial number in the office, which never changes afterwards.
 */
export const runtime = "nodejs";

const COLUMNS = "id, serial_no, file_code, parent_id, cause_title, case_label, court, cnr, client, advocate, next_hearing, next_hearing_on, restricted, updated_at";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 100);
    const hidden = await hiddenMatterIds(user.id, role, id);

    let query = supabase().from("clerk_matters").select(COLUMNS).eq("office_id", id).is("deleted_at", null).order("serial_no", { ascending: false }).limit(200);
    if (hidden.length) query = query.not("id", "in", `(${hidden.join(",")})`);
    if (q) {
      if (/^\d{1,6}$/.test(q)) query = query.or(`serial_no.eq.${Number(q)},case_label.ilike.%${q}%,cnr.ilike.%${q}%`);
      else {
        // PostgREST's or() takes a comma list, so the term is stripped of the characters that would break it.
        const t = q.replace(/[,()*%\\]/g, " ").trim();
        query = query.or(["cause_title", "case_label", "court", "cnr", "client", "advocate", "next_hearing", "file_code"].map((c) => `${c}.ilike.%${t}%`).join(","));
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ matters: data ?? [] });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await requireMember(user.id, id, "prepare");
    const body = await readJson(request);
    const fileCode = str(body.fileCode, 60) || null;

    let parentId: string | null = null;
    if (body.parentSerial !== undefined && body.parentSerial !== null && body.parentSerial !== "") {
      const n = Number(body.parentSerial);
      const { data: parent } = Number.isInteger(n)
        ? await supabase().from("clerk_matters").select("id").eq("office_id", id).eq("serial_no", n).is("deleted_at", null).maybeSingle()
        : { data: null };
      if (!parent) throw new ClerkError(404, "No main case has that serial number.");
      parentId = parent.id;
    }

    // Next serial in the office; a clash with a simultaneous insert retries.
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: last } = await supabase().from("clerk_matters").select("serial_no").eq("office_id", id).order("serial_no", { ascending: false }).limit(1).maybeSingle();
      const serial = (last?.serial_no ?? 0) + 1;
      const { data, error } = await supabase()
        .from("clerk_matters")
        .insert({ office_id: id, serial_no: serial, file_code: fileCode, parent_id: parentId, created_by: user.id })
        .select(COLUMNS)
        .single();
      if (!error) {
        await audit(id, data.id, user.id, "matter.created", { serial, fileCode, parentId });
        return NextResponse.json({ matter: data }, { status: 201 });
      }
      if (error.code !== "23505") throw error;
    }
    throw new ClerkError(409, "Could not number the case; try again.");
  });
}
