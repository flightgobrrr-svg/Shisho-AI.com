/**
 * Legal Library — preview data for the coming-soon page.
 * Real case names and citations only; no fabricated summaries of holdings.
 */

export type LibraryCollection = {
  id: string;
  name: string;
  description: string;
};

export type PreviewCase = {
  title: string;
  citation: string;
  court: string;
  topic: string;
};

export const COLLECTIONS: LibraryCollection[] = [
  {
    id: "judgments",
    name: "Judgments",
    description:
      "Supreme Court and High Court decisions — headnotes, ratio, and linked citations in SCC form.",
  },
  {
    id: "acts",
    name: "Bare Acts",
    description:
      "Central Acts and Rules as they stand — Constitution, CPC, CrPC, Contract Act, and more.",
  },
  {
    id: "commentary",
    name: "Commentary",
    description:
      "Plain-language notes on how a section is applied in practice, tied to the cases that interpret it.",
  },
];

export const PREVIEW_CASES: PreviewCase[] = [
  {
    title: "Maneka Gandhi v. Union of India",
    citation: "(1978) 1 SCC 248",
    court: "Supreme Court",
    topic: "Article 21 — procedure must be fair, just and reasonable",
  },
  {
    title: "Kesavananda Bharati v. State of Kerala",
    citation: "(1973) 4 SCC 225",
    court: "Supreme Court",
    topic: "Basic structure — limits on Parliament's amending power",
  },
  {
    title: "Vishaka v. State of Rajasthan",
    citation: "(1997) 6 SCC 241",
    court: "Supreme Court",
    topic: "Workplace harassment — guidelines under Article 141",
  },
  {
    title: "M.C. Mehta v. Union of India",
    citation: "(1987) 1 SCC 395",
    court: "Supreme Court",
    topic: "Article 21 — absolute liability for hazardous industry",
  },
  {
    title: "Navtej Singh Johar v. Union of India",
    citation: "(2018) 10 SCC 1",
    court: "Supreme Court",
    topic: "Section 377 IPC — dignity and sexual autonomy",
  },
  {
    title: "Common Cause v. Union of India",
    citation: "(2018) 5 SCC 1",
    court: "Supreme Court",
    topic: "Living will and passive euthanasia under Article 21",
  },
];
