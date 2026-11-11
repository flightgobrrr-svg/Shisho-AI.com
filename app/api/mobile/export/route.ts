import { deviceId, mobileError, readBodyText } from "@/lib/mobileApi";
import { MAX_EXPORT_CHARS, msnFileResponse, readExportRequest } from "@/lib/msnExport";

/**
 * POST /api/mobile/export  { title, text, format: "docx" | "pdf" }
 *
 * A Shisho draft or review notes the person already has on screen, as a Word
 * file or PDF in the MSN house format (lib/msnExport.ts), to save, send or
 * print. The title names the file only.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!deviceId(request)) return mobileError(400, "Update the app and try again.");
  const raw = await readBodyText(request, MAX_EXPORT_CHARS * 4 + 2000);
  if (raw === null) return mobileError(413, "That is too long to export.");
  const req = readExportRequest(raw);
  if ("error" in req) return mobileError(req.status, req.error);
  return (await msnFileResponse(req)) ?? mobileError(500, "The file could not be made without changing the text. Copy the draft instead.");
}
