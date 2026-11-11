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

/**
 * The six thematic sections this file was already organised into (see the
 * "Order is thematic" note above) — made into real, filterable data instead
 * of just a reading order. Nothing invented: each case's category below is
 * exactly the section comment it already sat under.
 */
export const CATEGORIES = [
  "Constitutional foundations",
  "Rights, dignity, equality",
  "Speech, information, democracy",
  "Criminal process",
  "Environment, livelihood",
  "Commercial law, civil procedure",
] as const;

export type LibraryCategory = (typeof CATEGORIES)[number];

export function isCategory(v: unknown): v is LibraryCategory {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

export type PreviewCase = {
  title: string;
  citation: string;
  court: string;
  topic: string;
  category: LibraryCategory;
  /**
   * A verified Indian Kanoon document URL for this exact judgment — checked
   * one at a time (found via web search, then confirmed the title/citation/
   * year on the page actually match), not derived from a formula. Absent
   * means not yet verified, not "doesn't exist" — components/library/
   * LibrarySearch.tsx falls back to a search link for those, worded to
   * match: a direct link says "read", a fallback search says "find".
   */
  sourceUrl?: string;
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
      "The provisions Shisho is actually built on, stated plainly — the Constitution, CPC, Contract Act, Arbitration Act, and the criminal codes as replaced on 1 July 2024. Not the full text of any Act; the sections this product cites, section by section.",
  },
  {
    id: "commentary",
    name: "Commentary",
    description:
      "Plain-language notes on how each of those sections plays out in practice, tied to the cases that interpret it — including where the new Bharatiya Nyaya Sanhita carried a repealed IPC provision forward, and where it didn't.",
  },
];

