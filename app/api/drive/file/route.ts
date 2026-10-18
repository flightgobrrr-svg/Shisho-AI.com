import { NextResponse } from "next/server";
import { fetchFileContent } from "@/lib/googleDrive";
import { getConnection } from "@/lib/driveConnection";
import { VISITOR_COOKIE } from "@/lib/usageCounters";
import { readCookie } from "@/lib/cookies";
import { MAX_FILE_BYTES } from "@/lib/assistant";

/**
 * POST /api/drive/file
 *
 * Fetches one template's content, in the exact {filename, mimeType,
 * dataBase64} shape a manually-uploaded chat attachment already arrives in
 * (lib/assistant.ts's UploadedFile) — so the client can hand this straight
 * back to /api/assistant as `body.file`, completely unmodified.
 *
 * Only `fileId` is accepted from the client; the mimeType used to decide
 * export-vs-download comes from the SERVER's own cached file list, not
 * whatever the client claims — the same "re-validate what the client also
 * sent" discipline app/api/assistant/route.ts already applies to `docType`.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  const visitorId = readCookie(request.headers.get("cookie"), VISITOR_COOKIE);
  if (!visitorId) {
    return NextResponse.json({ error: "Not connected to Google Drive." }, { status: 401 });
  }

  const connection = await getConnection(visitorId);
  if (!connection) {
    return NextResponse.json({ error: "Not connected to Google Drive." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { fileId } = (body ?? {}) as { fileId?: unknown };
  if (typeof fileId !== "string" || !fileId) {
    return NextResponse.json({ error: "A file id is required." }, { status: 400 });
  }

  const file = connection.files.find((f) => f.id === fileId);
  if (!file) {
    return NextResponse.json(
      { error: "That template isn't in your connected folder anymore. Reopen the folder picker and try again." },
      { status: 404 },
    );
  }

  try {
    const { dataBase64, mimeType } = await fetchFileContent(connection.refreshToken, fileId, file.mimeType);

    const decodedBytes = Buffer.from(dataBase64, "base64").length;
    if (decodedBytes > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `That template is too large to use as an attachment (over ${Math.round(MAX_FILE_BYTES / 1_000_000)}MB).` },
        { status: 413 },
      );
    }

    return NextResponse.json({ filename: file.name, mimeType, dataBase64 });
  } catch (error) {
    console.error("[api/drive/file] fetch failed:", error);
    return NextResponse.json(
      { error: "Could not read that file from Google Drive. Try reconnecting." },
      { status: 502 },
    );
  }
}
