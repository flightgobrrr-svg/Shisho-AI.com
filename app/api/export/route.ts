import { NextResponse } from "next/server";
import { readBodyText } from "@/lib/mobileApi";
import { MAX_EXPORT_CHARS, msnFileResponse, readExportRequest } from "@/lib/msnExport";

/**
 * POST /api/export  { title, text, format: "docx" | "pdf" }
 *
 * The website's print: the draft in the workspace as a PDF in the MSN house
 * format (lib/msnExport.ts), which the page opens in the browser's print
 * dialog. The same file the app downloads and prints. Nothing is stored and
 * no model is called.
 */
export const runtime = "nodejs";

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  // Only the site's own pages; another site's form cannot post here.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail(403, "Not allowed.");
  const raw = await readBodyText(request, MAX_EXPORT_CHARS * 4 + 2000);
  if (raw === null) return fail(413, "That is too long to print.");
  const req = readExportRequest(raw);
  if ("error" in req) return fail(req.status, req.error.replace("download", "print"));
  return (await msnFileResponse(req)) ?? fail(500, "The file could not be made without changing the text. Copy the draft instead.");
}
