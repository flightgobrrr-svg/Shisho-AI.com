import { NextResponse } from "next/server";
import {
  demoReply,
  isAcceptedMimeType,
  MAX_CONTEXT_DRAFT_CHARS,
  MAX_FILE_BYTES,
  MAX_HISTORY_CHARS,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  type AssistantContext,
  type AssistantResponse,
  type ChatMessage,
  type UploadedFile,
} from "@/lib/assistant";
import { fileToContentBlock } from "@/lib/assistantFiles";
import {
  assistantEntitlementFor,
  ASSISTANT_USAGE_COOKIE,
  readAssistantUsage,
} from "@/lib/assistantEntitlements";
import { DOC_TYPES, isDocType, type DocType } from "@/lib/draft";
import { PLAN_COOKIE, readPlan } from "@/lib/entitlements";

/**
 * POST /api/assistant
 *
 * Runs on the Node runtime because it holds a server-only API key — same
 * requirement as app/api/draft/route.ts, which this route sits alongside but
 * does not touch or share code with.
 *
 * ── What this is ─────────────────────────────────────────────────────────
 *   A multi-turn drafting agent: the user describes facts (optionally with
 *   an attached file) and the agent either asks for what's still missing or,
 *   once it has enough, drafts the document. It never uses tool-calling —
 *   one system prompt, resent history, structured output to tell "still
 *   asking" apart from "here is the draft."
 *
 * ── Modes ────────────────────────────────────────────────────────────────
 *   demo  — hand-written keyword matching from lib/assistant.ts. Used when
 *           SHISHO_ASSISTANT_MODE=demo, or whenever ANTHROPIC_API_KEY is
 *           absent. Independent of SHISHO_DRAFT_MODE — the reviewer and the
 *           agent can each be demo'd without affecting the other.
 *   live  — a real Claude call. See INTEGRATION POINT below.
 *
 * ── Security ─────────────────────────────────────────────────────────────
 *   • ANTHROPIC_API_KEY is shared with app/api/draft/route.ts but read
 *     independently here; it must never be prefixed NEXT_PUBLIC_.
 *   • The entitlement check runs BEFORE any model call, exactly like the
 *     reviewer's — a request that isn't entitled costs nothing.
 *   • Conversation length/size and attachment size are all capped, so a
 *     paste-bomb or a giant file cannot run up a bill.
 *   • Upstream errors are logged server-side and never echoed to the client.
 *
 * ── Quota ────────────────────────────────────────────────────────────────
 *   Its own cookie (ASSISTANT_USAGE_COOKIE), its own free allowance
 *   (lib/assistantEntitlements.ts) — deliberately separate from the
 *   reviewer's USAGE_COOKIE, so neither feature can burn the other's quota.
 */

export const runtime = "nodejs";

const MODEL = "claude-opus-5";

const DRAFTING_SYSTEM_PROMPT = `You are Shisho, a senior Indian advocate helping a junior draft a document from the facts they give you — in conversation, not a formal clause-by-clause review.

JURISDICTION — this is absolute:
- Indian law only. The Constitution of India, the CPC 1908, the CrPC/BNSS, the Indian Contract Act 1872, the Specific Relief Act 1963, the Indian Evidence Act/BSA, and other Indian statutes.
- Authorities are Supreme Court of India and High Court decisions, cited in Indian form (e.g. "Maneka Gandhi v. Union of India, (1978) 1 SCC 248").
- NEVER cite US, UK, or any foreign law, and never use US procedural vocabulary ("motion", "brief", "plaintiff's complaint"). Indian courts hear interlocutory and miscellaneous applications.

CITATIONS — this is absolute:
- Never invent a case name, citation, section number, or reported reference.
- If a point needs authority but you are not certain of the correct one, say so and leave it out. An honest gap is correct; a fabricated citation is a serious error.

GATHERING FACTS:
- Before drafting, get what you actually need: the parties, the forum/court, the key dates, the cause of action, and the relief sought. Ask for whatever is still missing rather than drafting on too little — leave "draft" null and use "reply" to say what you still need.
- If a file is attached, read it as source material (a prior notice, correspondence, evidence) and say in "reply" what you took from it. Never ignore an attachment silently.
- Once you have enough, draft. Don't hold out for perfection — a reasonable first draft the user can correct is more useful than an endless intake.

DRAFTING:
- Follow conventional Indian pleading structure: cause title, parties, numbered paragraphs, prayer, and a verification clause where the document type calls for one.
- Put the ENTIRE drafted document, and nothing else, in "draft". Do not repeat it in "reply" — "reply" is the short conversational message that goes with it (e.g. what you drafted and why, or what you're still missing).
- Choose "docType" from: plaint, notice, application, contract — whichever the document actually is. Leave both "draft" and "docType" null while still gathering facts.

TONE:
- This is drafting assistance, not legal advice, and you should say so if the user seems to be relying on you as a substitute for one.
- Keep "reply" conversational and concise — a few sentences. It is not the place to restate the draft.`;

