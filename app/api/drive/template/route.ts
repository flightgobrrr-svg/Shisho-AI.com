import { NextResponse } from "next/server";
import { saveDefaultTemplate } from "@/lib/driveConnection";
import { VISITOR_COOKIE } from "@/lib/usageCounters";
import { readCookie } from "@/lib/cookies";

/**
 * POST /api/drive/template
 *
 * Called once, right after Google Picker's own file-selection callback
 * fires client-side (components/draft/DriveConnect.tsx) — the visitor has
 * picked the one document they want every future draft to follow. Picker's
 * own response already carries the file's id/name/mimeType, so unlike an
 * earlier version of this route there is no separate Drive API round trip
 * here to list anything; this just persists what Picker already told the
 * client.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  const visitorId = readCookie(request.headers.get("cookie"), VISITOR_COOKIE);
  if (!visitorId) {
    return NextResponse.json({ error: "Not connected to Google Drive." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { fileId, fileName, mimeType } = (body ?? {}) as {
    fileId?: unknown;
    fileName?: unknown;
    mimeType?: unknown;
  };

  if (
    typeof fileId !== "string" ||
    !fileId ||
    typeof fileName !== "string" ||
    typeof mimeType !== "string" ||
    !mimeType
  ) {
    return NextResponse.json(
      { error: "A file id, name, and mime type are required." },
      { status: 400 },
    );
  }

  const file = {
    id: fileId,
    name: fileName.slice(0, 200),
    mimeType,
    modifiedTime: new Date().toISOString(),
  };

  try {
    await saveDefaultTemplate(visitorId, file);
    return NextResponse.json({ templateFileId: file.id, templateName: file.name, files: [file] });
  } catch (error) {
    console.error("[api/drive/template] save failed:", error);
    return NextResponse.json(
      { error: "Could not save that template. Try reconnecting Google Drive." },
      { status: 502 },
    );
  }
}
