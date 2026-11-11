import { ACTS, PROVISIONS, type ActId } from "@/lib/acts";
import { CLERK_MANUAL } from "@/lib/clerkManual";
import { DOCUMENTS } from "@/lib/documents";
import { IPC_BNS } from "@/lib/ipcBns";
import { PREVIEW_CASES } from "@/lib/library";
import { LIMITATION_ENTRIES, periodLabel } from "@/lib/limitation";

/**
 * Mock tests built ONLY from data already checked against a source: the
 * Library's judgments, the Bare Acts collection, the Limitation Act schedule,
 * the IPC-to-BNS table, the document pages and the clerks' manual. No question
 * is written freehand, so none can carry an unverified fact; each one names
 * where its answer comes from.
 *
 * A wrong option must never also be right. Judgment questions only offer
 * judgments whose topics share no significant word, and every option list is
 * checked for duplicates. tests/mock-tests.test.mjs holds these to account.
 */

export type ExamId = "clat" | "judicial" | "court-staff";

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
  sourceUrl?: string;
};

export type Exam = {
  id: ExamId;
  name: string;
  audience: string;
  blurb: string;
  /** What this test is and is not, said plainly. */
  scope: string;
  length: number;
  minutes: number;
};

export const EXAMS: Exam[] = [
  {
    id: "clat",
    name: "CLAT legal knowledge",
    audience: "clat",
    blurb: "The Constitution, contract and the landmark judgments behind CLAT's legal reasoning passages.",
    scope: "CLAT's legal reasoning section is passage-based. This set drills the legal knowledge those passages draw on; it is not a full CLAT paper and has no English, GK or logical reasoning.",
    length: 20,
    minutes: 20,
  },
  {
    id: "judicial",
    name: "Judicial services prelims",
    audience: "judicial-exams",
    blurb: "CPC, limitation, the BSA, IPC to BNS and the documents filed at each stage.",
    scope: "Objective questions in the style of a judicial services preliminary paper, on the provisions Shisho has verified. Each state's syllabus is wider; check yours.",
    length: 25,
    minutes: 25,
  },
  {
    id: "court-staff",
    name: "Court staff exams",
    audience: "court-staff",
    blurb: "Filing, scrutiny, limitation and court procedure, as asked in judiciary employee exams.",
    scope: "Drawn from the Advocate Clerks' manual, the Limitation Act schedule and the document pages. Court rules differ between courts; check your court's own rules too.",
    length: 20,
    minutes: 15,
  },
];

export const getExam = (id: string) => EXAMS.find((e) => e.id === id);

/* ---- A seeded shuffle, so a test can be retaken in the same order. ---- */

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Options that differ only by "first", case or punctuation count as the same answer. */
const sameAnswer = (s: string) => s.toLowerCase().replace(/\bfirst\b/g, "").replace(/[^a-z0-9]+/g, "");

