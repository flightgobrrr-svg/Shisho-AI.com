import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/usageCounters";
import { fetchKanoonJudgment } from "@/lib/indianKanoon";
import type { PreviewCase } from "@/lib/library";

/** What identifies a judgment to fetch — either a curated PreviewCase's own
 *  verified fields, or a title/URL pair found via a live Kanoon search
 *  (lib/indianKanoon.ts's searchKanoonTopResult) for a case outside the
 *  curated Library. Both paths converge on the same generation pipeline
 *  below. */
type JudgmentIdentity = { title: string; court: string; sourceUrl: string };

/**
 * The full "citation digest" for app/library/judgments/[slug] — a book-
 * quality, law-report-style analysis of one judgment, built from its own
 * real text rather than the model's memory of the case.
 *
 * Pipeline: fetchKanoonJudgment (lib/indianKanoon.ts) fetches the real page
 * at the case's already-verified sourceUrl and parses out the four fields
 * Kanoon's own markup labels unambiguously (court, title, raw citations,
 * bench). Everything else here — case number, date if the title didn't
 * carry it, and the entire analytical brief — is derived by the model
 * STRICTLY from that real fetched text, never from its own memory of the
 * case. This is a materially different (and more accurate) trust boundary
 * than an earlier version of this file, which drafted from the model's
 * training knowledge alone — see supabase/schema.sql's `case_briefs` table
 * header for that history.
 *
 * Generated once per case, cached in Supabase indefinitely — see this
 * file's own `getCaseDigest` for the cache-then-generate flow.
 */

export type CaseCitations = {
  scc: string | null;
  air: string | null;
  sccOnline: string | null;
  airScw: string | null;
  scale: string | null;
  alt: string | null;
  ald: string | null;
  aplj: string | null;
  crilj: string | null;
  other: string | null;
};

export type CaseDigest = {
  /** ISO time the digest was generated (from the cache row, or now). */
  generatedAt?: string;
  courtHeader: string;
  /** The judgment's own title — deterministic (from the identity passed in,
   *  never AI-generated), stored so app/library/lookup can render an ad-hoc
   *  result without needing a curated PreviewCase at all. The curated
   *  digest page keeps using its own PreviewCase.title instead; this field
   *  exists for the ad-hoc path. */
  caseTitle: string;
  caseNumber: string;
  bench: string;
  dateOfJudgment: string;
  natureOfProceedings: string;
  result: string;
  citations: CaseCitations;
  headnote: string;
  synopsis: string;
  importantObservations: string;
  ratioDecidendi: string;
  judicialAnalysis: string;
  analogy: string;
  resultOfCase: string;
  practicalLitigationApplication: string;
  practicalTestLaidDown: string;
  keyTakeaway: string;
  finalCourtPrinciple: string;
  strongestCitablePoint: string;
  oneLineLegalPrinciple: string;
  readyReferenceNote: string;
  mode: "live" | "demo";
};

// Kept in sync with app/api/assistant/route.ts's own GEMINI_MODEL constant
// and its comment on why — gemini-3.6-flash's free tier turned out to be a
// hard 20 requests/day on this project, confirmed live; gemini-3.5-flash is
// a separate quota bucket. Check both current availability and quota before
// assuming either is still right.
const GEMINI_MODEL = "gemini-3.5-flash";
const CLAUDE_MODEL = "claude-opus-5";

