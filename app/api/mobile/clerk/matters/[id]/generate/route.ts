import { NextResponse } from "next/server";
import { createDocument } from "@/lib/clerkCreate";
import { clerkRoute, clerkUser, loadMatter, readJson } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/matters/[id]/generate
 *   { workNo, inputs?, uploadId?, mapping?, filingDate, language, format, documentName?, redact?, instructions?, saveTemplate? }
 *
 * Refuses until every field the service needs has been confirmed or corrected
 * and none of them is in conflict, and until the service's own required
 * answers are given. The result is saved under the case as a new version with
 * status "draft" (Draft for Advocate Review); register rows and a hearing the
 * service records are filed with it. Nothing here calls it filed, executed or
 * approved.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter, role } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request, 400_000);
    return NextResponse.json(await createDocument({ userId: user.id, role, officeId: matter.office_id, matter, body }), { status: 201 });
  });
}
