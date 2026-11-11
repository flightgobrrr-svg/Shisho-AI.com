import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";
import { isCategory } from "@/lib/library";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/cases/[id] — the one place a `cases` row can move out of
 * pending_review. Re-checks the session itself (proxy.ts already gates
 * /admin/*, but this route doesn't rely on that alone — see proxy.ts's own
 * comment on why).
 *
 * Approve validates the same thing supabase/schema.sql's CHECK constraint
 * enforces server-side regardless: title, citation, court and topic must
 * all be present before a row can become 'verified'. The constraint is the
 * real backstop; this check exists so a reviewer sees why immediately
 * instead of a raw Postgres error.
 *
 * Category is stored in `tags` (schema.sql's already-provisioned, unused
 * text[] column) rather than a new one — see lib/verifiedCases.ts for why —
 * and isn't covered by the DB constraint at all, so it's validated here
 * against lib/library.ts's own CATEGORIES via isCategory. A public Library
 * page reading `tags[0]` back out is what actually enforces "must be a real
 * category," not this route: a bad value here would just silently make a
 * case invisible to every category filter, never crash anything.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const db = supabase();

  if (body.action === "reject") {
    const { error } = await db
      .from("cases")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const citation = typeof body.citation === "string" ? body.citation.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const courtId = typeof body.courtId === "string" ? body.courtId : "";
  const category = typeof body.category === "string" ? body.category : "";
  const decisionDate = typeof body.decisionDate === "string" && body.decisionDate ? body.decisionDate : null;

  if (!title || !citation || !topic || !courtId || !isCategory(category)) {
    return NextResponse.json(
      { error: "Title, citation, court, topic, and category are all required to verify a case." },
      { status: 400 },
    );
  }

  const { error } = await db
    .from("cases")
    .update({
      title,
      citation,
      court_id: courtId,
      topic,
      tags: [category],
      decision_date: decisionDate,
      status: "verified",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "admin",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
