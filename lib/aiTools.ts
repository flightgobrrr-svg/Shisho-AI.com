import { COURSES } from "@/lib/courses";
import { fileToContentBlock, fileToGeminiPart } from "@/lib/assistantFiles";
import type { UploadedFile } from "@/lib/assistant";
import { VERIFIED_CASE_LINES, VERIFIED_PROVISION_LINES, checkAuthority } from "@/lib/verifyAuthority";
import type { CheckedAuthority, ToolId, ToolInput, ToolOutput } from "@/lib/toolTypes";
import { withGeminiFallback } from "@/lib/geminiModels";
import { VERIFIED_REFERENCE } from "@/lib/legalGrounding";

/**
 * SERVER ONLY. The app's Shisho tools: one prompt and one output shape per
 * tool, run on the same providers as the drafting chat
 * (app/api/assistant/route.ts) — Gemini when GEMINI_API_KEY is set, Claude
 * when only ANTHROPIC_API_KEY is, and an honest demo answer when neither is.
 *
 * Every authority the model names passes through checkAuthority before it
 * leaves the server, so the app can mark anything outside the verified
 * Library and Bare Acts as "check before relying".
 */

/* Kept in step with app/api/assistant/route.ts by hand. */
const CLAUDE_MODEL = "claude-opus-5";
/* Gemini's models, in order, live in lib/geminiModels.ts (shared with the drafting chat). */

const RULES = `JURISDICTION AND CITATIONS — absolute:
- Indian law only: the Constitution of India, Indian statutes and Indian courts. Never cite foreign law or use foreign procedural vocabulary.
- Since 1 July 2024 the BNS, BNSS and BSA replaced the IPC, CrPC and Evidence Act. Cite the current provision and give the old one in brackets where it helps.
- Never invent a case, citation or section number. If you are not certain of an authority, leave it out and say what needs checking. An honest gap is correct; a fabricated citation is a serious error.
- This is education and drafting assistance, not legal advice.
- Plain, formal English. No emoji, no exclamation marks, no filler.

${VERIFIED_REFERENCE}`;

type Spec = { system: string; schema: Record<string, unknown>; maxTokens: number };

const str = { type: "string" };
const strArr = { type: "array", items: str };
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const arr = (properties: Record<string, unknown>) => ({ type: "array", items: obj(properties) });

