import { NextResponse } from "next/server";
import { createDocument } from "@/lib/clerkCreate";
import { clerkRoute, clerkUser, readJson, requireMember } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/offices/[id]/generate  { workNo, inputs, language, format }
 *
 * The office-wide daily sheets, which belong to no single case: cause list
 * (12), daily expense statement (22), daily court work sheet (23), office
 * closing report (24), pending work register (47) and tomorrow's preparation
 * sheet (57).
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "prepare");
    const body = await readJson(request, 100_000);
    return NextResponse.json(await createDocument({ userId: user.id, role, officeId: id, matter: null, body }), { status: 201 });
  });
}