const DIGEST_SYSTEM_PROMPT = `You are Shisho, preparing a professional, book-quality citation digest of a real Indian judgment for a legal-education product — the format of a published Supreme Court/High Court citation digest, not a casual summary.

You will be given the FULL TEXT of a real judgment, its court, its raw "equivalent citations" string exactly as reported, and its bench. Everything you write must be derived from that given text — never from your own memory of the case, and never inventing a fact, date, citation, or holding the text does not actually support.

ABSOLUTE RULES:
- Ground every field in the judgment text you were given. If the text does not clearly support a specific detail, state the point in more general terms rather than inventing a specific.
- Sort the given raw citation string into the correct named reporter fields (scc, air, sccOnline, airScw, scale, alt, ald, aplj, crilj). Use "other" only for a real citation in the given string that doesn't fit one of those named reporters. Leave a field null if no citation for that reporter appears in the given string — never fabricate one to fill a field.
- Original analysis only. Do not copy verbatim from any existing headnote, digest, editorial note, or publisher commentary — you were not given one, only the primary judgment text, so write your own independent analysis of it. Paraphrase and analyze; do not reproduce long passages of the judgment's own text verbatim.
- Do not introduce case names or citations beyond the one you were given and whatever the judgment text itself cites, unless extremely well known and directly relevant.
- For "practicalLitigationApplication", address only the document/proceeding types this specific judgment is actually relevant to — do not force a mention of every possible category.
- Write in plain, formal, professional register — no chatty filler, no bullet-point telegraphese, no decorative language. Each field is one or more complete sentences of prose, publication-quality.
- "caseNumber", "dateOfJudgment", and "natureOfProceedings" must be read directly from the given text (e.g. from a "CASE NO.:" line, a "Decided On:" line, or the nature of the petition/appeal stated in the opening). If genuinely not stated in the given text, say so plainly rather than guessing.

FIELDS:
- caseNumber: the case/petition/appeal number as stated in the judgment.
- dateOfJudgment: the date the judgment was delivered, as stated in the judgment (a readable date, e.g. "24 April, 1973").
- natureOfProceedings: what kind of proceeding this is (e.g. "Writ Petition under Article 32", "Civil Appeal", "Criminal Appeal", "Special Leave Petition").
- result: one short sentence — was the petition/appeal/suit allowed, dismissed, partly allowed, modified, or remanded, and who succeeded.
- headnote: facts giving rise to the dispute, the nature of the controversy, the principle settled, and the legal significance of the decision — one cohesive paragraph.
- synopsis: background facts, procedural history, the issues before the court, the findings, and the final outcome.
- importantObservations: the most important judicial observations of use for future litigation and judicial reference.
- ratioDecidendi: the binding legal principle forming the foundation of the judgment.
- judicialAnalysis: the issues considered, the statutory provisions involved, the reasoning adopted, the interpretation applied, and the basis of the final conclusion.
- analogy: what legal right is protected, what legal mischief is prevented, what broader legal philosophy emerges, and what practical lesson advocates should draw from the ruling.
- resultOfCase: a fuller statement of the result — whether allowed/dismissed/partly allowed/modified/remanded, and which party succeeded.
- practicalLitigationApplication: how this judgment may actually be relied upon in real proceedings (only the genuinely relevant ones — plaints, written statements, counter affidavits, injunction applications, appeals, revisions, writ petitions, property litigation, Negotiable Instruments Act cases, SARFAESI proceedings, DRT proceedings, civil litigation, criminal litigation).
- practicalTestLaidDown: the judgment converted into a simple, practical test, checklist, or courtroom principle capable of immediate application.
- keyTakeaway: the single most important practical lesson an advocate should remember from this judgment.
- finalCourtPrinciple: one concise original paragraph capturing the essence of the judgment.
- strongestCitablePoint: the single most powerful proposition of law from this judgment that can be directly relied upon before a court.
- oneLineLegalPrinciple: the entire judgment summarised in one authoritative sentence.
- readyReferenceNote: a concise, litigation-oriented note suitable for direct use in written arguments, pleadings, affidavits, appeals, revisions, and legal research compilations.`;

function citationsSchema(nullable: boolean) {
  const field = { type: "string", nullable } as const;
  return {
    type: "object",
    properties: {
      scc: field,
      air: field,
      sccOnline: field,
      airScw: field,
      scale: field,
      alt: field,
      ald: field,
      aplj: field,
      crilj: field,
      other: field,
    },
    required: ["scc", "air", "sccOnline", "airScw", "scale", "alt", "ald", "aplj", "crilj", "other"],
  };
}

