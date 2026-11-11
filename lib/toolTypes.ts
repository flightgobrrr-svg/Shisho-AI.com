/**
 * The app's Shisho tools: what each one takes and returns. Shared by the
 * server (lib/aiTools.ts, app/api/mobile/tools/[tool]) and the app, so the two
 * can never disagree on a field. No server code here; safe to import anywhere.
 *
 * Every tool follows the product's citation rule (PRODUCT.md): the model may
 * name statutory provisions, and any judgment it names is checked against the
 * verified Library (lib/verifyAuthority.ts) and marked when it is not there.
 */

export const TOOL_IDS = ["contract-review", "case-record", "lesson-plan", "plain-answer", "exam-revision"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export const isToolId = (v: unknown): v is ToolId => typeof v === "string" && (TOOL_IDS as readonly string[]).includes(v);

/** Free and Basic: runs per rolling 30 days, shared by every tool. Paid plans: unlimited. */
export const FREE_MONTHLY_TOOL_RUNS = 5;

export const MAX_TOOL_TEXT_CHARS = 30_000;

export type ToolFile = { filename: string; mimeType: string; dataBase64: string };

export type ToolInput = {
  "contract-review": { text?: string; file?: ToolFile; actingFor?: string };
  "case-record": { text?: string; file?: ToolFile };
  "lesson-plan": { topic: string; level: LessonLevel; minutes: LessonMinutes };
  "plain-answer": { text?: string; file?: ToolFile; language: AnswerLanguage };
  "exam-revision": { courseId: "starter" | "proficient"; module: number };
};

export const LESSON_LEVELS = ["First-year LL.B.", "Final-year LL.B.", "LL.M."] as const;
export type LessonLevel = (typeof LESSON_LEVELS)[number];
export const LESSON_MINUTES = [45, 60, 90] as const;
export type LessonMinutes = (typeof LESSON_MINUTES)[number];
export const ANSWER_LANGUAGES = { en: "English", hi: "हिन्दी" } as const;
export type AnswerLanguage = keyof typeof ANSWER_LANGUAGES;

export type Severity = "must-fix" | "consider" | "good";

/** A judgment or provision as the tool returned it, after the server checked it. */
export type CheckedAuthority = {
  text: string;
  /** True only when it matches the verified Library or the Bare Acts collection. */
  verified: boolean;
  /** The verified source page, when there is one. */
  sourceUrl?: string;
};

export type ToolOutput = {
  "contract-review": {
    summary: string;
    contractType: string;
    clauses: { clause: string; severity: Severity; note: string; provision: CheckedAuthority | null }[];
    missing: string[];
  };
  "case-record": {
    caseTitle: string;
    forum: string;
    stage: string;
    parties: { name: string; role: string }[];
    issues: string[];
    agreedFacts: string[];
    disputedFacts: string[];
    chronology: { date: string; event: string }[];
    authorities: (CheckedAuthority & { reliedBy: string; proposition: string })[];
    orders: { date: string; order: string }[];
    gaps: string[];
  };
  "lesson-plan": {
    title: string;
    objectives: string[];
    outline: { minutes: string; activity: string }[];
    cases: (CheckedAuthority & { why: string })[];
    provisions: (CheckedAuthority & { why: string })[];
    discussion: string[];
    assessment: { question: string; answer: string }[];
  };
  "plain-answer": {
    summary: string;
    whatItMeans: string[];
    deadlines: string[];
    nextSteps: string[];
    provisions: CheckedAuthority[];
  };
  "exam-revision": {
    module: string;
    keyPoints: string[];
    provisions: CheckedAuthority[];
    questions: { question: string; answer: string }[];
  };
};

export type ToolResult<T extends ToolId = ToolId> = {
  tool: T;
  mode: "demo" | "live";
  output: ToolOutput[T];
  /** Runs left this period for a trial plan; null when unlimited. */
  remaining: number | null;
};

export const TOOL_TITLES: Record<ToolId, string> = {
  "contract-review": "Contract review",
  "case-record": "Case record",
  "lesson-plan": "Lesson plan",
  "plain-answer": "Plain-language answer",
  "exam-revision": "Exam revision",
};
