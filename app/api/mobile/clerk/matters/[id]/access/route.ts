import { NextResponse } from "next/server";
import { isEmail, isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { audit, clerkRoute, clerkUser, exactEmail, loadMatter, readJson, roleIn, ClerkError, must } from "@/lib/clerkStore";

/**
 * GET  /api/mobile/clerk/matters/[id]/access: whether the case is restricted, and who may see it.
 * POST /api/mobile/clerk/matters/[id]/access  { restricted?: boolean, add?: email, remove?: userId }
 *
 * A restricted case is seen only by the administrator, senior advocates and
 * the members listed here. Administrator or senior advocate only.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "view");
    const { data } = await supabase().from("clerk_matter_access").select("user_id, created_at").eq("matter_id", id);
    const ids = (data ?? []).map((a) => a.user_id);
    const { data: ps } = ids.length ? await supabase().from("profiles").select("id, email").in("id", ids) : { data: [] };
    const email = Object.fromEntries((ps ?? []).map((p) => [p.id, p.email]));
    return NextResponse.json({ restricted: matter.restricted, members: (data ?? []).map((a) => ({ userId: a.user_id, email: email[a.user_id] ?? "" })) });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter, role } = await loadMatter(user.id, id, "view");
    if (role !== "office_admin" && role !== "senior_advocate") throw new ClerkError(403, "Only the administrator or a senior advocate can change who sees a case.");
    const body = await readJson(request);
    if (typeof body.restricted === "boolean") {
      await must(supabase().from("clerk_matters").update({ restricted: body.restricted, updated_at: new Date().toISOString() }).eq("id", id));
      await audit(matter.office_id, id, user.id, body.restricted ? "matter.restricted" : "matter.unrestricted", {});
    }
    if (body.add !== undefined) {
      if (!isEmail(body.add)) throw new ClerkError(400, "Enter the member's account email.");
      const { data: p } = await supabase().from("profiles").select("id").ilike("email", exactEmail(String(body.add))).maybeSingle();
      if (!p || !(await roleIn(p.id, matter.office_id))) throw new ClerkError(404, "That person is not a member of this office.");
      await must(supabase().from("clerk_matter_access").upsert({ matter_id: id, user_id: p.id, added_by: user.id }, { onConflict: "matter_id,user_id" }));
      await audit(matter.office_id, id, user.id, "access.added", { member: p.id });
    }
    if (body.remove !== undefined) {
      if (!isUuid(body.remove)) throw new ClerkError(400, "Unknown member.");
      await must(supabase().from("clerk_matter_access").delete().eq("matter_id", id).eq("user_id", body.remove));
      await audit(matter.office_id, id, user.id, "access.removed", { member: body.remove });
    }
    return NextResponse.json({ ok: true });
  });
}
