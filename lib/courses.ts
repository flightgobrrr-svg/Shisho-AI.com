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
    modules: 8,
    summary:
      "How to read law, how to reason from it, and how to put the first document on paper.",
    syllabus: [
      {
        title: "Legal reasoning",
        detail:
          "Ratio decidendi and obiter dicta; how precedent binds under Article 141 of the Constitution.",
      },
      {
        title: "Reading a judgment",
        detail:
          "Working through a Supreme Court decision — facts, issues, holding, and what actually binds you.",
      },
      {
        title: "Case briefing",
        detail:
          "Briefing an authority so it can be used in argument, and citing it correctly in SCC form.",
      },
      {
        title: "Introductory drafting",
        detail:
          "A first legal notice and a simple plaint under Order VII CPC — structure, prayer, and verification.",
      },
    ],
    included: [
      "8 modules with worked examples",
      "Draft Bot review on every drafting exercise",
      "Model answers marked in the Shisho margin style",
    ],
  },
  {
    id: "proficient",
    name: "Proficient",
    level: "Advanced",
    duration: "10 weeks · self-paced",
    modules: 12,
    summary:
      "Interim relief, commercial drafting, and how a matter is actually run from filing to hearing.",
    syllabus: [
      {
        title: "Interlocutory applications & interim relief",
        detail:
          "Temporary injunctions under Order XXXIX Rules 1–2 CPC, stay applications, and the inherent power under Section 151 CPC.",
      },
      {
        title: "Contract drafting",
        detail:
          "Drafting and reviewing under the Indian Contract Act 1872, with remedies under the Specific Relief Act 1963.",
      },
      {
        title: "Litigation strategy",
        detail:
          "Choosing the forum, pleading jurisdiction, limitation, and when an alternate remedy will sink a writ.",
      },
      {
        title: "Advanced pleadings",
        detail:
          "Written statements, counter-claims, rejoinders, and amendment of pleadings under Order VI Rule 17 CPC.",
      },
    ],
    included: [
      "12 modules with real pleading sets",
      "Priority Draft Bot with citation checks",
      "Drafting templates for pleadings and contracts",
    ],
  },
];