export const PREVIEW_CASES: PreviewCase[] = [
  // --- Constitutional foundations -----------------------------------------
  {
    title: "Kesavananda Bharati v. State of Kerala",
    citation: "(1973) 4 SCC 225",
    court: "Supreme Court",
    topic: "Basic structure — limits on Parliament's amending power",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/257876/",
  },
  {
    title: "Minerva Mills v. Union of India",
    citation: "(1980) 3 SCC 625",
    court: "Supreme Court",
    topic:
      "Basic structure — balance between Fundamental Rights and Directive Principles",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1939993/",
  },
  {
    title: "Maneka Gandhi v. Union of India",
    citation: "(1978) 1 SCC 248",
    court: "Supreme Court",
    topic: "Article 21 — procedure must be fair, just and reasonable",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1766147/",
  },
  {
    title: "ADM Jabalpur v. Shivkant Shukla",
    citation: "(1976) 2 SCC 521",
    court: "Supreme Court",
    topic:
      "Habeas corpus during the Emergency — expressly overruled in Puttaswamy (2017)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/165099707/",
  },
  {
    title: "S.R. Bommai v. Union of India",
    citation: "(1994) 3 SCC 1",
    court: "Supreme Court",
    topic: "Article 356 — judicial review of President's Rule; federalism and secularism",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/60799/",
  },
  {
    title: "Indra Sawhney v. Union of India",
    citation: "1992 Supp (3) SCC 217",
    court: "Supreme Court",
    topic: "Reservation — OBC quota, creamy layer, and the 50% ceiling",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1363234/",
  },
  {
    title: "I.C. Golaknath v. State of Punjab",
    citation: "AIR 1967 SC 1643",
    court: "Supreme Court",
    topic:
      "Parliament cannot amend Fundamental Rights — the position Kesavananda Bharati later replaced with the basic structure test",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/120358/",
  },
  {
    title: "I.R. Coelho v. State of Tamil Nadu",
    citation: "(2007) 2 SCC 1",
    court: "Supreme Court",
    topic:
      "Ninth Schedule laws added after 24 April 1973 are still open to basic structure review",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/322504/",
  },
  {
    title: "Kihoto Hollohan v. Zachillhu",
    citation: "1992 Supp (2) SCC 651",
    court: "Supreme Court",
    topic:
      "Tenth Schedule (anti-defection law) upheld; the bar on judicial review of the Speaker's decision struck down as against the basic structure",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1686885/",
  },
  {
    title: "S.P. Gupta v. Union of India",
    citation: "AIR 1982 SC 149",
    court: "Supreme Court",
    topic:
      "The First Judges case — executive given primacy over the Chief Justice in judicial appointments, and PIL standing liberalised; primacy reversed by the Second Judges case (1993)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/112850760/",
  },
  {
    title: "Supreme Court Advocates-on-Record Assn. v. Union of India",
    citation: "(1993) 4 SCC 441",
    court: "Supreme Court",
    topic:
      "The Second Judges case — the Chief Justice's collegium, not the executive, given primacy in judicial appointments; the origin of the collegium system",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/753224/",
  },
  {
    title: "Supreme Court Advocates-on-Record Assn. v. Union of India (NJAC case)",
    citation: "(2016) 5 SCC 1",
    court: "Supreme Court",
    topic:
      "Struck down the 99th Amendment and the NJAC Act, restoring the collegium — judicial independence is part of the basic structure",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/66970168/",
  },
  {
    title: "A.K. Gopalan v. State of Madras",
    citation: "AIR 1950 SC 27",
    court: "Supreme Court",
    topic:
      "Upheld preventive detention, reading Article 21's 'procedure established by law' narrowly and treating Articles 14, 19 and 21 as watertight compartments — the compartmentalised approach was rejected in R.C. Cooper (1970) and the due-process reading superseded by Maneka Gandhi (1978)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1857950/",
  },
  {
    title: "Chiranjit Lal Chowdhuri v. Union of India",
    citation: "AIR 1951 SC 41",
    court: "Supreme Court",
    topic:
      "First major Article 14 case; upheld the takeover of the Sholapur Spinning Co., holding a single company can form a valid class and that economic legislation carries a presumption of constitutionality",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/4354/",
  },
  {
    title: "Shankari Prasad v. Union of India",
    citation: "AIR 1951 SC 458",
    court: "Supreme Court",
    topic:
      "First challenge to a constitutional amendment; held Parliament's Article 368 constituent power extends to Part III fundamental rights and such amendments are not 'law' under Article 13(2) — doubted in Golaknath (1967) and superseded by the basic structure doctrine in Kesavananda Bharati (1973)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1706770/",
  },
  {
    title: "In re: The Delhi Laws Act, 1912",
    citation: "AIR 1951 SC 332",
    court: "Supreme Court",
    topic:
      "Seven-judge presidential reference on the limits of delegated legislation; held a legislature may delegate ancillary rule-making but not its essential function of laying down legislative policy",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/306099/",
  },
  {
    title: "State of Madras v. V.G. Row",
    citation: "AIR 1952 SC 196",
    court: "Supreme Court",
    topic:
      "Struck down a law letting the executive ban associations without prior judicial scrutiny; laid down the multi-factor test for whether a restriction on a Part III right is 'reasonable' under Article 19",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/554839/",
  },
  {
    title: "Ram Jawaya Kapur v. State of Punjab",
    citation: "AIR 1955 SC 549",
    court: "Supreme Court",
    topic:
      "Held the Constitution does not embody a rigid separation of powers; executive power is co-extensive with the legislature's and may be exercised without specific legislative sanction within its competence",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1318432/",
  },
  {
    title: "In Re: Berubari Union",
    citation: "AIR 1960 SC 845",
    court: "Supreme Court",
    topic:
      "Presidential reference under Article 143 holding that ceding Indian territory to another country requires a constitutional amendment under Article 368, not merely a law under Article 3",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1120103/",
  },
  {
    title: "Atiabari Tea Co. Ltd. v. State of Assam",
    citation: "AIR 1961 SC 232",
    court: "Supreme Court",
    topic:
      "Held the freedom of trade, commerce and intercourse under Article 301 extends to taxing statutes that directly and immediately restrict movement of goods across states — refined shortly after in Automobile Transport (1962)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/128161/",
  },
  {
    title: "Automobile Transport (Rajasthan) Ltd. v. State of Rajasthan",
    citation: "AIR 1962 SC 1406",
    court: "Supreme Court",
    topic:
      "Qualified Atiabari Tea Co.: compensatory taxes charged for the use of trading facilities (e.g., roads) do not offend the Article 301 freedom of interstate trade",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/304499/",
  },
  {
    title: "State of West Bengal v. Union of India",
    citation: "AIR 1963 SC 1241",
    court: "Supreme Court",
    topic:
      "Held the Union can compulsorily acquire a State's property under a central law and that Indian states possess no independent sovereignty vis-à-vis the Union — its account of Indian federalism was later qualified by S.R. Bommai (1994)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/603736/",
  },
  {
    title: "Sajjan Singh v. State of Rajasthan",
    citation: "AIR 1965 SC 845",
    court: "Supreme Court",
    topic:
      "Reaffirmed Shankari Prasad that Parliament's Article 368 power extends to amending fundamental rights; Justice Mudholkar's concurrence first floated an unamendable 'basic structure' — the majority position was overturned two years later in Golaknath (1967)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1308308/",
  },
  {
    title: "Rustom Cavasjee Cooper v. Union of India",
    citation: "(1970) 1 SCC 248",
    court: "Supreme Court",
    topic:
      "Bank Nationalisation case: struck down the compensation scheme for nationalising 14 banks; rejected A.K. Gopalan's compartmentalised view of fundamental rights in favour of testing a law's direct effect across Articles 14, 19 and 31 together",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/513801/",
  },
  {
    title: "Madhav Rao Jivaji Rao Scindia v. Union of India",
    citation: "(1971) 1 SCC 85",
    court: "Supreme Court",
    topic:
      "Privy Purses case: struck down the presidential order derecognising former rulers of princely states and stopping their privy purses as ultra vires Article 366(22); the result was legislatively reversed by the 26th Amendment, 1971",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/660275/",
  },
  {
    title: "Indira Nehru Gandhi v. Raj Narain",
    citation: "1975 Supp SCC 1",
    court: "Supreme Court",
    topic:
      "Applied the basic structure doctrine for the first time to strike down part of a constitutional amendment, holding clause (4) of Article 329A (39th Amendment, insulating the PM's election from judicial scrutiny) void for destroying free elections and judicial review as basic features",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/936707/",
  },
  {
    title: "Union of India v. Sankalchand Himatlal Sheth",
    citation: "(1977) 4 SCC 193",
    court: "Supreme Court",
    topic:
      "Held the President can transfer a High Court judge under Article 222 without the judge's consent, and that 'consultation' with the Chief Justice of India does not mean 'concurrence' — the weight given to the CJI's view was substantially increased in the later Judges cases",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/4572688/",
  },
  {
    title: "State of Rajasthan v. Union of India",
    citation: "(1977) 3 SCC 592",
    court: "Supreme Court",
    topic:
      "Upheld the Union's 1977 direction to Congress-run states to seek fresh mandates, holding the President's 'satisfaction' under Article 356 is largely non-justiciable absent mala fides — this deferential approach was substantially cut back by S.R. Bommai (1994)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/174974/",
  },
  {
    title: "Waman Rao v. Union of India",
    citation: "(1981) 2 SCC 362",
    court: "Supreme Court",
    topic:
      "Applied Kesavananda's basic structure doctrine to the Ninth Schedule, holding laws inserted before 24 April 1973 are immune from challenge while later insertions remain open to basic-structure review — the cut-off's practical effect was curtailed by I.R. Coelho (2007)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/799151/",
  },
  {
    title: "T.N. Seshan, Chief Election Commissioner of India v. Union of India",
    citation: "(1995) 4 SCC 611",
    court: "Supreme Court",
    topic:
      "Upheld conversion of the Election Commission into a multi-member body and rejected the Chief Election Commissioner's claim to primacy or veto over the other Election Commissioners",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1890680/",
  },
  {
    title: "L. Chandra Kumar v. Union of India",
    citation: "(1997) 3 SCC 261",
    court: "Supreme Court",
    topic:
      "Held that tribunals under Articles 323A/323B cannot wholly exclude the judicial review jurisdiction of the High Courts and Supreme Court, since that review is part of the basic structure; tribunal orders remain subject to a Division Bench of the jurisdictional High Court",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1152518/",
  },
  {
    title: "Naga People's Movement of Human Rights v. Union of India",
    citation: "(1998) 2 SCC 109",
    court: "Supreme Court",
    topic:
      "Upheld the constitutional validity of the Armed Forces (Special Powers) Act, 1958, while laying down binding safeguards on its exercise and requiring periodic review of 'disturbed area' declarations",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/1072165/",
  },
  {
    title: "P.V. Narasimha Rao v. State (CBI/SPE)",
    citation: "(1998) 4 SCC 626",
    court: "Supreme Court",
    topic:
      "Held by majority that MPs who took bribes to vote in a confidence motion were immune from prosecution under Article 105(2) — this bribery immunity was overruled by a seven-judge bench in Sita Soren v. Union of India (2024)",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/45852197/",
  },
  {
    title: "Rameshwar Prasad v. Union of India",
    citation: "(2006) 2 SCC 1",
    court: "Supreme Court",
    topic:
      "Held the 2005 dissolution of the Bihar Legislative Assembly before its first sitting — ordered on the Governor's report apprehending unlawful government formation — unconstitutional, reaffirming that Article 356 satisfaction is judicially reviewable for mala fides or irrelevant grounds",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/79280249/",
  },
  {
    title: "Raja Ram Pal v. Hon'ble Speaker, Lok Sabha",
    citation: "(2007) 3 SCC 184",
    court: "Supreme Court",
    topic:
      "Upheld Parliament's power under Article 105(3) to expel members in the 'cash-for-query' scandal, while holding parliamentary proceedings remain subject to judicial review where there is substantial illegality or unconstitutionality",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/647343/",
  },
  {
    title: "Union of India v. R. Gandhi, President, Madras Bar Association",
    citation: "(2010) 11 SCC 1",
    court: "Supreme Court",
    topic:
      "Upheld Parliament's power to shift company-law adjudication from High Courts to the NCLT/NCLAT, but struck down provisions giving the executive excessive control over the tribunals' composition and tenure as threatening judicial independence",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/748977/",
  },
  {
    title: "Government of NCT of Delhi v. Union of India",
    citation: "(2018) 8 SCC 501",
    court: "Supreme Court",
    topic:
      "Held the Lieutenant Governor of Delhi has no independent decision-making power and must act on the aid and advice of the Delhi Council of Ministers on all matters within the Assembly's competence, except land, police and public order",
    category: "Constitutional foundations",
    sourceUrl: "https://indiankanoon.org/doc/144413017/",
  },

  // --- Rights, dignity, equality -------------------------------------------
  {
    title: "K.S. Puttaswamy v. Union of India",
    citation: "(2017) 10 SCC 1",
    court: "Supreme Court",
    topic: "Privacy as a fundamental right under Articles 14, 19 and 21",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/91938676/",
  },
  {
    title: "Vishaka v. State of Rajasthan",
    citation: "(1997) 6 SCC 241",
    court: "Supreme Court",
    topic: "Workplace harassment — guidelines under Article 141",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/1031794/",
  },
  {
    title: "Shayara Bano v. Union of India",
    citation: "(2017) 9 SCC 1",
    court: "Supreme Court",
    topic: "Talaq-e-biddat — instant triple talaq set aside",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/115701246/",
  },
  {
    title: "National Legal Services Authority v. Union of India",
    citation: "(2014) 5 SCC 438",
    court: "Supreme Court",
    topic: "Gender identity — legal recognition of transgender persons",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/7003259/",
  },
  {
    title: "Naz Foundation v. Govt. of NCT of Delhi",
    citation: "160 (2009) DLT 277",
    court: "Delhi High Court",
    topic:
      "Section 377 IPC read down — reversed in 2013, vindicated by Navtej (2018)",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/100472805/",
  },
  {
    title: "Navtej Singh Johar v. Union of India",
    citation: "(2018) 10 SCC 1",
    court: "Supreme Court",
    topic: "Section 377 IPC — dignity and sexual autonomy",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/168671544/",
  },
  {
    title: "Joseph Shine v. Union of India",
    citation: "(2019) 3 SCC 39",
    court: "Supreme Court",
    topic: "Section 497 IPC — adultery decriminalised",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/42184625/",
  },
  {
    title: "Indian Young Lawyers Assn. v. State of Kerala",
    citation: "(2019) 11 SCC 1",
    court: "Supreme Court",
    topic: "Sabarimala — temple entry, Article 25 and essential religious practice",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/163639357/",
  },
  {
    title: "Supriyo v. Union of India",
    citation: "2023 INSC 920",
    court: "Supreme Court",
    topic: "Marriage equality — right to marry held statutory, not constitutional",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/81084437/",
  },
  {
    title: "Vineeta Sharma v. Rakesh Sharma",
    citation: "(2020) 9 SCC 1",
    court: "Supreme Court",
    topic:
      "Hindu Succession Act, Section 6 — daughters are coparceners by birth",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/67965481/",
  },
  {
    title: "Mohd. Ahmed Khan v. Shah Bano Begum",
    citation: "(1985) 2 SCC 556",
    court: "Supreme Court",
    topic:
      "Maintenance for a divorced Muslim woman under Section 125 CrPC, regardless of personal law",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/823221/",
  },
  {
    title: "Sarla Mudgal v. Union of India",
    citation: "(1995) 3 SCC 635",
    court: "Supreme Court",
    topic:
      "Conversion to Islam does not dissolve a subsisting Hindu marriage; a second marriage remains bigamy",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/733037/",
  },
  {
    title: "R. Rajagopal v. State of Tamil Nadu",
    citation: "(1994) 6 SCC 632",
    court: "Supreme Court",
    topic:
      "The Auto Shankar case — privacy under Article 21 read against freedom of the press, before Puttaswamy (2017)",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/501107/",
  },
  {
    title: "Aruna Ramchandra Shanbaug v. Union of India",
    citation: "(2011) 4 SCC 454",
    court: "Supreme Court",
    topic:
      "First recognised passive euthanasia under strict guidelines, declining a living will — the position Common Cause (2018) later extended",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/235821/",
  },
  {
    title: "T. Sareetha v. T. Venkata Subbaiah",
    citation: "AIR 1983 AP 356",
    court: "Andhra Pradesh High Court",
    topic:
      "Section 9, Hindu Marriage Act — restitution of conjugal rights held unconstitutional; the opposite conclusion was reached by the Supreme Court in Saroj Rani (1984)",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/1987982/",
  },
  {
    title: "Saroj Rani v. Sudarshan Kumar Chadha",
    citation: "(1984) 4 SCC 90",
    court: "Supreme Court",
    topic:
      "Section 9, Hindu Marriage Act — restitution of conjugal rights held constitutional, rejecting T. Sareetha's reasoning",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/1382895/",
  },
  {
    title: "Danial Latifi v. Union of India",
    citation: "(2001) 7 SCC 740",
    court: "Supreme Court",
    topic:
      "Upheld the Muslim Women (Protection of Rights on Divorce) Act, 1986 by reading it to match Shah Bano's own maintenance standard",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/410660/",
  },
  {
    title: "Githa Hariharan v. Reserve Bank of India",
    citation: "(1999) 2 SCC 228",
    court: "Supreme Court",
    topic:
      "A mother can be a minor's natural guardian — read gender-neutrally into the Hindu Minority and Guardianship Act, 1956",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/1241462/",
  },
  {
    title: "Common Cause v. Union of India",
    citation: "(2018) 5 SCC 1",
    court: "Supreme Court",
    topic: "Living will and passive euthanasia under Article 21",
    category: "Rights, dignity, equality",
    sourceUrl: "https://indiankanoon.org/doc/184449972/",
  },

  // --- Speech, information, democracy --------------------------------------
  {
    title: "Shreya Singhal v. Union of India",
    citation: "(2015) 5 SCC 1",
    court: "Supreme Court",
    topic: "Section 66A, IT Act — vagueness and the limits on online speech",
    category: "Speech, information, democracy",
    sourceUrl: "https://indiankanoon.org/doc/110813550/",
  },
  {
    title: "Anuradha Bhasin v. Union of India",
    citation: "(2020) 3 SCC 637",
    court: "Supreme Court",
    topic: "Internet shutdowns — proportionality and publication of orders",
    category: "Speech, information, democracy",
    sourceUrl: "https://indiankanoon.org/doc/82461587/",
  },
  {
    title: "Union of India v. Association for Democratic Reforms",
    citation: "(2002) 5 SCC 294",
    court: "Supreme Court",
    topic:
      "Candidates' criminal antecedents, assets and education must be disclosed — voters' right to know under Article 19(1)(a)",
    category: "Speech, information, democracy",
    sourceUrl: "https://indiankanoon.org/doc/6396968/",
  },
  {
    title: "Lily Thomas v. Union of India",
    citation: "(2013) 7 SCC 653",
    court: "Supreme Court",
    topic:
      "Section 8(4), Representation of the People Act struck down — a convicted MP or MLA is disqualified immediately, not after an appeal window",
    category: "Speech, information, democracy",
    sourceUrl: "https://indiankanoon.org/doc/63158859/",
  },
  {
    title: "Association for Democratic Reforms v. Union of India",
    citation: "(2024) 5 SCC 1",
    court: "Supreme Court",
    topic: "Electoral bonds struck down — the voter's right to information",
    category: "Speech, information, democracy",
    sourceUrl: "https://indiankanoon.org/doc/121499464/",
  },

  // --- Criminal process -----------------------------------------------------
  {
    title: "Bachan Singh v. State of Punjab",
    citation: "(1980) 2 SCC 684",
    court: "Supreme Court",
    topic: "Death penalty — the 'rarest of rare' test",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/1235094/",
  },
  {
    title: "D.K. Basu v. State of West Bengal",
    citation: "(1997) 1 SCC 416",
    court: "Supreme Court",
    topic: "Arrest and custodial safeguards; compensation for custodial violence",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/235756/",
  },
  {
    title: "Lalita Kumari v. Govt. of Uttar Pradesh",
    citation: "(2014) 2 SCC 1",
    court: "Supreme Court",
    topic: "Registration of FIR is mandatory for a cognizable offence",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/10239019/",
  },
  {
    title: "Selvi v. State of Karnataka",
    citation: "(2010) 7 SCC 263",
    court: "Supreme Court",
    topic: "Narcoanalysis and polygraph testing against Article 20(3)",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/338008/",
  },
  {
    title: "Hussainara Khatoon v. State of Bihar",
    citation: "(1980) 1 SCC 81",
    court: "Supreme Court",
    topic:
      "Speedy trial is part of Article 21 — undertrial prisoners jailed longer than any sentence they could receive",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/1007347/",
  },
  {
    title: "Joginder Kumar v. State of U.P.",
    citation: "(1994) 4 SCC 260",
    court: "Supreme Court",
    topic:
      "Arrest is not automatic on a mere allegation — the arrested person's right to have someone informed",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/768175/",
  },
  {
    title: "Nandini Satpathy v. P.L. Dani",
    citation: "(1978) 2 SCC 424",
    court: "Supreme Court",
    topic:
      "Article 20(3) protection against self-incrimination reaches police interrogation, not only the trial",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/1938988/",
  },
  {
    title: "Arnesh Kumar v. State of Bihar",
    citation: "(2014) 8 SCC 273",
    court: "Supreme Court",
    topic:
      "Arrest requires the Section 41 CrPC checklist to actually be satisfied, not assumed — decided on Section 498A IPC dowry-harassment complaints specifically",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/2982624/",
  },
  {
    title: "State of Punjab v. Baldev Singh",
    citation: "(1999) 6 SCC 172",
    court: "Supreme Court",
    topic:
      "Section 50, NDPS Act — informing the accused of the right to be searched before a Magistrate or gazetted officer is mandatory, not directory",
    category: "Criminal process",
    sourceUrl: "https://indiankanoon.org/doc/1259796/",
  },

  // --- Environment, livelihood ----------------------------------------------
  {
    title: "M.C. Mehta v. Union of India",
    citation: "(1987) 1 SCC 395",
    court: "Supreme Court",
    topic: "Article 21 — absolute liability for hazardous industry",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/1486949/",
  },
  {
    title: "Vellore Citizens' Welfare Forum v. Union of India",
    citation: "(1996) 5 SCC 647",
    court: "Supreme Court",
    topic: "Precautionary principle and polluter pays as part of Indian law",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/1934103/",
  },
  {
    title: "Olga Tellis v. Bombay Municipal Corporation",
    citation: "(1985) 3 SCC 545",
    court: "Supreme Court",
    topic: "Right to livelihood as part of Article 21",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/709776/",
  },
  {
    title: "Indian Council for Enviro-Legal Action v. Union of India",
    citation: "(1996) 3 SCC 212",
    court: "Supreme Court",
    topic:
      "The Bichhri case — polluter pays actually quantified and ordered as compensation, not just stated as a principle",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/1818014/",
  },
  {
    title: "Subhash Kumar v. State of Bihar",
    citation: "(1991) 1 SCC 598",
    court: "Supreme Court",
    topic: "Right to pollution-free water and air read into Article 21",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/1646284/",
  },
  {
    title: "M.C. Mehta v. Kamal Nath",
    citation: "(1997) 1 SCC 388",
    court: "Supreme Court",
    topic:
      "The public trust doctrine — rivers and forests are held by the State in trust for the public, not the State's to hand to a private resort",
    category: "Environment, livelihood",
    sourceUrl: "https://indiankanoon.org/doc/1514672/",
  },

  // --- Commercial law and civil procedure ------------------------------------
  {
    title: "Vidya Drolia v. Durga Trading Corporation",
    citation: "(2021) 2 SCC 1",
    court: "Supreme Court",
    topic:
      "Arbitrability — the fourfold test for when a dispute is incapable of resolution by arbitration",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/121987320/",
  },
  {
    title: "Rangappa v. Sri Mohan",
    citation: "(2010) 11 SCC 441",
    court: "Supreme Court",
    topic:
      "Section 139, Negotiable Instruments Act — the presumption of a legally enforceable debt is rebuttable, not a dispensation from proof",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/150051/",
  },
  {
    title: "Shilpa Sailesh v. Varun Sreenivasan",
    citation: "2023 SCC OnLine SC 544",
    court: "Supreme Court",
    topic:
      "Article 142 — Supreme Court's power to grant divorce on irretrievable breakdown of marriage without both parties' consent",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/37623680/",
  },
  {
    title: "Chandra Kishore Chaurasia v. R.A. Perfumery Works Pvt. Ltd.",
    citation: "2022 SCC OnLine Del 3529",
    court: "Delhi High Court",
    topic:
      "Section 12A, Commercial Courts Act, 2015 — a plaint that genuinely contemplates urgent interim relief need not go through pre-institution mediation first",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/139820831/",
  },
  {
    title: "Salem Advocate Bar Assn., T.N. v. Union of India",
    citation: "(2005) 6 SCC 344",
    court: "Supreme Court",
    topic:
      "Upheld the 1999/2002 CPC amendments — case management, and Section 89's push toward ADR before trial",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/342197/",
  },
  {
    title: "Bharat Aluminium Co. v. Kaiser Aluminium Technical Services Inc.",
    citation: "(2012) 9 SCC 552",
    court: "Supreme Court",
    topic:
      "The BALCO case — Part I of the Arbitration Act applies only where the seat of arbitration is in India",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/173015163/",
  },
  {
    title: "Central Inland Water Transport Corp. v. Brojo Nath Ganguly",
    citation: "(1986) 3 SCC 156",
    court: "Supreme Court",
    topic:
      "An unconscionable term imposed from a position of unequal bargaining power is void as against public policy under Section 23, Contract Act",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/477313/",
  },
  {
    title: "Indian Medical Association v. V.P. Shantha",
    citation: "(1995) 6 SCC 651",
    court: "Supreme Court",
    topic:
      "Medical services rendered for a fee are \"service\" under the Consumer Protection Act — a patient can bring a consumer complaint",
    category: "Commercial law, civil procedure",
    sourceUrl: "https://indiankanoon.org/doc/723973/",
  },
];

