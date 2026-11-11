import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BUCKET, audit, clerkRoute, clerkUser, loadMatter, must, putFile, readJson, sha256, str, ClerkError } from "@/lib/clerkStore";
import { ACCEPTED, MAX_UPLOAD_BYTES, pageCount, runExtraction } from "@/lib/clerkIntake";

/**
 * POST /api/mobile/clerk/matters/[id]/uploads
 *   { kind: "case_data" | "blank_form", file: { filename, mimeType, dataBase64 } }
 *
 * Stores the file unchanged in the private bucket. A case-data file is then
 * read for particulars; a blank form is analysed later, when a service is
 * chosen. If reading fails the upload stays, marked failed, for a retry.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return clerkRoute(async () => {
    const { id } = await params;
    const user = await clerkUser(request);
    const { matter } = await loadMatter(user.id, id, "prepare");
    const body = await readJson(request, 22_000_000);

    const kind = body.kind === "blank_form" ? "blank_form" : body.kind === "case_data" ? "case_data" : null;
    if (!kind) throw new ClerkError(400, "Say whether this is the case papers or a blank form.");
    const f = (body.file ?? {}) as Record<string, unknown>;
    const mimeType = str(f.mimeType, 100);
    const filename = str(f.filename, 200).replace(/[\\/]/g, "_") || "upload";
    if (!(ACCEPTED as readonly string[]).includes(mimeType) || (kind === "blank_form" && mimeType !== "application/pdf")) {
      throw new ClerkError(400, kind === "blank_form" ? "A blank form must be a PDF." : "Upload a PDF or a photo (JPG, PNG, WebP).");
    }
    if (typeof f.dataBase64 !== "string") throw new ClerkError(400, "The file is missing.");
    const buf = Buffer.from(f.dataBase64, "base64");
    if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES) throw new ClerkError(413, "Keep the file under 15 MB.");
    if (mimeType === "application/pdf" && buf.subarray(0, 5).toString() !== "%PDF-") throw new ClerkError(400, "That file is not a PDF.");

    const pages = await pageCount(buf, mimeType);
    if (mimeType === "application/pdf" && pages === null) throw new ClerkError(400, "That PDF could not be opened. If it is password-protected, remove the password first.");
    if (pages !== null && pages > 300) throw new ClerkError(413, "Split documents over 300 pages before uploading.");

    const { data: upload, error } = await supabase()
      .from("clerk_uploads")
      .insert({
        office_id: matter.office_id,
        matter_id: id,
        kind,
        filename,
        mime_type: mimeType,
        bytes: buf.length,
        sha256: sha256(buf),
        storage_path: "pending",
        pages,
        uploaded_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    const path = `offices/${matter.office_id}/matters/${id}/uploads/${upload.id}`;
    try {
      await putFile(path, buf, mimeType);
      await must(supabase().from("clerk_uploads").update({ storage_path: path }).eq("id", upload.id));
    } catch (e) {
      // Do not leave a row whose file is missing or whose path still reads "pending".
      await supabase().storage.from(BUCKET).remove([path]);
      await supabase().from("clerk_uploads").delete().eq("id", upload.id);
      throw e;
    }
    await audit(matter.office_id, id, user.id, "upload.stored", { upload: upload.id, kind, filename, pages });

    let reading = null;
    let readError: string | null = null;
    if (kind === "case_data") {
      try {
        reading = await runExtraction({ uploadId: upload.id, officeId: matter.office_id, matterId: id, userId: user.id, mimeType, buf, pages, filename });
      } catch (e) {
        // The file is kept either way; the app shows the reason and a retry.
        if (!(e instanceof ClerkError)) throw e;
        readError = e.message;
      }
    }
    return NextResponse.json({ upload: { id: upload.id, kind, filename, pages }, reading, readError }, { status: 201 });
  });
}