/** Four options: the answer plus three distinct distractors, shuffled. Null when there are not enough. */
function options(answer: string, pool: string[], rand: () => number): { options: string[]; answer: number } | null {
  const seen = new Set([sameAnswer(answer)]);
  const wrong: string[] = [];
  for (const d of shuffle(pool, rand)) {
    const k = sameAnswer(d);
    if (!d || seen.has(k)) continue;
    seen.add(k);
    wrong.push(d);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return null;
  const all = shuffle([answer, ...wrong], rand);
  return { options: all, answer: all.indexOf(answer) };
}

const actName = (id: ActId) => ACTS.find((a) => a.id === id)!.name;

const STOP = new Set(["section", "article", "under", "their", "which", "about", "where", "after", "rights", "right", "india", "court", "state", "being", "within", "between", "without", "against", "limits", "power", "powers"]);
/** Significant words, plus Article and section numbers ("a21", "s66a"), so two Article 21 cases always overlap. */
const words = (s: string) => {
  const lower = s.toLowerCase();
  const out = new Set(lower.split(/[^a-z]+/).filter((w) => w.length > 5 && !STOP.has(w)));
  for (const m of lower.matchAll(/\b(article|section|s\.)\s*(\d+[a-z]?)/g)) out.add(`${m[1][0]}${m[2]}`);
  return out;
};
const overlaps = (a: string, b: string) => {
  const wa = words(a);
  for (const w of words(b)) if (wa.has(w)) return true;
  return false;
};

/* ---- Question makers. Each returns every question it can make; tests sample from them. ---- */

type Maker = (rand: () => number) => Question[];

const provisionTitle = (acts: ActId[]): Maker => (rand) => {
  const pool = PROVISIONS.filter((p) => p.actId !== "ipc");
  return PROVISIONS.filter((p) => acts.includes(p.actId)).flatMap((p) => {
    const o = options(p.title, pool.filter((q) => q !== p).map((q) => q.title), rand);
    if (!o) return [];
    return [{
      id: `prov:${p.actId}:${p.section}`,
      prompt: `${p.section} of ${actName(p.actId)} deals with:`,
      ...o,
      explanation: p.commentary,
      source: `${p.section}, ${actName(p.actId)}`,
    }];
  });
};

const reportable = PREVIEW_CASES.filter((c) => c.sourceUrl);

/** A topic must say enough to point at one judgment. */
const specific = (topic: string) => topic.split(/\s+/).length >= 6;

const caseForTopic: Maker = (rand) =>
  reportable.filter((c) => specific(c.topic)).flatMap((c) => {
    const others = reportable.filter((d) => d !== c && !overlaps(c.topic, d.topic) && !overlaps(c.title, d.topic));
    const o = options(c.title, others.map((d) => d.title), rand);
    if (!o) return [];
    return [{
      id: `case:${c.citation}`,
      prompt: `Which judgment is the authority for: ${c.topic.replace(/\.$/, "")}?`,
      ...o,
      explanation: `${c.title}, ${c.citation} (${c.court}): ${c.topic}.`,
      source: `${c.title}, ${c.citation}`,
      sourceUrl: c.sourceUrl,
    }];
  });

const topicForCase: Maker = (rand) =>
  reportable.flatMap((c) => {
    const short = (t: string) => t.replace(/\s+—\s+.*$/, "");
    const others = reportable.filter((d) => d !== c && !overlaps(c.topic, d.topic) && !overlaps(d.topic, c.title));
    const o = options(short(c.topic), others.map((d) => short(d.topic)), rand);
    if (!o) return [];
    return [{
      id: `topic:${c.citation}`,
      prompt: `${c.title}, ${c.citation}, is known for:`,
      ...o,
      explanation: `${c.title} (${c.court}): ${c.topic}.`,
      source: `${c.title}, ${c.citation}`,
      sourceUrl: c.sourceUrl,
    }];
  });

const ipcToBns: Maker = (rand) => {
  const rows = IPC_BNS.filter((r) => r.bns);
  return rows.flatMap((r) => {
    const o = options(`Section ${r.bns} BNS`, rows.filter((s) => s !== r).map((s) => `Section ${s.bns} BNS`), rand);
    if (!o) return [];
    return [{
      id: `ipc:${r.ipc}`,
      prompt: `Section ${r.ipc} IPC (${r.offence.toLowerCase()}) is now:`,
      ...o,
      explanation: `Section ${r.ipc} IPC corresponds to Section ${r.bns} of the Bharatiya Nyaya Sanhita, 2023, in force from 1 July 2024.${r.note ? ` ${r.note}` : ""}`,
      source: "IPC to BNS table, two published tables in agreement",
    }];
  });
};

// Periods that are not the answer for the entry asked about are always wrong, so they can pad the pool.
const EXTRA_PERIODS = ["Six months", "Two years", "Five years", "Sixty days"];

/** Escape text for use inside a regular expression. */
const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Blank out the answer where the question text would give it away: the
 * answer itself (singular or plural), and for limitation questions any
 * period phrase ("thirty days", "90 days").
 */
function blankAnswer(text: string, answer: string, periods = false): string {
  const stem = answer.replace(/s$/i, "");
  let out = text.replace(new RegExp(`\\b${escapeRx(stem)}s?\\b`, "gi"), "____");
  if (periods) {
    out = out.replace(/\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|sixty|ninety|hundred)(?:[\s-]+\w+)?\s+(?:days?|months?|years?)\b/gi, "____");
  }
  return out;
}

/** True when the prompt still contains the answer after blanking. */
const givesAway = (prompt: string, answer: string) => {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return n(answer).length > 3 && n(prompt).includes(n(answer));
};

const limitationPeriod: Maker = (rand) =>
  LIMITATION_ENTRIES.flatMap((e) => {
    const answer = periodLabel(e.period);
    const pool = [...new Set([...LIMITATION_ENTRIES.map((x) => periodLabel(x.period)), ...EXTRA_PERIODS])].filter((p) => p !== answer);
    const o = options(answer, pool, rand);
    if (!o) return [];
    const prompt = `${e.article}: ${blankAnswer(e.description.replace(/\.$/, ""), answer, true)}. The period is:`;
    if (givesAway(prompt, answer)) return [];
    return [{
      id: `lim:${e.id}`,
      prompt,
      ...o,
      explanation: `${e.article}: ${answer}, running from: ${e.runsFrom}`,
      source: e.source.name,
      sourceUrl: e.source.url,
    }];
  });