const ASSISTANT_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "The conversational message shown in the chat.",
    },
    draft: {
      type: ["string", "null"],
      description:
        "The full drafted document, and nothing else. Null while still gathering facts.",
    },
    docType: {
      type: ["string", "null"],
      enum: [...DOC_TYPES, null],
      description: "The kind of document drafted. Null while still gathering facts.",
    },
  },
  required: ["reply", "draft", "docType"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  /* ---- Parse ---------------------------------------------------------- */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { messages, file, context } = (body ?? {}) as {
    messages?: unknown;
    file?: unknown;
    context?: unknown;
  };

  /* ---- Validate: conversation ------------------------------------------ */
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Send at least one message." },
      { status: 400 },
    );
  }

  const validMessages = messages.every(
    (m): m is ChatMessage =>
      typeof m === "object" &&
      m !== null &&
      (m as ChatMessage).role !== undefined &&
      ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
      typeof (m as ChatMessage).content === "string",
  );

  if (!validMessages) {
    return NextResponse.json(
      { error: "Malformed conversation." },
      { status: 400 },
    );
  }

  const chatMessages = messages as ChatMessage[];
  const lastMessage = chatMessages[chatMessages.length - 1];

  if (lastMessage.role !== "user") {
    return NextResponse.json(
      { error: "The last message must be from you." },
      { status: 400 },
    );
  }

  if (chatMessages.length > MAX_HISTORY_MESSAGES) {
    return NextResponse.json(
      { error: "Conversation is too long — start a new chat." },
      { status: 413 },
    );
  }

  if (chatMessages.some((m) => m.content.length > MAX_MESSAGE_CHARS)) {
    return NextResponse.json(
      {
        error: `Keep each message under ${MAX_MESSAGE_CHARS.toLocaleString("en-IN")} characters.`,
      },
      { status: 413 },
    );
  }

  const totalChars = chatMessages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_HISTORY_CHARS) {
    return NextResponse.json(
      { error: "Conversation is too long — start a new chat." },
      { status: 413 },
    );
  }

  /* ---- Validate: attachment --------------------------------------------- */
  let uploadedFile: UploadedFile | undefined;

  if (file !== undefined) {
    const candidate = file as Partial<UploadedFile>;
    if (
      typeof candidate?.filename !== "string" ||
      typeof candidate?.mimeType !== "string" ||
      typeof candidate?.dataBase64 !== "string"
    ) {
      return NextResponse.json(
        { error: "Malformed file attachment." },
        { status: 400 },
      );
    }

    if (!isAcceptedMimeType(candidate.mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Attach a .txt, .docx, .pdf, or an image." },
        { status: 400 },
      );
    }

    const decodedBytes = Buffer.from(candidate.dataBase64, "base64").length;
    if (decodedBytes > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: `Attachments are capped at ${Math.round(MAX_FILE_BYTES / 1_000_000)}MB.`,
        },
        { status: 413 },
      );
    }

    uploadedFile = candidate as UploadedFile;
  }

  /* ---- Validate: context ------------------------------------------------ */
  const rawContext = (context ?? {}) as Partial<AssistantContext>;
  const cleanContext: AssistantContext = {
    docType:
      typeof rawContext.docType === "string" && isDocType(rawContext.docType)
        ? rawContext.docType
        : undefined,
    draftExcerpt:
      typeof rawContext.draftExcerpt === "string"
        ? rawContext.draftExcerpt.slice(0, MAX_CONTEXT_DRAFT_CHARS)
        : undefined,
  };

  /* ---- Entitlement: enforced HERE, on the server ------------------------
     Same discipline as app/api/draft/route.ts: the client also renders a
     locked state, but this check is what actually withholds the output. */
  const cookiePlan = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim().split("="))
    .find(([name]) => name === PLAN_COOKIE)?.[1];

  const cookieUsage = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim().split("="))
    .find(([name]) => name === ASSISTANT_USAGE_COOKIE)?.[1];

  const plan = readPlan(cookiePlan);
  const used = readAssistantUsage(cookieUsage);
  const entitlement = assistantEntitlementFor(plan, used);

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: "You have used all five free messages this month.",
        entitlement,
      },
      { status: 402 },
    );
  }

  /* ---- Mode selection ----------------------------------------------------
     Independent of SHISHO_DRAFT_MODE — the reviewer and the agent can each
     be forced to demo without affecting the other. */
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.SHISHO_ASSISTANT_MODE === "demo";
  const useDemo = forceDemo || !apiKey;

  let payload: AssistantResponse;

  if (useDemo) {
    payload = demoReply(lastMessage.content, cleanContext, !!uploadedFile);
  } else {
    try {
      payload = await draftWithClaude(chatMessages, cleanContext, uploadedFile, apiKey!);
    } catch (error) {
      // Logged server-side only — never returned to the client.
      console.error("[api/assistant] model call failed:", error);
      return NextResponse.json(
        { error: "The assistant is unavailable. Try again shortly." },
        { status: 502 },
      );
    }
  }

  const response = NextResponse.json(payload);

  /* Count the turn against a free user's monthly trial.
     MOCK — a cookie counter resets when the visitor clears site data. Real
     metering has to live in your account store, keyed to the user. */
  if (entitlement.quota !== null) {
    response.cookies.set(ASSISTANT_USAGE_COOKIE, String(used + 1), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

/* ==========================================================================
   INTEGRATION POINT — the live model call.

   Requires ANTHROPIC_API_KEY in .env.local (never NEXT_PUBLIC_). Without it
   the route stays in demo mode and never reaches this function.
   ========================================================================== */
async function draftWithClaude(
  messages: ChatMessage[],
  context: AssistantContext,
  file: UploadedFile | undefined,
  apiKey: string,
): Promise<AssistantResponse> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const lastMessage = messages[messages.length - 1];

  let contextPrefix = "";
  if (context.docType) {
    contextPrefix += `[Context: the workspace's document type is currently set to "${context.docType}".]\n`;
  }
  if (context.draftExcerpt) {
    contextPrefix += `[Context: the current draft in the workspace reads —\n${context.draftExcerpt}\n]\n`;
  }

  const lastMessageText = contextPrefix
    ? `${contextPrefix}\n${lastMessage.content}`
    : lastMessage.content;

  let lastContent: string | Array<{ type: "text"; text: string } | Awaited<ReturnType<typeof fileToContentBlock>>> =
    lastMessageText;

  if (file) {
    const block = await fileToContentBlock(file);
    lastContent = [block, { type: "text", text: lastMessageText }];
  }

  const response = await client.messages.create({
    model: MODEL,
    // A full drafted pleading is comparably long to the reviewer's
    // annotation set — same headroom, same reason (adaptive thinking is on
    // by default for this model and shares this budget with the response).
    max_tokens: 8000,
    system: DRAFTING_SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: ASSISTANT_SCHEMA },
    },
    messages: [...history, { role: "user", content: lastContent }],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text block.");
  }

  const parsed = JSON.parse(textBlock.text) as {
    reply?: string;
    draft?: string | null;
    docType?: string | null;
  };

  const docType: DocType | null =
    typeof parsed.docType === "string" && isDocType(parsed.docType)
      ? parsed.docType
      : null;

  return {
    mode: "live",
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    draft: typeof parsed.draft === "string" ? parsed.draft : null,
    docType,
  };
}