const SPECS: Record<ToolId, Spec> = {
  "contract-review": {
    maxTokens: 8000,
    system: `You are Shisho, a senior Indian corporate lawyer reviewing a contract the way a senior marks up a junior's work: clause by clause, in the margin.

${RULES}

For each clause that matters, quote its opening words or its heading in "clause" (short, as it appears), set "severity" to must-fix (a real legal or commercial risk), consider (worth negotiating or tightening) or good (sound, and say why), and write the note: what the clause does, the risk, and the fix. In "provision" name the governing Indian provision when one applies (e.g. "Section 73, Indian Contract Act, 1872", "Section 27, Indian Contract Act, 1872", "Section 7, Arbitration and Conciliation Act, 1996", "Section 12A, Commercial Courts Act, 2015"), or "" when none is certain.
In "missing" list clauses a contract of this kind normally carries that this one lacks (e.g. governing law and jurisdiction, dispute resolution, limitation of liability, termination, confidentiality, stamp duty). Consider stamp duty and registration where relevant.
"summary": three or four sentences on what the contract is and its overall position for the party named. "contractType": what kind of contract it is.
If the text is not a contract, say so in "summary" and return empty lists.`,
    schema: obj({
      summary: str,
      contractType: str,
      clauses: arr({ clause: str, severity: { type: "string", enum: ["must-fix", "consider", "good"] }, note: str, provision: str }),
      missing: strArr,
    }),
  },
  "case-record": {
    maxTokens: 8000,
    system: `You prepare a case record for an Indian judge from the papers supplied: a neutral, accurate arrangement of the record so the bench can spend its time on reasoning.

${RULES}

STRICTLY NEUTRAL. Never suggest how the case should be decided, never weigh evidence, never say which side is stronger.
Take everything from the papers. Do not add facts, dates or authorities that are not in them. Where the papers are silent, say so in "gaps" (e.g. "Date of service of summons not on record").
"parties": every party with their role (Plaintiff, Defendant No. 1, Petitioner, Respondent, etc.). "issues": the questions for decision, framed neutrally as a court frames issues. "agreedFacts" and "disputedFacts": short statements. "chronology": dated events in order, date as written in the papers. "authorities": each judgment or provision a party relies on, with "citation" exactly as cited in the papers, "reliedBy" (which party) and "proposition" (what it is cited for). "orders": orders already passed, by date. "forum" and "stage" as the papers show them; "caseTitle" the cause title.`,
    schema: obj({
      caseTitle: str,
      forum: str,
      stage: str,
      parties: arr({ name: str, role: str }),
      issues: strArr,
      agreedFacts: strArr,
      disputedFacts: strArr,
      chronology: arr({ date: str, event: str }),
      authorities: arr({ citation: str, reliedBy: str, proposition: str }),
      orders: arr({ date: str, order: str }),
      gaps: strArr,
    }),
  },
  "lesson-plan": {
    maxTokens: 6000,
    system: `You are an experienced Indian law lecturer preparing one class.

${RULES}

CASES: choose ONLY from the verified judgments listed in the message, copying the title and citation exactly. If none fits the topic, return no cases.
PROVISIONS: prefer the verified provisions listed; you may name another Indian provision only when you are certain of its number.
"outline": timed segments whose minutes add up to the class length ("minutes" like "0–10"). "objectives": what students can do after the class. "discussion": questions to put to the class. "assessment": short questions with model answers for the end of class or homework. Pitch everything at the level given.`,
    schema: obj({
      title: str,
      objectives: strArr,
      outline: arr({ minutes: str, activity: str }),
      cases: arr({ citation: str, why: str }),
      provisions: arr({ citation: str, why: str }),
      discussion: strArr,
      assessment: arr({ question: str, answer: str }),
    }),
  },
  "plain-answer": {
    maxTokens: 4000,
    system: `You explain an Indian legal notice, document or process to someone who is not a lawyer, in plain words.

${RULES}

Short sentences, everyday words, and any legal term explained the first time it appears. Never tell the person what they must decide; explain what the paper or process means and what their options are.
"summary": two or three sentences on what this is. "whatItMeans": the points that matter, one per line. "deadlines": any time limit stated in the paper or set by law that you are certain of, with what happens if it is missed; empty if none. "nextSteps": practical steps in order, including keeping copies and getting help from a lawyer or the free legal services authority when the matter is serious. "provisions": Indian provisions the answer rests on, only when certain.
Write every field in the language requested in the message.`,
    schema: obj({
      summary: str,
      whatItMeans: strArr,
      deadlines: strArr,
      nextSteps: strArr,
      provisions: strArr,
    }),
  },
  "exam-revision": {
    maxTokens: 5000,
    system: `You write revision material for an Indian LL.B. student on one module of their course.

${RULES}

"keyPoints": the points a student must be able to state in an exam, one per line, each self-contained. "provisions": the Indian provisions the module turns on, only when certain. "questions": exam-style questions with short model answers a student can mark themselves against, mixing recall and application.`,
    schema: obj({
      keyPoints: strArr,
      provisions: strArr,
      questions: arr({ question: str, answer: str }),
    }),
  },
};

/** Gemini's responseSchema is a proto, not JSON Schema: no additionalProperties. */
function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(toGeminiSchema);
  if (schema && typeof schema === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema)) if (k !== "additionalProperties") out[k] = toGeminiSchema(v);
    return out;
  }
  return schema;
}

/** The text of the user turn: the person's input, plus whatever the tool supplies. */
export function userMessage<T extends ToolId>(tool: T, input: ToolInput[T]): string {
  switch (tool) {
    case "contract-review": {
      const i = input as ToolInput["contract-review"];
      return [
        i.actingFor ? `I act for: ${i.actingFor}.` : "Review it neutrally, noting risks to each side.",
        i.text ? `The contract:\n\n${i.text}` : "The contract is attached.",
      ].join("\n\n");
    }
    case "case-record": {
      const i = input as ToolInput["case-record"];
      return i.text ? `The case papers:\n\n${i.text}` : "The case papers are attached.";
    }
    case "lesson-plan": {
      const i = input as ToolInput["lesson-plan"];
      return `Topic: ${i.topic}\nLevel: ${i.level}\nClass length: ${i.minutes} minutes\n\nVerified judgments you may use:\n${VERIFIED_CASE_LINES.join("\n")}\n\nVerified provisions:\n${VERIFIED_PROVISION_LINES.join("\n")}`;
    }
    case "plain-answer": {
      const i = input as ToolInput["plain-answer"];
      const lang = i.language === "hi" ? "Hindi (Devanagari script)" : "English";
      return `Answer in ${lang}.\n\n${i.text ? `My question or the paper I received:\n\n${i.text}` : "The paper I received is attached. Explain it."}`;
    }
    case "exam-revision": {
      const i = input as ToolInput["exam-revision"];
      const course = COURSES.find((c) => c.id === i.courseId)!;
      const m = course.syllabus[i.module];
      return `Course: ${course.name} (${course.level})\nModule ${i.module + 1}: ${m.title}\nWhat the module covers: ${m.detail}`;
    }
  }
  return "";
}

