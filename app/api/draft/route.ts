import { NextResponse } from "next/server";
import {
  demoAnnotate,
  isDocType,
  MAX_DRAFT_CHARS,
  type Annotation,
  type DraftResponse,
} from "@/lib/draft";
import {
  entitlementFor,
  PLAN_COOKIE,
  readPlan,
  readUsage,
  USAGE_COOKIE,
  type Plan,
} from "@/lib/entitlements";
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
 * POST /api/draft
 *
 * Runs on the Node runtime because it holds a server-only API key.
 *
 * ── Modes ──────────────────────────────────────────────────────────────────
 *   demo  — hand-written pattern rules from lib/draft.ts. Used when
 *           SHISHO_DRAFT_MODE=demo, or whenever ANTHROPIC_API_KEY is absent.
 *           The response carries `mode: "demo"` so the UI can say so.
 *   live  — a real Claude call. See INTEGRATION POINT below.
 *
 * ── Security ───────────────────────────────────────────────────────────────
 *   • ANTHROPIC_API_KEY is read here and only here. It must NEVER be prefixed
 *     NEXT_PUBLIC_ — that would inline it into the client bundle.
 *   • The entitlement check runs BEFORE any model call, so a request that is
 *     not entitled costs nothing and leaks nothing.
 *   • The draft is length-capped, so a paste-bomb cannot run up a bill.
 *   • Upstream errors are logged server-side and never echoed to the client;
 *     provider errors can carry request details we don't want to surface.
 */

export const runtime = "nodejs";

const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are Shisho, a senior Indian advocate reviewing a junior's draft.

JURISDICTION — this is absolute:
- Indian law only. The Constitution of India, the CPC 1908, the CrPC/BNSS, the Indian Contract Act 1872, the Specific Relief Act 1963, the Indian Evidence Act/BSA, and other Indian statutes.
- Authorities are Supreme Court of India and High Court decisions, cited in Indian form (e.g. "Maneka Gandhi v. Union of India, (1978) 1 SCC 248").
- NEVER cite US, UK, or any foreign law, and never use US procedural vocabulary ("motion", "brief", "plaintiff's complaint"). Indian courts hear interlocutory and miscellaneous applications.

CITATIONS — this is absolute:
- Never invent a case name, citation, section number, or reported reference.
- If a point needs authority but you are not certain of the correct one, say so in the note ("this needs an authority on X") and omit the authority field. An honest gap is correct; a fabricated citation is a serious error.

