/**
 * Converts an uploaded file into a content block for whichever model
 * provider is live — Anthropic (`fileToContentBlock`) or Gemini
 * (`fileToGeminiPart`), see app/api/assistant/route.ts.
 *
 * Isolated in its own module so the one new dependency this feature needs
 * (`mammoth`) has exactly one import site. Everything except .docx is native
 * to both APIs and needs no local parsing at all:
 *
 *   - PDFs (text-based OR scanned) go over as base64. Both Claude and Gemini
 *     read PDFs natively, processing pages visually as well as textually —
 *     there is no separate OCR step to build.
 *   - Images go over as base64 — both models' vision reads a photo of a
 *     document directly.
 *   - Plain text is handed over as-is.
 *
 * .docx is the one exception: neither API ingests raw OOXML, so it is
 * extracted to plain text locally with `mammoth` before being sent, same as
 * a .txt file. `extractTextIfNeeded` is the one place that decode happens,
 * shared by both provider-specific functions below.
 */

import mammoth from "mammoth";
import type { UploadedFile } from "@/lib/assistant";

/** Plain text for .txt/.docx, `undefined` for PDFs/images (sent as bytes
 *  instead — see the two functions below). */
async function extractTextIfNeeded(file: UploadedFile): Promise<string | undefined> {
  if (file.mimeType === "text/plain") {
    return Buffer.from(file.dataBase64, "base64").toString("utf-8");
  }
  if (
    file.mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value: text } = await mammoth.extractRawText({
      buffer: Buffer.from(file.dataBase64, "base64"),
    });
    return text;
  }
  return undefined;
}

export type FileContentBlock =
  | {
      type: "document";
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
      };
    }
  | {
      type: "document";
      source: { type: "text"; media_type: "text/plain"; data: string };
    };

export async function fileToContentBlock(
  file: UploadedFile,
): Promise<FileContentBlock> {
  const extractedText = await extractTextIfNeeded(file);
  if (extractedText !== undefined) {
    return {
      type: "document",
      source: { type: "text", media_type: "text/plain", data: extractedText },
    };
  }

  switch (file.mimeType) {
    case "application/pdf":
      return {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: file.dataBase64 },
      };

    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
      return {
        type: "image",
        source: { type: "base64", media_type: file.mimeType, data: file.dataBase64 },
      };

    default:
      // The route validates against ACCEPTED_MIME_TYPES before this is ever
      // called — reaching here means that check was bypassed, so fail loud
      // rather than silently drop the attachment.
      throw new Error(`Unsupported file type: ${file.mimeType}`);
  }
}

/** Gemini's `generateContent` Part shape — a text part for .txt/.docx
 *  (extracted the same way as the Anthropic path above), an `inlineData`
 *  part of raw base64 for PDFs/images, which Gemini reads natively. */
export type GeminiPart =
  | { text: string }
  | {
      inlineData: {
        mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
      };
    };

export async function fileToGeminiPart(file: UploadedFile): Promise<GeminiPart> {
  const extractedText = await extractTextIfNeeded(file);
  if (extractedText !== undefined) {
    return { text: extractedText };
  }

  switch (file.mimeType) {
    case "application/pdf":
      return { inlineData: { mimeType: "application/pdf", data: file.dataBase64 } };

    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
      return { inlineData: { mimeType: file.mimeType, data: file.dataBase64 } };

    default:
      throw new Error(`Unsupported file type: ${file.mimeType}`);
  }
}