type Raw = Record<string, unknown>;

async function callClaude(spec: Spec, text: string, file: UploadedFile | undefined, apiKey: string): Promise<Raw> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const content = file ? [await fileToContentBlock(file), { type: "text" as const, text }] : text;
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: spec.maxTokens,
    system: spec.system,
    output_config: { effort: "medium", format: { type: "json_schema", schema: spec.schema } },
    messages: [{ role: "user", content }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Model returned no text block.");
  return JSON.parse(block.text) as Raw;
}

async function callGemini(spec: Spec, text: string, file: UploadedFile | undefined, apiKey: string, model: string): Promise<Raw> {
  const parts: unknown[] = [];
  if (file) parts.push(await fileToGeminiPart(file));
  parts.push({ text });
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: spec.system }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens: spec.maxTokens,
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(spec.schema),
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  const out = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error(data.promptFeedback?.blockReason ? `Gemini blocked: ${data.promptFeedback.blockReason}` : "Gemini returned no text.");
  return JSON.parse(out) as Raw;
}

/* ---- Shaping: the model's JSON into ToolOutput, every authority checked. ---- */

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map(s).filter(Boolean) : []);
const rows = (v: unknown) => (Array.isArray(v) ? (v.filter((r) => r && typeof r === "object") as Raw[]) : []);
const checked = (v: unknown) => list(v).map(checkAuthority);

function shape<T extends ToolId>(tool: T, raw: Raw, input: ToolInput[T]): ToolOutput[T] {
  switch (tool) {
    case "contract-review": {
      const out: ToolOutput["contract-review"] = {
        summary: s(raw.summary),
        contractType: s(raw.contractType),
        clauses: rows(raw.clauses).map((r) => ({
          clause: s(r.clause),
          severity: r.severity === "must-fix" || r.severity === "good" ? r.severity : "consider",
          note: s(r.note),
          provision: s(r.provision) ? checkAuthority(s(r.provision)) : null,
        })),
        missing: list(raw.missing),
      };
      return out as ToolOutput[T];
    }
    case "case-record": {
      const out: ToolOutput["case-record"] = {
        caseTitle: s(raw.caseTitle),
        forum: s(raw.forum),
        stage: s(raw.stage),
        parties: rows(raw.parties).map((r) => ({ name: s(r.name), role: s(r.role) })),
        issues: list(raw.issues),
        agreedFacts: list(raw.agreedFacts),
        disputedFacts: list(raw.disputedFacts),
        chronology: rows(raw.chronology).map((r) => ({ date: s(r.date), event: s(r.event) })),
        authorities: rows(raw.authorities).map((r) => ({ ...checkAuthority(s(r.citation)), reliedBy: s(r.reliedBy), proposition: s(r.proposition) })),
        orders: rows(raw.orders).map((r) => ({ date: s(r.date), order: s(r.order) })),
        gaps: list(raw.gaps),
      };
      return out as ToolOutput[T];
    }
    case "lesson-plan": {
      // Cases must come from the verified list; anything else is dropped, not shown.
      const cases = rows(raw.cases)
        .map((r) => ({ ...checkAuthority(s(r.citation)), why: s(r.why) }))
        .filter((c) => c.verified);
      const out: ToolOutput["lesson-plan"] = {
        title: s(raw.title),
        objectives: list(raw.objectives),
        outline: rows(raw.outline).map((r) => ({ minutes: s(r.minutes), activity: s(r.activity) })),
        cases,
        provisions: rows(raw.provisions).map((r) => ({ ...checkAuthority(s(r.citation)), why: s(r.why) })),
        discussion: list(raw.discussion),
        assessment: rows(raw.assessment).map((r) => ({ question: s(r.question), answer: s(r.answer) })),
      };
      return out as ToolOutput[T];
    }
    case "plain-answer": {
      const out: ToolOutput["plain-answer"] = {
        summary: s(raw.summary),
        whatItMeans: list(raw.whatItMeans),
        deadlines: list(raw.deadlines),
        nextSteps: list(raw.nextSteps),
        provisions: checked(raw.provisions),
      };
      return out as ToolOutput[T];
    }
    case "exam-revision": {
      const i = input as ToolInput["exam-revision"];
      const course = COURSES.find((c) => c.id === i.courseId)!;
      const out: ToolOutput["exam-revision"] = {
        module: course.syllabus[i.module].title,
        keyPoints: list(raw.keyPoints),
        provisions: checked(raw.provisions),
        questions: rows(raw.questions).map((r) => ({ question: s(r.question), answer: s(r.answer) })),
      };
      return out as ToolOutput[T];
    }
  }
  throw new Error("Unknown tool");
}