REVIEW STYLE:
- Comment at clause level, the way a senior marks a draft in the margin.
- Each annotation's "anchor" MUST be text copied verbatim from the draft, so it can be highlighted. Never paraphrase the anchor.
- Be specific and terse. Say what is wrong and what to do about it.
- Use severity "must-fix" for defects that would draw an objection or a return, "consider" for improvements, "good" where the draft gets something right.
- Return at most 6 annotations, ordered most important first.`;

const ANNOTATION_SCHEMA = {
  type: "object",
  properties: {
    annotations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          anchor: {
            type: "string",
            description: "Text copied verbatim from the draft.",
          },
          severity: {
            type: "string",
            enum: ["must-fix", "consider", "good"],
          },
          note: { type: "string" },
          authority: {
            type: "string",
            description:
              "Indian statute or reported case. Omit entirely if not certain.",
          },
        },
        required: ["anchor", "severity", "note"],
        additionalProperties: false,
      },
    },
  },
  required: ["annotations"],
  additionalProperties: false,
} as const;

type ModelAnnotation = Omit<Annotation, "id">;

export async function POST(request: Request) {
  /* ---- Parse and validate ------------------------------------------- */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { draft, docType } = (body ?? {}) as {
    draft?: unknown;
    docType?: unknown;
  };

  if (typeof draft !== "string" || draft.trim().length < 40) {
    return NextResponse.json(
      { error: "Paste at least a few lines of your draft." },
      { status: 400 },
    );
  }

  if (draft.length > MAX_DRAFT_CHARS) {
    return NextResponse.json(
      {
        error: `Drafts are capped at ${MAX_DRAFT_CHARS.toLocaleString("en-IN")} characters. Review it in sections.`,
      },
      { status: 413 },
    );
  }

  if (!isDocType(docType)) {
    return NextResponse.json(
      { error: "Unknown document type." },
      { status: 400 },
    );
  }

  /* ---- Entitlement: enforced HERE, on the server --------------------
     The client also renders a locked state, but that is presentation. This
     check is the one that actually withholds the output. Do not move it.

     Usage comes from Supabase once it's configured (see lib/usageCounters.ts
     for why: a visitor can no longer edit the count directly, only a cookie
     they can't read the value of). Falls back to the original cookie-count
     behaviour, unchanged, until SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY exist —
     same convention as ANTHROPIC_API_KEY's demo-mode fallback below.

     A logged-in visitor (lib/authSession.ts) is a THIRD, higher-priority
     source: their plan comes from the profiles table (lib/profile.ts) and
     their usage row is keyed by their real account id instead of the
     anonymous cookie-random one — see supabase/schema.sql's updated
     USAGE COUNTERS header for why the same column/table works for both. A
     visitor who never registers sees no change at all. */
  const cookieHeader = request.headers.get("cookie");
  const findCookie = (name: string) =>
    cookieHeader
      ?.split(";")
      .map((c) => c.trim().split("="))
      .find(([n]) => n === name)?.[1];

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
    ? await readUsageCount(visitorId!, "review")
    : readUsage(findCookie(USAGE_COOKIE));

  const entitlement = entitlementFor(plan, used);

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: "You have used all five free reviews this month.",
        entitlement,
      },
      { status: 402 },
    );
  }

  /* ---- Mode selection ------------------------------------------------ */
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.SHISHO_DRAFT_MODE === "demo";
  const useDemo = forceDemo || !apiKey;

  let payload: DraftResponse;

  if (useDemo) {
    payload = { mode: "demo", annotations: demoAnnotate(draft, docType) };
  } else {
    try {
      payload = {
        mode: "live",
        annotations: await reviewWithClaude(draft, docType, apiKey!),
      };
    } catch (error) {
      // Logged server-side only — never returned to the client.
      console.error("[api/draft] model call failed:", error);
      return NextResponse.json(
        { error: "The review service is unavailable. Try again shortly." },
        { status: 502 },
      );
    }
  }

  const response = NextResponse.json(payload);
  applyPendingCookies(response);

  /* Count the review against a free user's monthly trial.
     Supabase-backed once configured — see lib/usageCounters.ts. Until then,
     MOCK: a cookie counter resets when the visitor clears site data. */
  if (entitlement.quota !== null) {
    if (useSupabase) {
      await incrementUsageCount(visitorId!, "review");
      // Only an anonymous visitor needs this cookie — a logged-in one is
      // already identified by their session, and writing visitorId (their
      // real user id) here too would just be a pointless duplicate.
      if (!authUser) {
        response.cookies.set(VISITOR_COOKIE, visitorId!, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    } else {
      response.cookies.set(USAGE_COOKIE, String(used + 1), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return response;
}

/* ==========================================================================
   INTEGRATION POINT — the live model call.

   Everything above is plumbing; this is the part that does the work. Swap the
   model, the effort level, or the prompt here.

   Requires ANTHROPIC_API_KEY in .env.local (never NEXT_PUBLIC_). Without it
   the route stays in demo mode and never reaches this function.
   ========================================================================== */
async function reviewWithClaude(
  draft: string,
  docType: string,
  apiKey: string,
): Promise<Annotation[]> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: MODEL,
    // Caps thinking + response together. Adaptive thinking is on by default
    // on this model, so leave headroom above what the annotations need.
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    // `effort` is the cost/latency knob: "low" is quicker and cheaper,
    // "high" reasons harder about the pleading. Tune here.
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: ANNOTATION_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Document type: ${docType}\n\nReview this draft and return clause-level annotations.\n\n---\n${draft}\n---`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text block.");
  }

  const parsed = JSON.parse(textBlock.text) as {
    annotations?: ModelAnnotation[];
  };

  return (parsed.annotations ?? [])
    .filter((a) => typeof a.anchor === "string" && typeof a.note === "string")
    .map((a, i) => ({ ...a, id: `live-${i}` }));
}