const DIGEST_FIELDS = [
  "caseNumber",
  "dateOfJudgment",
  "natureOfProceedings",
  "result",
  "headnote",
  "synopsis",
  "importantObservations",
  "ratioDecidendi",
  "judicialAnalysis",
  "analogy",
  "resultOfCase",
  "practicalLitigationApplication",
  "practicalTestLaidDown",
  "keyTakeaway",
  "finalCourtPrinciple",
  "strongestCitablePoint",
  "oneLineLegalPrinciple",
  "readyReferenceNote",
] as const;

function digestSchema(citations: ReturnType<typeof citationsSchema>, additionalProperties?: false) {
  const stringFields = Object.fromEntries(DIGEST_FIELDS.map((f) => [f, { type: "string" }]));
  return {
    type: "object",
    properties: { citations, ...stringFields },
    required: ["citations", ...DIGEST_FIELDS],
    ...(additionalProperties === false ? { additionalProperties: false } : {}),
  };
}

const DIGEST_SCHEMA_GEMINI = digestSchema(citationsSchema(true));
const DIGEST_SCHEMA_CLAUDE = digestSchema(citationsSchema(true), false);

/** Best single display citation for a case with no pre-verified `.citation`
 *  string of its own (app/library/lookup, unlike the curated Library) —
 *  prefers the most commonly cited reporters, falls back to whatever the
 *  model actually found. */
export function primaryCitation(citations: CaseCitations): string | null {
  return (
    citations.scc ?? citations.air ?? citations.sccOnline ?? citations.other ?? null
  );
}

function userPrompt(judgment: {
  court: string;
  title: string;
  bench: string | null;
  citationsRaw: string | null;
  bodyText: string;
}): string {
  return `Court: ${judgment.court}
Case title: ${judgment.title}
Bench: ${judgment.bench ?? "not stated"}
Raw equivalent citations (sort these into the schema's named reporter fields): ${judgment.citationsRaw ?? "none given"}

Full judgment text follows:
---
${judgment.bodyText}
---

Prepare the citation digest.`;
}

function demoDigest(identity: JudgmentIdentity, fallbackRatio: string): CaseDigest {
  const empty: CaseCitations = {
    scc: null,
    air: null,
    sccOnline: null,
    airScw: null,
    scale: null,
    alt: null,
    ald: null,
    aplj: null,
    crilj: null,
    other: null,
  };
  const note = `Demo mode — no model connected, so no digest has actually been prepared for ${identity.title}. Read the judgment itself using the link below.`;
  return {
    courtHeader: identity.court.toUpperCase(),
    caseTitle: identity.title,
    caseNumber: "Not available in demo mode.",
    bench: "Not available in demo mode.",
    dateOfJudgment: "Not available in demo mode.",
    natureOfProceedings: "Not available in demo mode.",
    result: "Not available in demo mode.",
    citations: empty,
    headnote: note,
    synopsis: note,
    importantObservations: note,
    ratioDecidendi: fallbackRatio,
    judicialAnalysis: note,
    analogy: note,
    resultOfCase: note,
    practicalLitigationApplication: note,
    practicalTestLaidDown: note,
    keyTakeaway: note,
    finalCourtPrinciple: note,
    strongestCitablePoint: note,
    oneLineLegalPrinciple: fallbackRatio,
    readyReferenceNote: note,
    mode: "demo",
  };
}

async function generateWithGemini(
  courtHeader: string,
  judgment: Parameters<typeof userPrompt>[0],
  apiKey: string,
): Promise<CaseDigest> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DIGEST_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt(judgment) }] }],
        generationConfig: {
          maxOutputTokens: 16000,
          responseMimeType: "application/json",
          responseSchema: DIGEST_SCHEMA_GEMINI,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text.");

  const parsed = JSON.parse(text) as Omit<CaseDigest, "mode" | "courtHeader" | "bench" | "caseTitle">;
  return {
    ...parsed,
    bench: judgment.bench ?? "Not stated in the judgment.",
    courtHeader,
    caseTitle: judgment.title,
    mode: "live",
  };
}