/* ---- Demo answers: what each tool returns with no model key. Marked demo in the app. ---- */

const DEMO: { [K in ToolId]: Raw } = {
  "contract-review": {
    summary: "Demo answer: no AI model is connected, so this is a fixed example of the format, not a review of your contract.",
    contractType: "Example",
    clauses: [
      { clause: "Non-compete", severity: "must-fix", note: "A restraint on carrying on a trade after the contract ends is void in India except on the sale of goodwill.", provision: "Section 27, Indian Contract Act, 1872" },
      { clause: "Liquidated damages", severity: "consider", note: "A stated sum is a ceiling: a court awards reasonable compensation up to it, not the full figure automatically.", provision: "Section 74, Indian Contract Act, 1872" },
      { clause: "Arbitration", severity: "good", note: "A written agreement to refer disputes to arbitration, with a seat named.", provision: "Section 7, Arbitration and Conciliation Act, 1996" },
    ],
    missing: ["Governing law and jurisdiction", "Stamp duty and who pays it"],
  },
  "case-record": {
    caseTitle: "Demo record",
    forum: "Not stated",
    stage: "Not stated",
    parties: [{ name: "No papers were read", role: "Demo" }],
    issues: ["Demo answer: no AI model is connected. With one, the issues are framed from your papers."],
    agreedFacts: [],
    disputedFacts: [],
    chronology: [],
    authorities: [{ citation: "Order XIV Rule 1, CPC", reliedBy: "Example", proposition: "How issues are framed" }],
    orders: [],
    gaps: ["Connect an AI model to read the papers."],
  },
  "lesson-plan": {
    title: "Demo lesson plan",
    objectives: ["Demo answer: no AI model is connected, so this is a fixed example of the format."],
    outline: [{ minutes: "0–10", activity: "Example segment" }],
    cases: [{ citation: "(1978) 1 SCC 248", why: "Example: Article 21 and procedure established by law" }],
    provisions: [{ citation: "Article 21, Constitution of India", why: "Example" }],
    discussion: ["Example question"],
    assessment: [{ question: "Example question", answer: "Example answer" }],
  },
  "plain-answer": {
    summary: "Demo answer: no AI model is connected, so your question was not read. This shows the format only.",
    whatItMeans: ["With a model connected, each point of your notice is explained here in plain words."],
    deadlines: [],
    nextSteps: ["Keep the original notice and the envelope it came in.", "For a serious matter, speak to a lawyer or your District Legal Services Authority."],
    provisions: [],
  },
  "exam-revision": {
    keyPoints: ["Demo answer: no AI model is connected, so these notes are a format example only."],
    provisions: [],
    questions: [{ question: "Example question", answer: "Example answer" }],
  },
};

export type RunOutcome<T extends ToolId> = { mode: "demo" | "live"; output: ToolOutput[T] };

export async function runTool<T extends ToolId>(tool: T, input: ToolInput[T], file?: UploadedFile): Promise<RunOutcome<T>> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const forceDemo = process.env.SHISHO_ASSISTANT_MODE === "demo";
  if (forceDemo || (!geminiKey && !anthropicKey)) {
    return { mode: "demo", output: shape(tool, DEMO[tool], input) };
  }
  const spec = SPECS[tool];
  const text = userMessage(tool, input);
  return { mode: "live", output: shape(tool, await callModel(spec, text, file, geminiKey, anthropicKey), input) };
}

/**
 * Gemini first (the free path), moving down lib/geminiModels.ts's list when a
 * model is busy or out of quota; when every Gemini model is busy and a Claude
 * key is set, the request goes to Claude.
 */
async function callModel(spec: Spec, text: string, file: UploadedFile | undefined, geminiKey?: string, anthropicKey?: string): Promise<Raw> {
  if (!geminiKey) return callClaude(spec, text, file, anthropicKey!);
  try {
    return await withGeminiFallback((model) => callGemini(spec, text, file, geminiKey, model), "aiTools");
  } catch (e) {
    if (anthropicKey) return callClaude(spec, text, file, anthropicKey);
    throw e;
  }
}

export type { CheckedAuthority };
