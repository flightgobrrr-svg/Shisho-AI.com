import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { HEARING_SOURCES, parseIndianDate } from "@/lib/clerkRegisters";
import { clerkRoute, clerkUser, loadMatter, readJson, recordHearing, str, ClerkError } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/matters/[id]/hearings: the case's hearing history.
 * POST /api/mobile/clerk/matters/[id]/hearings: record one
 *      { hearingOn, result, source: "clerk_report" | "court_order", nextOn?, nextPurpose?, directions?, purpose? }
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    await loadMatter(user.id, id, "view");
    const { data } = await supabase().from("clerk_hearings").select("*").eq("matter_id", id).is("deleted_at", null).order("hearing_on", { ascending: false });
    return NextResponse.json({ hearings: data ?? [] });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request);
    const hearingOn = parseIndianDate(str(body.hearingOn, 20));
    if (!hearingOn) throw new ClerkError(400, "Give the hearing date as DD-MM-YYYY.");
    const result = str(body.result, 4000);
    if (!result) throw new ClerkError(400, "Say what happened.");
    if (!(HEARING_SOURCES as readonly string[]).includes(String(body.source))) throw new ClerkError(400, "Say whether this is the clerk's report or the court's order.");
    const nextOn = body.nextOn ? parseIndianDate(str(body.nextOn, 20)) : null;
    if (body.nextOn && !nextOn) throw new ClerkError(400, "Give the next date as DD-MM-YYYY.");
    if (nextOn && nextOn < hearingOn) throw new ClerkError(400, "The next date is before the hearing date.");
    const hid = await recordHearing(matter.office_id, id, user.id, {
      hearing_on: hearingOn,
      purpose: str(body.purpose, 300) || undefined,
      result,
      source: body.source as "clerk_report" | "court_order",
      next_on: nextOn,
      next_purpose: str(body.nextPurpose, 300),
      directions: str(body.directions, 4000),
    });
    return NextResponse.json({ id: hid }, { status: 201 });
  });
}
