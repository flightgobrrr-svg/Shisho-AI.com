/**
 * The two courses. All legal vocabulary here is Indian — statutes are cited by
 * their Indian short titles and procedural terms follow CPC/CrPC/BNSS usage.
 *
 * NOTE: "motion practice" from the original brief is US terminology; Indian
 * courts hear interlocutory/miscellaneous applications. Renamed accordingly.
 */

export type Course = {
  id: "starter" | "proficient";
  name: string;
  level: string;
  /* TODO: confirm — duration and module count are proposed, not supplied. */
  duration: string;
  modules: number;
  summary: string;
  syllabus: { title: string; detail: string }[];
  included: string[];
};

export const COURSES: Course[] = [
  {
    id: "starter",
    name: "Starter",
    level: "Foundations",
    duration: "6 weeks · self-paced",
    modules: 6,
    summary:
      "How to read law, how to reason from it, and how to put the first document on paper.",
    syllabus: [
      {
        title: "Reading a brief",
        detail:
          "What the client said, and what the file actually proves — separating instructions from evidence before you draft anything.",
      },
      {
        title: "Legal reasoning",
        detail:
          "Ratio decidendi and obiter dicta; how precedent binds under Article 141 of the Constitution.",
      },
      {
        title: "Pleadings",
        detail:
          "The plaint, the written statement, and the rejoinder — structure, prayer, and verification under Order VI and VII CPC.",
      },
      {
        title: "Procedure before merits",
        detail:
          "Limitation, court fee, territorial jurisdiction, and Section 12A pre-institution mediation under the Commercial Courts Act, 2015.",
      },
      {
        title: "Affidavits & verification",
        detail:
          "Vakalatnama, the verification clause, and the objections a registry raises before a matter is even listed.",
      },
      {
        title: "Assessment",
        detail:
          "File a complete suit under Order VII CPC, marked line by line in the Shisho margin style.",
      },
    ],
    included: [
      "6 modules with worked examples",
      "Shisho review on every drafting exercise",
      "Model answers marked in the Shisho margin style",
    ],
  },
  {
    id: "proficient",
    name: "Proficient",
    level: "Advanced",
    duration: "10 weeks · self-paced",
    modules: 6,
    summary:
      "Interim relief, commercial drafting, and how a matter is actually run from filing to hearing.",
    syllabus: [
      {
        title: "The triple test",
        detail:
          "Prima facie case, balance of convenience, and irreparable loss — pleaded and argued as three distinct limbs under Order XXXIX Rules 1–2 CPC.",
      },
      {
        title: "Ex parte ad-interim relief",
        detail:
          "When a court will grant an order before hearing the other side, and the uncompromising duty of full and fair disclosure that comes with it.",
      },
      {
        title: "Arbitration",
        detail:
          "Sections 9 and 11 of the Arbitration and Conciliation Act, 1996, and the arbitrability test after Vidya Drolia v. Durga Trading Corporation, (2021) 2 SCC 1.",
      },
      {
        title: "Contract drafting",
        detail:
          "Drafting and reviewing under the Indian Contract Act 1872, with remedies under the Specific Relief Act 1963.",
      },
      {
        title: "Advanced pleadings",
        detail:
          "Written statements, counter-claims, rejoinders, and amendment of pleadings under Order VI Rule 17 CPC.",
      },
      {
        title: "Assessment",
        detail:
          "Argue a full interim application, marked line by line, before a retired district judge.",
      },
    ],
    included: [
      "6 modules with real pleading sets",
      "Priority Shisho with citation checks",
      "Drafting templates for pleadings and contracts",
    ],
  },
];

/** The intro under "Two courses, one mentor." on /courses (website and app). */
export const COURSES_INTRO =
  "Both tracks are built entirely on Indian law — the Constitution, the CPC, the Indian Contract Act, and the authorities that actually bind an Indian court. Every drafting exercise comes back marked.";

/** "Before you begin" on /courses (website and app). */
export const COURSES_FAQS = [
  {
    q: "Do I need to be enrolled in a law school?",
    a: "No. The Starter course assumes no prior legal training, though it moves quickly. Proficient assumes you can read a judgment and follow a pleading.",
  },
  {
    q: "Is this a substitute for legal advice?",
    a: "No. Shisho AI is an educational and drafting tool. It does not provide legal advice and is not a substitute for a licensed, practising advocate.",
  },
];

/** The case-brief sample beside "For law students" on /courses. */
export const CASE_BRIEF_SAMPLE = {
  label: "Case brief",
  rows: [
    { term: "Facts", detail: "What happened, in order" },
    { term: "Issue", detail: "The question for the court" },
    { term: "Held", detail: "What the court decided" },
    { term: "Ratio", detail: "The rule it rests on" },
  ],
};
