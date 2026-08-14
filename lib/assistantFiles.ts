/**
 * Converts an uploaded file into an Anthropic content block.
 *
 * Isolated in its own module so the one new dependency this feature needs
 * (`mammoth`) has exactly one import site. Everything except .docx is native
 * to the Anthropic API and needs no local parsing at all:
 *
 *   - PDFs (text-based OR scanned) go over as a base64 `document` block.
 *     Claude reads PDFs natively, processing pages visually as well as
 *     textually — there is no separate OCR step to build.
 *   - Images go over as a base64 `image` block — Claude's vision reads a
 *     photo of a document directly.
 *   - Plain text is handed over as-is, as a `text/plain` document block.
 *
 * .docx is the one exception: nothing in the API ingests raw OOXML, so it is
 * extracted to plain text locally with `mammoth` before being sent as a
 * `text/plain` document block, same as a .txt file.
 */

import mammoth from "mammoth";
import type { UploadedFile } from "@/lib/assistant";

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

    case "text/plain":
      return {
        type: "document",
        source: {
          type: "text",
          media_type: "text/plain",
          data: Buffer.from(file.dataBase64, "base64").toString("utf-8"),
        },
      };

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const { value: text } = await mammoth.extractRawText({
        buffer: Buffer.from(file.dataBase64, "base64"),
      });
      return {
        type: "document",
        source: { type: "text", media_type: "text/plain", data: text },
      };
    }

    default:
      // The route validates against ACCEPTED_MIME_TYPES before this is ever
      // called — reaching here means that check was bypassed, so fail loud
      // rather than silently drop the attachment.
      throw new Error(`Unsupported file type: ${file.mimeType}`);
  }
}