/**
 * Court filters for /library?court=…
 *
 * The map sends six boxes here — Supreme Court, High Court, Trial Courts, and
 * the SC/HC citation boxes — which all used to land on the same unfiltered
 * page. A reader clicking three differently-labelled boxes and arriving at one
 * view learns that the boxes are decorative.
 *
 * `trial-courts` deliberately matches nothing. The Library holds no trial-court
 * material yet, and an honest empty state is worth more than either a silent
 * redirect to everything or a box that pretends not to be a destination.
 */
export type CourtFilter = "supreme-court" | "high-court" | "trial-courts";

export const COURT_FILTERS: Record<
  CourtFilter,
  { label: string; test: (c: PreviewCase) => boolean; empty?: string }
> = {
  "supreme-court": {
    label: "Supreme Court",
    test: (c) => c.court === "Supreme Court",
  },
  "high-court": {
    label: "High Courts",
    test: (c) => c.court.includes("High Court"),
  },
  "trial-courts": {
    label: "Trial Courts",
    test: () => false,
    empty:
      "The Library does not hold trial-court material yet. Trial courts do not report judgments the way the Supreme Court and High Courts do, so what belongs here is procedure and practice rather than citable authority.",
  },
};

export function isCourtFilter(v: unknown): v is CourtFilter {
  return typeof v === "string" && v in COURT_FILTERS;
}

