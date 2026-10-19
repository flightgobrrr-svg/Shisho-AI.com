import { POST as draftPost } from "@/app/api/draft/route";
import { forwardToHandler } from "@/lib/mobileApi";

/** POST /api/mobile/review: clause-level review notes for the app, via /api/draft unchanged. */
export const runtime = "nodejs";

const MAX_BYTES = 1_000_000;

export function POST(request: Request) {
  return forwardToHandler(request, draftPost, "/api/draft", MAX_BYTES);
}
