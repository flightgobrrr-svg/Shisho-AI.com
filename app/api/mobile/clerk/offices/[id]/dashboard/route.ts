import { NextResponse } from "next/server";
import { parseIndianDate } from "@/lib/clerkRegisters";
import { dashboard } from "@/lib/clerkOffice";
import { clerkRoute, clerkUser, requireMember } from "@/lib/clerkStore";

/** GET /api/mobile/clerk/offices/[id]/dashboard?date=YYYY-MM-DD: the Daily Clerk Dashboard. */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const role = await requireMember(user.id, id, "view");
    const date = parseIndianDate(new URL(request.url).searchParams.get("date")) ?? undefined;
    return NextResponse.json({ dashboard: await dashboard(id, user.id, role, date), role });
  });
}