async function generateWithClaude(
  courtHeader: string,
  judgment: Parameters<typeof userPrompt>[0],
  apiKey: string,
): Promise<CaseDigest> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system: DIGEST_SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: DIGEST_SCHEMA_CLAUDE },
    },
    messages: [{ role: "user", content: userPrompt(judgment) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text block.");
  }

  const parsed = JSON.parse(textBlock.text) as Omit<CaseDigest, "mode" | "courtHeader" | "bench" | "caseTitle">;
  return {
    ...parsed,
    bench: judgment.bench ?? "Not stated in the judgment.",
    courtHeader,
    caseTitle: judgment.title,
    mode: "live",
  };
}

async function generateDigest(identity: JudgmentIdentity, fallbackRatio: string): Promise<CaseDigest> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.SHISHO_ASSISTANT_MODE === "demo";

  if (forceDemo || (!geminiKey && !anthropicKey)) {
    return demoDigest(identity, fallbackRatio);
  }

  try {
    const fetched = await fetchKanoonJudgment(identity.sourceUrl);
    const courtHeader = fetched.court.toUpperCase();
    const judgment = {
      court: fetched.court,
      title: fetched.title,
      bench: fetched.bench,
      citationsRaw: fetched.citationsRaw,
      bodyText: fetched.bodyText,
    };

    return geminiKey
      ? await generateWithGemini(courtHeader, judgment, geminiKey)
      : await generateWithClaude(courtHeader, judgment, anthropicKey!);
  } catch (error) {
    console.error("[caseBrief] digest generation failed, falling back to demo:", error);
    return demoDigest(identity, fallbackRatio);
  }
}

async function cachedOrGenerated(
  identity: JudgmentIdentity,
  slug: string,
  fallbackRatio: string,
): Promise<CaseDigest> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase()
      .from("case_briefs")
      .select("digest, mode, generated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return {
        ...(data.digest as Omit<CaseDigest, "mode">),
        mode: data.mode,
        generatedAt: data.generated_at,
      };
    }
  }

  const digest = { ...(await generateDigest(identity, fallbackRatio)), generatedAt: new Date().toISOString() };

  if (isSupabaseConfigured()) {
    const { mode, generatedAt: _generatedAt, ...digestFields } = digest;
    const { error } = await supabase()
      .from("case_briefs")
      .upsert({ slug, digest: digestFields, mode }, { onConflict: "slug" });
    if (error) console.error("[caseBrief] cache write failed:", error);
  }

  return digest;
}

/**
 * Reads the cached digest for `slug` if one exists; otherwise fetches the
 * real judgment and generates one. Fails soft to a freshly-generated
 * (uncached) digest if the Supabase read/write itself fails — a cache miss
 * should never be the reason a visitor sees nothing. For a curated Library
 * case only — see `getCaseDigestForUrl` for a case outside the Library,
 * found via a live search.
 */
export async function getCaseDigest(item: PreviewCase, slug: string): Promise<CaseDigest> {
  if (!item.sourceUrl) return demoDigest({ ...item, sourceUrl: "" }, item.topic);
  return cachedOrGenerated({ title: item.title, court: item.court, sourceUrl: item.sourceUrl }, slug, item.topic);
}

/**
 * The same pipeline as `getCaseDigest`, for a judgment found outside the
 * curated Library via lib/indianKanoon.ts's `searchKanoonTopResult` —
 * app/library/lookup is the one caller. `title`/`court` come from that
 * search result, not a verified PreviewCase, which is exactly why the
 * resulting digest page shows them prominently: a wrong search match is
 * meant to be obvious at a glance, not hidden behind a confirmation step.
 */
export async function getCaseDigestForUrl(
  identity: JudgmentIdentity,
  slug: string,
): Promise<CaseDigest> {
  return cachedOrGenerated(identity, slug, "Not available — this case is outside the curated Library.");
}