/**
 * Derives a URL slug from a case title rather than storing one — works
 * uniformly for both PREVIEW_CASES (this file) and whatever
 * lib/verifiedCases.ts merges in from Supabase, neither of which has ever
 * needed a stable id before now. Collisions are not checked for: titles are
 * unique across the ~84 real cases this covers today, and a future
 * duplicate would need a real disambiguation strategy, not a silent
 * workaround here.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCaseBySlug(cases: PreviewCase[], slug: string): PreviewCase | undefined {
  return cases.find((c) => slugify(c.title) === slug);
}

/**
 * A verified Indian Kanoon SEARCH url (not a guessed direct document link)
 * for a case with no `sourceUrl` of its own yet — see PreviewCase's own
 * comment on `sourceUrl` for why a guessed direct link is worse than it
 * sounds, and why this is a search query instead. Moved here from
 * components/library/LibrarySearch.tsx so app/library/judgments/[slug]/
 * page.tsx can use the exact same fallback without duplicating the
 * reasoning.
 */
export function judgmentSearchUrl(item: PreviewCase): string {
  const query = `${item.title} ${item.citation}`;
  return `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`;
}

export function isCollectionId(v: unknown): v is string {
  return typeof v === "string" && COLLECTIONS.some((c) => c.id === v);
}

