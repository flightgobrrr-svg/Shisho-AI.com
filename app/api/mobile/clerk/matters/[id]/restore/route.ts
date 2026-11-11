import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { BUCKET, audit, clerkRoute, clerkUser, readJson, requireMember, ClerkError, must } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/matters/[id]/restore  { action?: "restore" | "purge" }
 *
 * Restore brings back a deleted case (administrator / senior advocate).
 * Purge removes a deleted case for good, with its files, and only the
 * administrator can do it, only after the office's retention period has run
 * (or at any time when the office keeps deleted cases until removed by hand).
 */
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    if (!isUuid(id)) throw new ClerkError(404, "That case was not found.");
    const body = await readJson(request).catch(() => ({}) as Record<string, unknown>);
    const { data: m } = await supabase().from("clerk_matters").select("id, office_id, serial_no, deleted_at").eq("id", id).maybeSingle();
    if (!m || !m.deleted_at) throw new ClerkError(404, "That case is not in the deleted list.");

    if (body.action === "purge") {
      await requireMember(user.id, m.office_id, "manage_members");
      const { data: office } = await supabase().from("clerk_offices").select("retention_days").eq("id", m.office_id).maybeSingle();
      const days = office?.retention_days ?? null;
      if (days !== null && Date.now() - new Date(m.deleted_at).getTime() < days * 86_400_000) {
        throw new ClerkError(409, `This office keeps deleted cases for ${days} days; this one can be removed after that.`);
      }
      // Files first, then the rows (uploads, fields, documents, tasks, hearings, entries cascade).
      const prefix = `offices/${m.office_id}/matters/${id}`;
      const paths: string[] = [];
      for (const sub of ["uploads", "documents"]) {
        const { data: items } = await must(supabase().storage.from(BUCKET).list(`${prefix}/${sub}`, { limit: 1000 }));
        for (const it of items ?? []) {
          if (it.id) paths.push(`${prefix}/${sub}/${it.name}`);
          else {
            const { data: inner } = await must(supabase().storage.from(BUCKET).list(`${prefix}/${sub}/${it.name}`, { limit: 100 }));
            for (const f of inner ?? []) paths.push(`${prefix}/${sub}/${it.name}/${f.name}`);
          }
        }
      }
      // Any failure here stops before the rows are deleted: a case whose files
      // could not all be removed stays in the deleted list, so it can be purged
      // again, rather than leaving client files in storage that nothing points to.
      if (paths.length) await must(supabase().storage.from(BUCKET).remove(paths));
      await must(supabase().from("clerk_matters").delete().eq("id", id));
      await audit(m.office_id, null, user.id, "matter.purged", { serial: m.serial_no, files: paths.length });
      return NextResponse.json({ ok: true, purged: true });
    }

    await requireMember(user.id, m.office_id, "delete");
    await must(supabase().from("clerk_matters").update({ deleted_at: null, updated_at: new Date().toISOString() }).eq("id", id));
    await audit(m.office_id, id, user.id, "matter.restored", {});
    return NextResponse.json({ ok: true });
  });
}
