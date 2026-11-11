import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { parseIndianDate } from "@/lib/clerkRegisters";
import { applyHearing, audit, clerkRoute, clerkUser, loadMatter, readJson, str, ClerkError, must } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/hearings/[id]  { action: "confirm", result?, nextOn?, nextPurpose?, directions? }
 *
 * Confirms a clerk's report against the court's order. The confirmed values
 * (corrected if the order says otherwise) then become the case's next date
 * and directions. The original report is kept as it was entered.
 */
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    if (!isUuid(id)) throw new ClerkError(404, "That hearing was not found.");
    const { data: h } = await supabase().from("clerk_hearings").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (!h) throw new ClerkError(404, "That hearing was not found.");
    const { matter } = await loadMatter(user.id, h.matter_id, "prepare");
    const body = await readJson(request);
    if (body.action !== "confirm") throw new ClerkError(400, "Unknown action.");
    if (h.confirmed_at) throw new ClerkError(409, "Already confirmed.");
    const nextOn = body.nextOn !== undefined ? (body.nextOn ? parseIndianDate(str(body.nextOn, 20)) : null) : h.next_on;
    if (body.nextOn && !nextOn) throw new ClerkError(400, "Give the next date as DD-MM-YYYY.");
    const result = str(body.result, 4000) || h.result;
    const nextPurpose = body.nextPurpose !== undefined ? str(body.nextPurpose, 300) : h.next_purpose;
    const directions = body.directions !== undefined ? str(body.directions, 4000) : h.directions;
    const changed = result !== h.result || nextOn !== h.next_on || nextPurpose !== h.next_purpose || directions !== h.directions;

    // The confirmation is a court-order entry of its own; the report stays as entered.
    await must(supabase().from("clerk_hearings").update({ confirmed_by: user.id, confirmed_at: new Date().toISOString() }).eq("id", id));
    if (changed) {
      await must(supabase().from("clerk_hearings").insert({ office_id: h.office_id, matter_id: h.matter_id, hearing_on: h.hearing_on, purpose: h.purpose, result, source: "court_order", next_on: nextOn, next_purpose: nextPurpose, directions, entered_by: user.id, confirmed_by: user.id, confirmed_at: new Date().toISOString() }));
    }
    await applyHearing(h.matter_id, user.id, { hearing_on: h.hearing_on, result, next_on: nextOn, next_purpose: nextPurpose, directions });
    await audit(matter.office_id, matter.id, user.id, "hearing.confirmed", { hearing: id, corrected: changed, next: nextOn });
    return NextResponse.json({ ok: true, corrected: changed });
  });
}
