import { teluguFonts } from "@/lib/clerkLanguage";
import { classify, msnDocx, msnPdf, sameText } from "@/lib/msnFormat";

/**
 * A draft as a Word file or PDF in the MSN house format, for the app's
 * download and print (app/api/mobile/export) and the website's print
 * (app/api/export). Nothing is stored and no model is called. The words are
 * never changed: every character of the text is checked to be in the file
 * before it is returned. Telugu text is drawn with the shaped Telugu face.
 */

export const MAX_EXPORT_CHARS = 120_000;

export type ExportRequest = { title: string; text: string; format: "docx" | "pdf" };

/** The request body, or a message to show. */
export function readExportRequest(raw: string): ExportRequest | { error: string; status: number } {
  let body: { title?: unknown; text?: unknown; format?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return { error: "Malformed request.", status: 400 };
  }
  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) return { error: "There is nothing to download.", status: 400 };
  if (text.length > MAX_EXPORT_CHARS) return { error: "That is too long to export.", status: 413 };
  const title = (typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Shisho draft").slice(0, 120);
  return { title, text, format: body.format === "pdf" ? "pdf" : "docx" };
}

const safeName = (s: string) => s.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60) || "Shisho_draft";

/** The file as a response, or null if it could not be made without changing the text. */
export async function msnFileResponse({ title, text, format }: ExportRequest): Promise<Response | null> {
  const blocks = classify(text);
  if (!sameText(text, blocks)) return null;
  const telugu = /[ఀ-౿]/.test(text);
  const bytes = format === "pdf" ? (await msnPdf(blocks, telugu ? teluguFonts : undefined)).pdf : await msnDocx(blocks, { telugu });
  const date = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
  const name = `${safeName(title)}_${date}.${format}`;
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${name}"`,
      "x-filename": name,
      "cache-control": "no-store",
    },
  });
}
