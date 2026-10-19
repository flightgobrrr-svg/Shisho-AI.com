import { POST as assistantPost } from "@/app/api/assistant/route";
import { forwardToHandler } from "@/lib/mobileApi";

/**
 * POST /api/mobile/assistant: Shisho's drafting chat for the app. The body is
 * the same as /api/assistant's; the work (model call, plan, quota) is done by
 * that handler, unchanged. See lib/mobileApi.ts forwardToHandler.
 */
export const runtime = "nodejs";

// ~15 MB of file plus base64 overhead and the conversation.
const MAX_BYTES = 24_000_000;

export function POST(request: Request) {
  return forwardToHandler(request, assistantPost, "/api/assistant", MAX_BYTES);
}
