/**
 * Legal Library — preview data for the coming-soon page.
 *
 * Rules for this file:
 * - Real case names and citations only. Every citation here was checked against
 *   a reported source; no fabricated summaries of holdings.
 * - `topic` names the *subject* of the judgment. It is not a headnote and must
 *   not assert a holding the judgment does not contain.
 * - Where a judgment is no longer good law, say so in `topic`. A library that
 *   lists ADM Jabalpur or Naz Foundation without that note misleads a student.
 * - SCC form where the judgment is reported in SCC; the law report actually
 *   carrying it (DLT) or the neutral citation (INSC) otherwise.
 *
 * Order is thematic — constitutional foundations, then rights and equality,
 * speech and democracy, criminal process, environment and livelihood — because
 * the page renders the array as a flat list in order.
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
      "Supreme Court and High Court decisions — headnotes, ratio, and linked citations in SCC form, with the subsequent history that tells you whether it is still good law.",
  },
  {
    id: "acts",
    name: "Bare Acts",
    description:
      "Central Acts and Rules as they stand — the Constitution, CPC, Contract Act, and the criminal codes as replaced on 1 July 2024 by the Bharatiya Nyaya Sanhita, Nagarik Suraksha Sanhita and Sakshya Adhiniyam.",
  },
  {
    id: "commentary",
    name: "Commentary",
    description:
      "Plain-language notes on how a section is applied in practice, tied to the cases that interpret it — with the repealed IPC, CrPC and Evidence Act provisions mapped to their successors.",
  },
];

export const PREVIEW_CASES: PreviewCase[] = [
  // --- Constitutional foundations -----------------------------------------
  {
    title: "Kesavananda Bharati v. State of Kerala",
    citation: "(1973) 4 SCC 225",
    court: "Supreme Court",
    topic: "Basic structure — limits on Parliament's amending power",
  },
  {
    title: "Minerva Mills v. Union of India",
    citation: "(1980) 3 SCC 625",
    court: "Supreme Court",
    topic:
      "Basic structure — balance between Fundamental Rights and Directive Principles",
  },
  {
    title: "Maneka Gandhi v. Union of India",
    citation: "(1978) 1 SCC 248",
    court: "Supreme Court",
    topic: "Article 21 — procedure must be fair, just and reasonable",
  },
  {
    title: "ADM Jabalpur v. Shivkant Shukla",
    citation: "(1976) 2 SCC 521",
    court: "Supreme Court",
    topic:
      "Habeas corpus during the Emergency — expressly overruled in Puttaswamy (2017)",
  },
  {
    title: "S.R. Bommai v. Union of India",
    citation: "(1994) 3 SCC 1",
    court: "Supreme Court",
    topic: "Article 356 — judicial review of President's Rule; federalism and secularism",
  },
  {
    title: "Indra Sawhney v. Union of India",
    citation: "1992 Supp (3) SCC 217",
    court: "Supreme Court",
    topic: "Reservation — OBC quota, creamy layer, and the 50% ceiling",
  },

  // --- Rights, dignity, equality -------------------------------------------
  {
    title: "K.S. Puttaswamy v. Union of India",
    citation: "(2017) 10 SCC 1",
    court: "Supreme Court",
    topic: "Privacy as a fundamental right under Articles 14, 19 and 21",
  },
  {
    title: "Vishaka v. State of Rajasthan",
    citation: "(1997) 6 SCC 241",
    court: "Supreme Court",
    topic: "Workplace harassment — guidelines under Article 141",
  },
  {
    title: "Shayara Bano v. Union of India",
    citation: "(2017) 9 SCC 1",
    court: "Supreme Court",
    topic: "Talaq-e-biddat — instant triple talaq set aside",
  },
  {
    title: "National Legal Services Authority v. Union of India",
    citation: "(2014) 5 SCC 438",
    court: "Supreme Court",
    topic: "Gender identity — legal recognition of transgender persons",
  },
  {
    title: "Naz Foundation v. Govt. of NCT of Delhi",
    citation: "160 (2009) DLT 277",
    court: "Delhi High Court",
    topic:
      "Section 377 IPC read down — reversed in 2013, vindicated by Navtej (2018)",
  },
  {
    title: "Navtej Singh Johar v. Union of India",
    citation: "(2018) 10 SCC 1",
    court: "Supreme Court",
    topic: "Section 377 IPC — dignity and sexual autonomy",
  },
  {
    title: "Joseph Shine v. Union of India",
    citation: "(2019) 3 SCC 39",
    court: "Supreme Court",
    topic: "Section 497 IPC — adultery decriminalised",
  },
  {
    title: "Indian Young Lawyers Assn. v. State of Kerala",
    citation: "(2019) 11 SCC 1",
    court: "Supreme Court",
    topic: "Sabarimala — temple entry, Article 25 and essential religious practice",
  },
  {
    title: "Supriyo v. Union of India",
    citation: "2023 INSC 920",
    court: "Supreme Court",
    topic: "Marriage equality — right to marry held statutory, not constitutional",
  },
  {
    title: "Vineeta Sharma v. Rakesh Sharma",
    citation: "(2020) 9 SCC 1",
    court: "Supreme Court",
    topic:
      "Hindu Succession Act, Section 6 — daughters are coparceners by birth",
  },
  {
    title: "Common Cause v. Union of India",
    citation: "(2018) 5 SCC 1",
    court: "Supreme Court",
    topic: "Living will and passive euthanasia under Article 21",
  },

  // --- Speech, information, democracy --------------------------------------
  {
    title: "Shreya Singhal v. Union of India",
    citation: "(2015) 5 SCC 1",
    court: "Supreme Court",
    topic: "Section 66A, IT Act — vagueness and the limits on online speech",
  },
  {
    title: "Anuradha Bhasin v. Union of India",
    citation: "(2020) 3 SCC 637",
    court: "Supreme Court",
    topic: "Internet shutdowns — proportionality and publication of orders",
  },
  {
    title: "Association for Democratic Reforms v. Union of India",
    citation: "(2024) 5 SCC 1",
    court: "Supreme Court",
    topic: "Electoral bonds struck down — the voter's right to information",
  },

  // --- Criminal process -----------------------------------------------------
  {
    title: "Bachan Singh v. State of Punjab",
    citation: "(1980) 2 SCC 684",
    court: "Supreme Court",
    topic: "Death penalty — the 'rarest of rare' test",
  },
  {
    title: "D.K. Basu v. State of West Bengal",
    citation: "(1997) 1 SCC 416",
    court: "Supreme Court",
    topic: "Arrest and custodial safeguards; compensation for custodial violence",
  },
  {
    title: "Lalita Kumari v. Govt. of Uttar Pradesh",
    citation: "(2014) 2 SCC 1",
    court: "Supreme Court",
    topic: "Registration of FIR is mandatory for a cognizable offence",
  },
  {
    title: "Selvi v. State of Karnataka",
    citation: "(2010) 7 SCC 263",
    court: "Supreme Court",
    topic: "Narcoanalysis and polygraph testing against Article 20(3)",
  },

  // --- Environment, livelihood ----------------------------------------------
  {
    title: "M.C. Mehta v. Union of India",
    citation: "(1987) 1 SCC 395",
    court: "Supreme Court",
    topic: "Article 21 — absolute liability for hazardous industry",
  },
  {
    title: "Vellore Citizens' Welfare Forum v. Union of India",
    citation: "(1996) 5 SCC 647",
    court: "Supreme Court",
    topic: "Precautionary principle and polluter pays as part of Indian law",
  },
  {
    title: "Olga Tellis v. Bombay Municipal Corporation",
    citation: "(1985) 3 SCC 545",
    court: "Supreme Court",
    topic: "Right to livelihood as part of Article 21",
  },
];
