import { NextResponse } from "next/server";
import { MAX_FILE_BYTES, isAcceptedMimeType, type UploadedFile } from "@/lib/assistant";
import { runTool } from "@/lib/aiTools";
import { COURSES } from "@/lib/courses";
import { isTrialPlan, type Plan } from "@/lib/entitlements";
import { authClient, bearerToken, deviceId, mobileError, readBodyText } from "@/lib/mobileApi";
import { getUserPlan } from "@/lib/profile";
import { consumeUsage, isSupabaseConfigured, refundUsage } from "@/lib/usageCounters";
import {
  ANSWER_LANGUAGES,
  FREE_MONTHLY_TOOL_RUNS,
  LESSON_LEVELS,
  LESSON_MINUTES,
  MAX_TOOL_TEXT_CHARS,
  isToolId,
  type ToolId,
  type ToolInput,
} from "@/lib/toolTypes";

/**
 * POST /api/mobile/tools/[tool]: runs one of the app's Shisho tools
 * (lib/toolTypes.ts). The plan and the trial allowance are checked HERE,
 * before any model call, the same discipline as the drafting routes:
 * Free and Basic get FREE_MONTHLY_TOOL_RUNS runs per rolling 30 days across
 * every tool, keyed by the account when signed in and the device otherwise.
 */
export const runtime = "nodejs";

// ~15 MB of file plus base64 overhead and the text.
const MAX_BYTES = 24_000_000;

type Body = Record<string, unknown>;

function parseFile(v: unknown): UploadedFile | "bad" | undefined {
  if (v === undefined || v === null) return undefined;
  const f = v as Partial<UploadedFile>;
  if (typeof f.filename !== "string" || typeof f.mimeType !== "string" || typeof f.dataBase64 !== "string") return "bad";
  if (!isAcceptedMimeType(f.mimeType)) return "bad";
  if (Buffer.from(f.dataBase64, "base64").length > MAX_FILE_BYTES) return "bad";
  return { filename: f.filename.slice(0, 200), mimeType: f.mimeType, dataBase64: f.dataBase64 };
}

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** The tool's own input, or an error message for the person. */
function parseInput(tool: ToolId, body: Body, file: UploadedFile | undefined): ToolInput[ToolId] | string {
  const t = text(body.text);
  if (t.length > MAX_TOOL_TEXT_CHARS) return `Keep it under ${MAX_TOOL_TEXT_CHARS.toLocaleString("en-IN")} characters, or attach the file instead.`;
  switch (tool) {
    case "contract-review":
      if (!t && !file) return "Paste the contract or attach it.";
      return { text: t || undefined, actingFor: text(body.actingFor).slice(0, 200) || undefined };
    case "case-record":
      if (!t && !file) return "Paste the case papers or attach them.";
      return { text: t || undefined };
    case "plain-answer": {
      if (!t && !file) return "Type your question, or attach the notice.";
      const language = body.language === "hi" ? "hi" : "en";
      return { text: t || undefined, language: language as keyof typeof ANSWER_LANGUAGES };
    }
    case "lesson-plan": {
      const topic = text(body.topic).slice(0, 300);
      if (topic.length < 3) return "Name the topic for the class.";
      const level = LESSON_LEVELS.find((l) => l === body.level) ?? LESSON_LEVELS[0];
      const minutes = LESSON_MINUTES.find((m) => m === body.minutes) ?? 60;
      return { topic, level, minutes };
    }
    case "exam-revision": {
      const course = COURSES.find((c) => c.id === body.courseId);
      const moduleIndex = typeof body.module === "number" ? body.module : -1;
      if (!course || !Number.isInteger(moduleIndex) || moduleIndex < 0 || moduleIndex >= course.syllabus.length) return "Pick a course module.";
      return { courseId: course.id, module: moduleIndex };
    }
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (!isToolId(tool)) return mobileError(404, "That tool does not exist.");

  const raw = await readBodyText(request, MAX_BYTES);
  if (raw === null) return mobileError(413, "That is too large to send.");
  let body: Body;
  try {
    body = (JSON.parse(raw) ?? {}) as Body;
  } catch {
    return mobileError(400, "Malformed request.");
  }

  const file = parseFile(body.file);
  if (file === "bad") {
    return mobileError(400, `Attach a PDF, Word (.docx), text or image file under ${Math.round(MAX_FILE_BYTES / 1_000_000)} MB.`);
  }
  if (file && (tool === "lesson-plan" || tool === "exam-revision")) return mobileError(400, "This tool does not take a file.");
  const input = parseInput(tool, body, file);
  if (typeof input === "string") return mobileError(400, input);

  /* ---- Plan and allowance ---- */
  let plan: Plan = "free";
  let visitor: string | null = deviceId(request);
  const token = bearerToken(request);
  if (token) {
    const client = authClient();
    const { data, error } = client ? await client.auth.getUser(token) : { data: null, error: true };
    if (error || !data?.user) return mobileError(401, "Your session has ended. Sign in again.");
    visitor = data.user.id;
    if (isSupabaseConfigured()) plan = await getUserPlan(data.user.id);
  }
  if (!visitor) return mobileError(400, "Update the app and try again.");

  const trial = isTrialPlan(plan);
  // Without Supabase there is nowhere to count, so the trial cannot be enforced
  // (the same fail-open stance as lib/usageCounters.ts).
  const counting = trial && isSupabaseConfigured();
  // Take the use before the model call, in one atomic step, so parallel
  // requests cannot all pass the limit; it is given back below if the run
  // ends without a real answer.
  const consumed = counting ? await consumeUsage(visitor, "tool", FREE_MONTHLY_TOOL_RUNS) : null;
  if (consumed && !consumed.allowed) {
    return NextResponse.json(
      { error: `You have used all ${FREE_MONTHLY_TOOL_RUNS} free tool runs this month. Core, Proficient and the Shisho plan have no limit.`, remaining: 0 },
      { status: 402 },
    );
  }

  let outcome;
  try {
    outcome = await runTool(tool, input as never, file);
  } catch (error) {
    console.error(`[api/mobile/tools/${tool}] model call failed:`, error);
    if (consumed) await refundUsage(visitor, "tool");
    return mobileError(502, "Shisho could not finish that. Try again shortly.");
  }

  // Only a real answer spends the allowance.
  if (consumed && outcome.mode !== "live") await refundUsage(visitor, "tool");
  const remaining = !trial
    ? null
    : consumed
      ? consumed.remaining + (outcome.mode === "live" ? 0 : 1)
      : FREE_MONTHLY_TOOL_RUNS;

  return NextResponse.json({ tool, mode: outcome.mode, output: outcome.output, remaining });
}