const limitationStart: Maker = (rand) =>
  LIMITATION_ENTRIES.flatMap((e) => {
    const o = options(e.runsFrom, LIMITATION_ENTRIES.filter((x) => x !== e).map((x) => x.runsFrom), rand);
    if (!o) return [];
    return [{
      id: `limstart:${e.id}`,
      prompt: `${e.article} (${e.label.toLowerCase()}): time begins to run`,
      ...o,
      explanation: `${e.article}, ${periodLabel(e.period)}: ${e.runsFrom}`,
      source: e.source.name,
      sourceUrl: e.source.url,
    }];
  });

/**
 * The provisions a cite names, as "act|provision" keys: "Order XVIII Rule 4 CPC;
 * Section 143, Bharatiya Sakshya Adhiniyam, 2023" gives "cpc|order xviii rule 4"
 * and "bsa|section 143". Used so a wrong option never names part of the answer.
 */
function provisionKeys(cite: string): string[] {
  return cite.split(";").flatMap((part) => {
    const p = part.toLowerCase();
    const act = /code of civil procedure|\bcpc\b/.test(p) ? "cpc" : /sakshya|\bbsa\b/.test(p) ? "bsa" : /constitution/.test(p) ? "const" : "other";
    const m = p.match(/(order [ivxl]+(?: rules? [\w()–-]+)?|section \d+[a-z]?(?:\([\w]+\))?|article \d+[a-z]?)/);
    return m ? [`${act}|${m[1].trim()}`] : [];
  });
}

/** Two cites overlap when one names a provision the other names, or a part of it (Order VIII and Order VIII Rule 1). */
function citesOverlap(a: string, b: string): boolean {
  const ka = provisionKeys(a);
  const kb = provisionKeys(b);
  return ka.some((x) => kb.some((y) => x === y || x.startsWith(`${y} `) || y.startsWith(`${x} `)));
}

const documentProvision: Maker = (rand) =>
  DOCUMENTS.flatMap((d) => {
    const pool = DOCUMENTS.filter((x) => x !== d && !citesOverlap(x.provision.cite, d.provision.cite)).map((x) => x.provision.cite);
    const o = options(d.provision.cite, pool, rand);
    if (!o) return [];
    return [{
      id: `doc:${d.slug}`,
      prompt: `${d.name}: which provision governs it?`,
      ...o,
      explanation: `${d.provision.cite}: ${d.provision.gist}`,
      source: `${d.name}, Shisho document page`,
    }];
  });

const clerkTerm: Maker = (rand) =>
  CLERK_MANUAL.flatMap((e) => {
    const o = options(e.name, CLERK_MANUAL.filter((x) => x !== e).map((x) => x.name), rand);
    if (!o) return [];
    const prompt = `Which duty is this? “${blankAnswer(e.description, e.name)}”`;
    if (givesAway(prompt, e.name)) return [];
    return [{
      id: `clerk:${e.sno}`,
      prompt,
      ...o,
      explanation: `${e.name}: ${e.description}`,
      source: "Advocate Clerks' manual",
    }];
  });

const MAKERS: Record<ExamId, Maker[]> = {
  clat: [provisionTitle(["constitution", "contract-act"]), caseForTopic, topicForCase],
  judicial: [provisionTitle(["cpc", "bsa", "contract-act", "arbitration-act", "commercial-courts-act", "ni-act", "hindu-succession-act", "constitution"]), ipcToBns, limitationPeriod, limitationStart, documentProvision, caseForTopic],
  "court-staff": [clerkTerm, limitationPeriod, limitationStart, documentProvision, provisionTitle(["cpc"])],
};

/** Every question an exam can draw on (for tests and for counting). */
export function questionBank(exam: ExamId, seed = 1): Question[] {
  const rand = rng(seed);
  return MAKERS[exam].flatMap((m) => m(rand));
}

/**
 * One sitting: `length` questions, spread across the makers so no single
 * source dominates, in a seeded order. The same seed gives the same paper.
 */
export function buildTest(exam: ExamId, seed: number): Question[] {
  const e = getExam(exam)!;
  const rand = rng(seed);
  const groups = MAKERS[exam].map((m) => shuffle(m(rand), rand));
  const picked: Question[] = [];
  const used = new Set<string>();
  for (let round = 0; picked.length < e.length && groups.some((g) => g.length); round++) {
    for (const g of groups) {
      const q = g.shift();
      if (q && !used.has(q.id) && picked.length < e.length) {
        used.add(q.id);
        picked.push(q);
      }
    }
  }
  return shuffle(picked, rand);
}

export type Sitting = {
  id: string;
  exam: ExamId;
  seed: number;
  takenAt: number;
  /** The option chosen for each question, or -1 when left blank. */
  answers: number[];
  score: number;
  total: number;
  seconds: number;
};
