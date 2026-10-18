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
import { fileToContentBlock, fileToGeminiPart } from "@/lib/assistantFiles";
import {
  assistantEntitlementFor,
  ASSISTANT_USAGE_COOKIE,
  readAssistantUsage,
} from "@/lib/assistantEntitlements";
import { DOC_TYPES, isDocType, type DocType } from "@/lib/draft";
import { PLAN_COOKIE, readPlan, type Plan } from "@/lib/entitlements";
import {
  incrementUsageCount,
  isSupabaseConfigured,
  readUsageCount,
  readVisitorId,
  VISITOR_COOKIE,
} from "@/lib/usageCounters";
import { getSessionUser } from "@/lib/authSession";
import { getUserPlan } from "@/lib/profile";

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
 *           SHISHO_ASSISTANT_MODE=demo, or whenever neither GEMINI_API_KEY
 *           nor ANTHROPIC_API_KEY is set. Independent of SHISHO_DRAFT_MODE —
 *           the reviewer and the agent can each be demo'd without affecting
 *           the other.
 *   live  — a real model call: Gemini if GEMINI_API_KEY is set (Google AI
 *           Studio's free tier — the default path, since it costs nothing to
 *           turn on), otherwise Claude if ANTHROPIC_API_KEY is set instead.
 *           See INTEGRATION POINT below for both.
 *
 * ── Security ─────────────────────────────────────────────────────────────
 *   • GEMINI_API_KEY / ANTHROPIC_API_KEY are read independently of
 *     app/api/draft/route.ts's own copy; neither must ever be prefixed
 *     NEXT_PUBLIC_.
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

const CLAUDE_MODEL = "claude-opus-5";

/** Google AI Studio's free tier, live-tested this session against the real
 *  API — twice now. `gemini-3.7-flash` (the newest Flash model) returned
 *  503 "high demand" on every attempt; `gemini-2.5-flash` 404s outright —
 *  Google's own error for it says it's retired for new API keys and points
 *  at 3.6. `gemini-3.6-flash` DID complete real drafting requests, but its
 *  free-tier daily quota turned out to be only 20 requests/day on this
 *  project — confirmed via a real 429 ("GenerateRequestsPerDayPerProjectPer
 *  Model-FreeTier", limit: 20), nowhere documented in advance since Google
 *  doesn't publish per-model free-tier numbers (only shows them in your own
 *  AI Studio dashboard). `gemini-3.5-flash` is a separate quota bucket,
 *  confirmed still available when 3.6's was exhausted. Swap this one
 *  constant again if 3.5's own daily quota turns out to be similarly tight
 *  under real traffic, or once 3.7 stops being overloaded — check current
 *  availability AND quota before assuming any of these is still right,
 *  same lesson twice now. */
const GEMINI_MODEL = "gemini-3.5-flash";

const DRAFTING_SYSTEM_PROMPT = `You are Shisho, a senior Indian advocate helping a junior draft a document from the facts they give you — in conversation, not a formal clause-by-clause review.

JURISDICTION — this is absolute:
- Indian law only. The Constitution of India, the CPC 1908, the CrPC/BNSS, the Indian Contract Act 1872, the Specific Relief Act 1963, the Indian Evidence Act/BSA, and other Indian statutes.
- Authorities are Supreme Court of India and High Court decisions, cited in Indian form (e.g. "Maneka Gandhi v. Union of India, (1978) 1 SCC 248").
- NEVER cite US, UK, or any foreign law, and never use US procedural vocabulary ("motion", "brief", "plaintiff's complaint"). Indian courts hear interlocutory and miscellaneous applications.

CITATIONS — this is absolute:
- Never invent a case name, citation, section number, or reported reference.
- If a point needs authority but you are not certain of the correct one, say so and leave it out. An honest gap is correct; a fabricated citation is a serious error.

GATHERING FACTS — treat this as a checklist, not a suggestion:
- Full names of every party (not just their role), the forum/court, the complete chronology of key dates, the cause of action, and the relief sought. Ask for whatever is still missing rather than drafting on too little — leave "draft" null and use "reply" to say what you still need.
- Always establish the limitation position before drafting anything time-sensitive (a plaint, a notice, an appeal, an application with a deadline): when the cause of action arose, and when the limitation period runs from. If the facts given don't fix this, ask before drafting — never silently assume a safe date.
- If a file is attached, work out what it's for before using it. It may be factual source material (a prior notice, correspondence, evidence) — or it may be a template: an example of the user's own house style, clause ordering, or formatting that the new draft should follow. When the user's message calls it a template, format, or precedent (or the message is otherwise clearly about matching a style rather than establishing facts), mirror its structure, section headings, and formatting conventions in "draft", not just its facts. Say in "reply" what you took from it either way. Never ignore an attachment silently.
- Once you have enough, draft. Don't hold out for perfection — a reasonable first draft the user can correct is more useful than an endless intake.

DRAFTING:
- Follow conventional Indian pleading structure: cause title, parties, numbered paragraphs, prayer, and a verification clause where the document type calls for one.
- Put the ENTIRE drafted document, and nothing else, in "draft". Do not repeat it in "reply" — "reply" is the short conversational message that goes with it (e.g. what you drafted and why, or what you're still missing).
- Choose "docType" from: plaint, notice, application, contract — whichever the document actually is. Leave both "draft" and "docType" null while still gathering facts.

FLAGS — raise these plainly in "reply" rather than drafting past them:
- If the facts as given suggest the limitation period may already have run, say so before drafting — this is exactly the kind of thing a senior stops a junior on before it goes anywhere near filing, not something to draft around quietly.
- Where a provision you'd otherwise cite (IPC, CrPC, Indian Evidence Act) was replaced effective 1 July 2024 by the Bharatiya Nyaya Sanhita / Bharatiya Nagarik Suraksha Sanhita / Bharatiya Sakshya Adhiniyam, cite the current provision and note the correspondence — e.g. "Section 103 BNS (formerly Section 302 IPC)" — rather than citing only the repealed one.

HEARING PREP — when the user asks you to prepare them for a hearing, argument or cross-examination rather than to draft a document:
- Leave "draft" and "docType" null and put the whole preparation note in "reply". This is the one case where "reply" may run long; keep it structured with plain headings, no emoji.
- Use these headings: Issues; Points to establish; Likely questions from the bench; Provisions to check; Authorities.
- Under "Authorities", list a case ONLY if the user supplied it or you are certain of the name and citation. Otherwise write "Authority to be verified" beside the point it would support. Never fill the gap with a plausible-sounding case.
- Ask for the facts, stage of the case and the forum first if they are missing, as you would before drafting.

TONE — formal throughout, not a casual chat assistant:
- This is drafting assistance, not legal advice, and you should say so if the user seems to be relying on you as a substitute for one.
- Write "reply" the way a senior advocate would address a junior in professional correspondence: formal register, no emoji, no exclamation marks, no chatty filler ("Great!", "Sure thing!", "Happy to help!"). Concise is still correct — a few sentences — but every sentence should read as legal correspondence, not a chat app. It is not the place to restate the draft.`;

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

