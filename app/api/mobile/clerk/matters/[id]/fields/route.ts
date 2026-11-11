import { NextResponse } from "next/server";
import { isUuid } from "@/lib/mobileApi";
import { supabase } from "@/lib/supabase";
import { fieldLabel, isAmbiguousForum, isFieldKey } from "@/lib/clerkWork";
import { audit, clerkRoute, clerkUser, loadMatter, readJson, syncMatterSummary, ClerkError, must } from "@/lib/clerkStore";

/**
 * POST /api/mobile/clerk/matters/[id]/fields
 *   { action: "confirm", fieldId }            this reading is right (and becomes the value used)
 *   { action: "correct", key, value }         the right value, typed by the person ("" = not available)
 *
 * Either way the other candidates for that field stop being used, the decision
 * is stamped with who made it and when, and the history records it.
 */
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request);
    const now = new Date().toISOString();
    const db = supabase();

    if (body.action === "confirm") {
      if (!isUuid(body.fieldId)) throw new ClerkError(400, "Unknown field.");
      const { data: row } = await db.from("clerk_fields").select("id, key, value").eq("id", body.fieldId).eq("matter_id", id).maybeSingle();
      if (!row) throw new ClerkError(404, "That reading was not found.");
      await must(db.from("clerk_fields").update({ chosen: false }).eq("matter_id", id).eq("key", row.key));
      await must(db.from("clerk_fields").update({ chosen: true, status: "confirmed", decided_by: user.id, decided_at: now }).eq("id", row.id));
      await audit(matter.office_id, id, user.id, "field.confirmed", { key: row.key, value: row.value });
    } else if (body.action === "correct") {
      if (!isFieldKey(body.key)) throw new ClerkError(400, "Unknown field.");
      const value = typeof body.value === "string" ? body.value.trim().slice(0, 4000) : null;
      if (value === null) throw new ClerkError(400, "Enter the value.");
      if (body.key === "forum_type" && isAmbiguousForum(value)) {
        throw new ClerkError(400, "\"Martial Court\" is ambiguous. Enter Court-Martial or Magistrate Court.");
      }
      await must(db.from("clerk_fields").update({ chosen: false }).eq("matter_id", id).eq("key", body.key));
      const { error } = await db.from("clerk_fields").insert({ matter_id: id, key: body.key, value, status: "corrected", chosen: true, decided_by: user.id, decided_at: now });
      if (error) throw error;
      await audit(matter.office_id, id, user.id, "field.corrected", { key: body.key, label: fieldLabel(body.key), value });
    } else {
      throw new ClerkError(400, "Unknown action.");
    }
    await syncMatterSummary(id);
    return NextResponse.json({ ok: true });
  });
}