/**
 * Free-text search over these hand-verified preview cases — title,
 * citation, topic, and category. No external service, no database: this is
 * the same static array the page already renders, matched in memory. Case-
 * insensitive substring match on each field, not ranked or fuzzy — with a
 * few dozen entries, anything more elaborate solves a problem this dataset
 * doesn't have. This is metadata search, not full-text: none of these
 * entries carry the judgment's actual text, only title/citation/topic/
 * category, so a search for a phrase from inside a judgment's reasoning will
 * find nothing here.
 *
 * This is one of two sources app/library/page.tsx actually renders, not the
 * whole Library: lib/verifiedCases.ts fetches whatever the review queue
 * (app/admin/review) has separately verified in Supabase, and the page
 * merges both before this function ever runs. This array's own count is not
 * the Library's total judgment count — see ALL_CASES in app/library/page.tsx.
 */
export function searchCases(cases: PreviewCase[], query: string): PreviewCase[] {
  const q = query.trim().toLowerCase();
  if (!q) return cases;

  return cases.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.citation.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );
}

/**
 * The same match set as searchCases, ranked so the closest hit comes first
 * and capped to `limit`. There's no click-analytics to define "trending"
 * against, so relevance to the typed query stands in for it: a title match
 * outranks a citation match, which outranks a topic/category match. Ties
 * keep this array's own (thematic) order — Array.prototype.sort is stable.
 *
 * Only ever called with a non-empty query; components/library/
 * LibrarySearch.tsx falls back to the unranked, uncapped searchCases result
 * for the browse (no query) state so category browsing still surfaces every
 * case, not just the top few.
 */
export function topMatches(cases: PreviewCase[], query: string, limit: number): PreviewCase[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  function score(c: PreviewCase): number {
    const title = c.title.toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.includes(q)) return 2;
    if (c.citation.toLowerCase().includes(q)) return 3;
    if (c.topic.toLowerCase().includes(q)) return 4;
    return 5;
  }

  return [...searchCases(cases, query)].sort((a, b) => score(a) - score(b)).slice(0, limit);
}