/** Gemini's `responseSchema` is proto-backed, not full JSON Schema — it
 *  rejects ASSISTANT_SCHEMA's `"type": ["string", "null"]` outright ("Proto
 *  field is not repeating, cannot start list", confirmed against the real
 *  API this session, contrary to what Google's own docs describe). A single
 *  `type` plus a separate `nullable: true` is what it actually accepts, and
 *  `additionalProperties` isn't a recognized field either. Kept in sync with
 *  ASSISTANT_SCHEMA by hand since the two schema dialects can't share one
 *  object. */
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "The conversational message shown in the chat.",
    },
    draft: {
      type: "string",
      nullable: true,
      description:
        "The full drafted document, and nothing else. Null while still gathering facts.",
    },
    docType: {
      type: "string",
      nullable: true,
      enum: [...DOC_TYPES],
      description: "The kind of document drafted. Null while still gathering facts.",
    },
  },
  required: ["reply", "draft", "docType"],
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
    // Only meaningful alongside an actual `file` this turn — ignored below
    // (draftWithClaude) when uploadedFile is absent, so a client sending
    // this without a file can't inject the instruction without anything to
    // apply it to.
    isDefaultTemplate: rawContext.isDefaultTemplate === true,
  };

  /* ---- Entitlement: enforced HERE, on the server ------------------------
     Same discipline as app/api/draft/route.ts: the client also renders a
     locked state, but this check is what actually withholds the output.
     Usage comes from Supabase once configured, cookie count otherwise —
     see lib/usageCounters.ts. This quota ("assistant") and the reviewer's
     ("review") are separate rows, same visitor id — mirrors the two
     cookies staying independent today. */
  const cookieHeader = request.headers.get("cookie");
  const findCookie = (name: string) =>
    cookieHeader
      ?.split(";")
      .map((c) => c.trim().split("="))
      .find(([n]) => n === name)?.[1];

  /* A logged-in visitor (lib/authSession.ts) is a third, higher-priority
     source, same as app/api/draft/route.ts: plan comes from the profiles
     table (lib/profile.ts), usage is keyed by their real account id instead
     of the anonymous cookie-random one. A visitor who never registers sees
     no change at all. */
  const { user: authUser, applyPendingCookies } = await getSessionUser(cookieHeader);
  const useSupabase = isSupabaseConfigured();

  let plan: Plan;
  let visitorId: string | null;

  if (authUser && useSupabase) {
    plan = await getUserPlan(authUser.id);
    visitorId = authUser.id;
  } else {
    plan = readPlan(findCookie(PLAN_COOKIE));
    visitorId = useSupabase ? readVisitorId(findCookie(VISITOR_COOKIE)) : null;
  }

  const used = useSupabase
    ? await readUsageCount(visitorId!, "assistant")
    : readAssistantUsage(findCookie(ASSISTANT_USAGE_COOKIE));

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
     be forced to demo without affecting the other. Gemini is tried first
     when both keys are present, since it's the free path — set only
     ANTHROPIC_API_KEY to keep using Claude instead. */
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.SHISHO_ASSISTANT_MODE === "demo";
  const useDemo = forceDemo || (!geminiApiKey && !anthropicApiKey);

  let payload: AssistantResponse;

  if (useDemo) {
    payload = demoReply(lastMessage.content, cleanContext, !!uploadedFile);
  } else {
    try {
      payload = geminiApiKey
        ? await draftWithGemini(chatMessages, cleanContext, uploadedFile, geminiApiKey)
        : await draftWithClaude(chatMessages, cleanContext, uploadedFile, anthropicApiKey!);
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
  applyPendingCookies(response);

  /* Count the turn against a free user's monthly trial.
     Supabase-backed once configured — see lib/usageCounters.ts. Until then,
     MOCK: a cookie counter resets when the visitor clears site data. */
  if (entitlement.quota !== null) {
    if (useSupabase) {
      await incrementUsageCount(visitorId!, "assistant");
      // Only an anonymous visitor needs this cookie — a logged-in one is
      // already identified by their session.
      if (!authUser) {
        response.cookies.set(VISITOR_COOKIE, visitorId!, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    } else {
      response.cookies.set(ASSISTANT_USAGE_COOKIE, String(used + 1), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return response;
}

/** The default-template instruction and workspace context, prefixed onto the
 *  latest message's text — shared by both providers below so the two calls
 *  can't silently drift apart on what the model is told. */
function withContextPrefix(
  messageText: string,
  context: AssistantContext,
  hasFile: boolean,
): string {
  let contextPrefix = "";
  if (context.docType) {
    contextPrefix += `[Context: the workspace's document type is currently set to "${context.docType}".]\n`;
  }
  if (context.draftExcerpt) {
    contextPrefix += `[Context: the current draft in the workspace reads —\n${context.draftExcerpt}\n]\n`;
  }
  // Unconditional, not inferred from the message's wording: the attachment
  // was applied silently by the client (the visitor never typed "use this
  // as a template" this turn), so the system prompt's own "figure out what
  // the file is for" language has nothing to go on unless told directly.
  if (hasFile && context.isDefaultTemplate) {
    contextPrefix +=
      "[Context: the attached file is the user's DEFAULT TEMPLATE — a real document from their own practice, connected once and reused for every draft. It is NOT source material for facts. Every document you draft this turn must mirror its structure, section headings, paragraph numbering, and formatting conventions, adapted to the facts given in this conversation.]\n";
  }

  return contextPrefix ? `${contextPrefix}\n${messageText}` : messageText;
}

/** Shared by both providers: pulls the model's reply/draft/docType fields
 *  out of its parsed JSON response, with the same defensive fallbacks. */
function toAssistantResponse(parsed: {
  reply?: string;
  draft?: string | null;
  docType?: string | null;
}): AssistantResponse {
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

/* ==========================================================================
   INTEGRATION POINT — the live model calls, one per provider.

   Gemini requires GEMINI_API_KEY in .env.local; Claude requires
   ANTHROPIC_API_KEY. Neither should ever be prefixed NEXT_PUBLIC_. With
   neither set, the route stays in demo mode and never reaches either
   function.
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
  const lastMessageText = withContextPrefix(lastMessage.content, context, !!file);

  let lastContent: string | Array<{ type: "text"; text: string } | Awaited<ReturnType<typeof fileToContentBlock>>> =
    lastMessageText;

  if (file) {
    const block = await fileToContentBlock(file);
    lastContent = [block, { type: "text", text: lastMessageText }];
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
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

  return toAssistantResponse(JSON.parse(textBlock.text));
}

/** Gemini's `generateContent` — REST, not the SDK, so this feature adds zero
 *  new dependencies (mirrors how lib/assistantFiles.ts already avoids one
 *  for everything but .docx). Same system prompt, same JSON schema, same
 *  context-prefix convention as the Claude path above; only the request/
 *  response shape differs. */
async function draftWithGemini(
  messages: ChatMessage[],
  context: AssistantContext,
  file: UploadedFile | undefined,
  apiKey: string,
): Promise<AssistantResponse> {
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const lastMessageText = withContextPrefix(lastMessage.content, context, !!file);

  const lastParts: Array<{ text: string } | Awaited<ReturnType<typeof fileToGeminiPart>>> = [];
  if (file) {
    lastParts.push(await fileToGeminiPart(file));
  }
  lastParts.push({ text: lastMessageText });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DRAFTING_SYSTEM_PROMPT }] },
        contents: [...history, { role: "user", parts: lastParts }],
        generationConfig: {
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blocked = data.promptFeedback?.blockReason;
    throw new Error(
      blocked ? `Gemini blocked the request: ${blocked}` : "Gemini returned no text.",
    );
  }

  return toAssistantResponse(JSON.parse(text));
}
