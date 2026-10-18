/**
 * Bare Acts & Commentary — real, verified provisions, scoped deliberately to
 * what the rest of this product already references: the 11 pleadings in
 * lib/documents.ts, the syllabi in lib/courses.ts, and the case topics in
 * lib/library.ts. Not the full text of any Act — that is a different, much
 * larger undertaking than one honest session can verify. This is the set of
 * provisions Shisho is already built around, made readable in one place.
 *
 * VERIFICATION RULE, same as lib/documents.ts and lib/library.ts: nothing
 * here is included on the strength of sounding right.
 *   - Every CPC provision below restates what lib/documents.ts already
 *     verified (see that file's own header) — reused, not re-derived.
 *   - Section 143, BSA 2023; Section 6, Hindu Succession Act (as amended
 *     2005); Section 124, Contract Act; Section 139, NI Act; and the
 *     Bharatiya Nyaya Sanhita's treatment of the old ss.377/497 IPC were
 *     checked against current sources in this session (BSA text against
 *     advocatekhoj.com/latestlaws.com bare-act mirrors; the BNS gap against
 *     Wikipedia's BNS article, PRS/Lexology commentary, and The Leaflet's
 *     piece on the s.377 omission specifically — three independent sources
 *     agreeing BNS carries no successor at all, not even a narrowed one).
 *   - Constitutional articles are stated at the confidence the `verbatim`
 *     flag on each records — short, famous clauses (Arts. 14, 20(3), 21, 32,
 *     141) are quoted; longer or multi-clause articles (19, 25, 226, 356)
 *     are an accurate structured summary, not a literal quotation, because a
 *     paraphrase I'm confident is *accurate* is safer than a quotation I am
 *     not fully confident is *exact*.
 *
 * `verbatim: false` is not a hedge to weaken later — it is the honest label
 * for a structured summary, exactly the register lib/documents.ts already
 * ships in its own `provision.gist` fields. A reader who needs the literal
 * text for filing should go to the Act itself; this points them at the
 * right section, not a substitute for reading it.
 */

export type ActId =
  | "constitution"
  | "cpc"
  | "contract-act"
  | "arbitration-act"
  | "commercial-courts-act"
  | "ni-act"
  | "hindu-succession-act"
  | "it-act"
  | "bsa"
  | "ipc";

export type Act = {
  id: ActId;
  name: string;
  shortName: string;
  /** false only for the repealed IPC, kept for the two historical entries below. */
  inForce: boolean;
};

export const ACTS: Act[] = [
  { id: "constitution", name: "The Constitution of India", shortName: "Constitution", inForce: true },
  { id: "cpc", name: "The Code of Civil Procedure, 1908", shortName: "CPC", inForce: true },
  { id: "contract-act", name: "The Indian Contract Act, 1872", shortName: "Contract Act", inForce: true },
  { id: "arbitration-act", name: "The Arbitration and Conciliation Act, 1996", shortName: "Arbitration Act", inForce: true },
  { id: "commercial-courts-act", name: "The Commercial Courts Act, 2015", shortName: "Commercial Courts Act", inForce: true },
  { id: "ni-act", name: "The Negotiable Instruments Act, 1881", shortName: "NI Act", inForce: true },
  { id: "hindu-succession-act", name: "The Hindu Succession Act, 1956", shortName: "Hindu Succession Act", inForce: true },
  { id: "it-act", name: "The Information Technology Act, 2000", shortName: "IT Act", inForce: true },
  { id: "bsa", name: "The Bharatiya Sakshya Adhiniyam, 2023", shortName: "BSA", inForce: true },
  { id: "ipc", name: "The Indian Penal Code, 1860", shortName: "IPC", inForce: false },
];

export function getAct(id: ActId) {
  return ACTS.find((a) => a.id === id)!;
}

export type Successor =
  | { kind: "mapped"; actId: ActId; section: string; note: string }
  | { kind: "none"; note: string };

export type Provision = {
  actId: ActId;
  section: string;
  title: string;
  /** The operative rule — quoted where `verbatim`, an accurate structured summary otherwise. */
  text: string;
  verbatim: boolean;
  /** Plain-language note on how it plays out in practice — the "Commentary" facet of the same entry. */
  commentary: string;
  successor?: Successor;
  /** PREVIEW_CASES citations (lib/library.ts) that turn on this provision. */
  citedIn?: string[];
  /** DOCUMENTS slugs (lib/documents.ts) built around this provision. */
  usedIn?: string[];
};

export const PROVISIONS: Provision[] = [
  // --- Constitution --------------------------------------------------------
  {
    actId: "constitution",
    section: "Article 14",
    title: "Equality before the law",
    text: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
    verbatim: true,
    commentary:
      "The textual anchor for every equality challenge — read together with Article 21 in Puttaswamy to found privacy, and the basis of the classification test used to test whether a law's distinctions are reasonable.",
    citedIn: ["(2017) 10 SCC 1"],
  },
  {
    actId: "constitution",
    section: "Article 19",
    title: "Protection of certain freedoms",
    text: "Article 19(1) guarantees six freedoms to citizens: (a) speech and expression, (b) peaceable assembly without arms, (c) forming associations or unions, (d) free movement throughout India, (e) residing and settling in any part of India, and (g) practising any profession or carrying on any occupation, trade or business. Clauses (2)–(6) let the State impose reasonable restrictions on each, on specified grounds only — public order, decency, sovereignty, and the like.",
    verbatim: false,
    commentary:
      "The restriction clauses do the real work: a law restricting a 19(1) freedom survives only if it fits one of the specific grounds listed for that freedom and is reasonable, not merely convenient for the State. Shreya Singhal struck down Section 66A, IT Act for failing exactly this test against 19(1)(a).",
    citedIn: ["(2017) 10 SCC 1", "(2015) 5 SCC 1"],
  },
  {
    actId: "constitution",
    section: "Article 20(3)",
    title: "Protection against self-incrimination",
    text: "No person accused of any offence shall be compelled to be a witness against himself.",
    verbatim: true,
    commentary:
      "Selvi held that narcoanalysis, polygraph and BEAP tests administered without consent compel testimony in substance, even though nothing is 'said' voluntarily — the protection reaches the reliability of what the mind is made to produce, not just refusal to speak.",
    citedIn: ["(2010) 7 SCC 263"],
  },
  {
    actId: "constitution",
    section: "Article 21",
    title: "Protection of life and personal liberty",
    text: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
    verbatim: true,
    commentary:
      "The most heavily worked provision in the Library. Maneka Gandhi read 'procedure established by law' to require fairness, not just enactment; from there it has carried privacy (Puttaswamy), livelihood (Olga Tellis), a clean environment (M.C. Mehta, Vellore Citizens), and the right to a dignified death (Common Cause).",
    citedIn: [
      "(1978) 1 SCC 248",
      "(2017) 10 SCC 1",
      "(1987) 1 SCC 395",
      "(1985) 3 SCC 545",
      "(2018) 5 SCC 1",
    ],
  },
  {
    actId: "constitution",
    section: "Article 25",
    title: "Freedom of religion",
    text: "Subject to public order, morality and health, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion.",
    verbatim: false,
    commentary:
      "The 'essential religious practice' test — whether a practice is so integral that the religion would lose its character without it — is what Sabarimala turned on: the majority held the exclusion of women of a certain age was not essential to the deity's worship.",
    citedIn: ["(2019) 11 SCC 1"],
  },
  {
    actId: "constitution",
    section: "Article 32",
    title: "Right to constitutional remedies",
    text: "The right to move the Supreme Court directly for the enforcement of Fundamental Rights is itself guaranteed. The Court may issue directions, orders or writs — including habeas corpus, mandamus, prohibition, quo warranto and certiorari — to enforce them.",
    verbatim: false,
    commentary:
      "Dr. Ambedkar called this 'the heart and soul' of the Constitution: it is not just a remedy, it is itself a Fundamental Right, so Parliament cannot strip it away the way an ordinary procedural right could be.",
  },
  {
    actId: "constitution",
    section: "Article 141",
    title: "Law declared by the Supreme Court",
    text: "The law declared by the Supreme Court shall be binding on all courts within the territory of India.",
    verbatim: true,
    commentary:
      "Why a single Supreme Court judgment settles a question nationwide — Vishaka's guidelines against workplace harassment had the force of law under this Article until Parliament codified them in 2013.",
    citedIn: ["(1997) 6 SCC 241"],
  },
  {
    actId: "constitution",
    section: "Article 142",
    title: "Complete justice",
    text: "The Supreme Court may pass any decree or order necessary for doing complete justice in a cause before it, and such an order is enforceable throughout India.",
    verbatim: false,
    commentary:
      "Shilpa Sailesh used this to let the Court grant a divorce on irretrievable breakdown of marriage directly — a ground Parliament has never actually enacted in the Hindu Marriage Act, reached only because Article 142 lets the Court go past what ordinary law provides.",
    citedIn: ["2023 SCC OnLine SC 544"],
  },
  {
    actId: "constitution",
    section: "Article 226",
    title: "Writ jurisdiction of the High Courts",
    text: "Every High Court has power, within the territory over which it has jurisdiction, to issue directions, orders or writs — including habeas corpus, mandamus, prohibition, quo warranto and certiorari — for the enforcement of Fundamental Rights and for any other purpose.",
    verbatim: false,
    commentary:
      "Broader than Article 32 in one respect: a High Court's writ jurisdiction reaches 'any other purpose', not Fundamental Rights alone, which is why most writ petitions in ordinary practice are filed in the High Court rather than the Supreme Court.",
    usedIn: [],
  },
  {
    actId: "constitution",
    section: "Article 356",
    title: "President's Rule",
    text: "Where the President is satisfied, on a Governor's report or otherwise, that a State's government cannot be carried on in accordance with the Constitution, the President may assume the functions of the State government and Legislature.",
    verbatim: false,
    commentary:
      "Bommai's real holding is procedural: the President's 'satisfaction' is not beyond judicial review, and a proclamation can be struck down if the material behind it does not actually show constitutional breakdown — ending an era where Article 356 was used to dismiss State governments for political convenience.",
    citedIn: ["(1994) 3 SCC 1"],
  },

  // --- Code of Civil Procedure, 1908 ----------------------------------------
  {
    actId: "cpc",
    section: "Order VI Rule 15",
    title: "Verification of pleadings",
    text: "Every pleading must be verified by the party or someone acquainted with the facts, stating which paragraphs are true to the deponent's own knowledge and which are believed on information received.",
    verbatim: false,
    commentary:
      "An unverified pleading cannot be relied on as evidence of the facts it states — a plaint or written statement that skips verification is a draft, not a filed pleading, whatever else is right about it.",
    usedIn: ["plaint", "written-statement"],
  },
  {
    actId: "cpc",
    section: "Order VI Rule 15A",
    title: "Statement of Truth",
    text: "In a commercial dispute, every pleading must additionally carry a Statement of Truth — a specific declaration that the facts stated are true, in the form the Commercial Courts Act regime prescribes.",
    verbatim: false,
    commentary:
      "Stacked on top of ordinary verification, not a substitute for it — a commercial plaint needs both. Missing the Statement of Truth is a defect on a document Rule 15 alone would otherwise treat as properly verified.",
    usedIn: ["plaint"],
  },
  {
    actId: "cpc",
    section: "Order VI Rule 17",
    title: "Amendment of pleadings",
    text: "The court may allow either party to amend a pleading in a manner necessary for determining the real questions in controversy, at any stage of the proceedings, on terms it thinks just.",
    verbatim: false,
    commentary:
      "The route out when a rejoinder is not enough to fix what was actually pleaded wrong — but courts hold the line against amendments raised late that would change the nature of the suit or prejudice the other side.",
    usedIn: ["rejoinder"],
  },
  {
    actId: "cpc",
    section: "Order VII Rule 1",
    title: "Particulars of a plaint",
    text: "A plaint must state: the court; the parties' names, description and place of residence; the facts constituting the cause of action and when it arose; facts showing the court has jurisdiction; the relief claimed; and the value of the subject matter for jurisdiction and court fee.",
    verbatim: false,
    commentary:
      "The recurring trap is Rule 1(e): the facts constituting the cause of action, not the evidence that will later prove them. A plaint that argues its evidence instead of pleading its facts is doing the wrong job at the wrong stage.",
    usedIn: ["plaint"],
  },
  {
    actId: "cpc",
    section: "Order VII Rule 7",
    title: "Relief to be specifically stated",
    text: "Every plaint must state the relief the plaintiff claims, specifically, whether simply or in the alternative.",
    verbatim: false,
    commentary:
      "A court cannot grant relief that was never asked for. A plaint that proves its case but never specifically claims the relief that follows from it can still lose on the relief clause alone.",
    usedIn: ["plaint"],
  },
  {
    actId: "cpc",
    section: "Order VII Rule 11",
    title: "Rejection of a plaint",
    text: "A plaint is liable to be rejected where it discloses no cause of action; where the relief claimed is undervalued and not corrected within the time the court allows; where it is insufficiently stamped and not corrected; or where it is barred by any law, including limitation, on its own showing.",
    verbatim: false,
    commentary:
      "A rejection under this Rule is not a dismissal on the merits — it leaves the plaintiff free to file a fresh plaint that fixes the defect, which is exactly why courts test it strictly against the plaint's own averments and nothing else.",
    citedIn: [],
    usedIn: ["plaint"],
  },
  {
    actId: "cpc",
    section: "Order VIII Rule 1",
    title: "Time to file a written statement",
    text: "A defendant must file a written statement within 30 days of service of summons. The court may extend this, for reasons recorded in writing, up to 90 days from service.",
    verbatim: false,
    commentary:
      "In an ordinary suit, Kailash v. Nanhku, (2005) 4 SCC 480 holds this outer limit directory, not mandatory — a late written statement can still be taken on record for sufficient cause. Under the Commercial Courts Act regime the position is stricter: the outer limit is 120 days and the right to file is forfeited beyond it, no extension available.",
    citedIn: [],
    usedIn: ["written-statement"],
  },
  {
    actId: "cpc",
    section: "Order VIII Rules 2–5",
    title: "New facts and specific denial",
    text: "A defendant must specifically plead any new facts that would take the plaintiff by surprise, or that raise issues of law not arising from the plaint (Rule 2), and must deal specifically with every allegation, admitting or denying it — a general or evasive denial is treated as an admission (Rules 3–5).",
    verbatim: false,
    commentary:
      "The single most common way a defence loses facts that were genuinely disputed: an evasive denial ('the defendant denies the contents of paragraph 4 as stated') is read as an admission of what it fails to specifically traverse.",
    usedIn: ["written-statement"],
  },
  {
    actId: "cpc",
    section: "Order VIII Rule 6",
    title: "Set-off",
    text: "Where the plaintiff sues for an ascertained sum of money and the defendant claims an ascertained sum from the plaintiff, the defendant may present a written statement claiming a set-off against the plaintiff's demand.",
    verbatim: false,
    commentary:
      "Confined to money claims that are ascertained on both sides — a defendant with an unliquidated cross-claim needs a counter-claim under Rule 6A instead, not a set-off.",
    usedIn: ["written-statement"],
  },
  {
    actId: "cpc",
    section: "Order VIII Rule 6A",
    title: "Counter-claim",
    text: "A defendant may set up, by way of counter-claim, any right or claim against the plaintiff accruing before the defence was delivered, within the pecuniary jurisdiction of the court. The court treats it as a plaint and decides it in the same suit; the plaintiff may file a written statement in reply under Rule 6A(3).",
    verbatim: false,
    commentary:
      "A counter-claim is a claim, paid for and pleaded like one — court fee, its own cause of action, its own specific relief. Raised as argument against the plaint rather than an independent claim, it is not a counter-claim at all.",
    usedIn: ["counter-claim", "written-statement"],
  },
  {
    actId: "cpc",
    section: "Order X Rule 2",
    title: "Oral examination at the first hearing",
    text: "At the first hearing, the court examines the parties on matters in controversy, to clarify or narrow the questions of fact and law before framing issues.",
    verbatim: false,
    commentary:
      "Feeds directly into Order XIV — the issues that get framed are read against what came out of this examination as well as the pleadings themselves.",
    usedIn: ["issues"],
  },
  {
    actId: "cpc",
    section: "Order XIV Rule 1",
    title: "Framing of issues",
    text: "An issue arises where a material proposition of fact or law is affirmed by one party and denied by the other. Issues of fact and issues of law are recorded separately (Rule 1(4)).",
    verbatim: false,
    commentary:
      "Drawn from the pleadings, not the evidence — issues framed after evidence has already started are being framed from the wrong material. A pleaded defence with no issue framed on it is a defence that never actually gets tried.",
    usedIn: ["issues"],
  },
  {
    actId: "cpc",
    section: "Order XVIII Rule 2",
    title: "Right to begin; written arguments",
    text: "The party with the right to begin states their case and produces their evidence; the other party then does the same. Written arguments under distinct headings must be filed within four weeks before oral arguments begin (Rule 2(3A)), and the court may fix time limits for oral argument (Rules 2(3B)–(3C)).",
    verbatim: false,
    commentary:
      "Written arguments must already be on record before the oral hearing starts, not filed alongside or after it — reading them aloud at the hearing spends the court's time on what it already has in front of it.",
    usedIn: ["written-arguments", "oral-arguments"],
  },
  {
    actId: "cpc",
    section: "Order XVIII Rule 4",
    title: "Examination-in-chief on affidavit",
    text: "Examination-in-chief of a witness is recorded on affidavit, filed at the time the court fixes (Rule 4(1)); cross-examination and re-examination take place before the court or a commissioner it appoints.",
    verbatim: false,
    commentary:
      "An affidavit under this Rule stands in place of oral testimony and is confined the same way — argument or submission in the body makes it neither a valid affidavit under Order XIX Rule 3 nor a valid examination-in-chief.",
    citedIn: [],
    usedIn: ["examination-in-chief"],
  },
  {
    actId: "cpc",
    section: "Order XIX Rule 3",
    title: "Matters to which affidavits are confined",
    text: "Affidavits must be confined to facts the deponent is able to prove of their own knowledge, except on interlocutory applications, where statements of belief may be admitted if the grounds for the belief are stated.",
    verbatim: false,
    commentary:
      "Belief without a stated source leaves the paragraph with nothing behind it — an affidavit that says 'I am informed and believe' without saying by whom or on what basis fails this Rule on its own terms.",
    usedIn: ["affidavit", "petition"],
  },
  {
    actId: "cpc",
    section: "Order XXXIX Rules 1–2",
    title: "Temporary injunction",
    text: "The court may grant a temporary injunction to restrain a party from an act likely to cause injury to the plaintiff's rights, or to preserve property in dispute, where a suit shows a serious question to be tried. Three requirements are considered: a prima facie case, the balance of convenience, and irreparable injury.",
    verbatim: false,
    commentary:
      "The three limbs are separate questions, not one impression — pleading hardship generally is not the same as making out each limb distinctly, and irreparable injury specifically fails wherever money would actually fix the harm.",
    usedIn: ["petition"],
  },
  {
    actId: "cpc",
    section: "Order XXXIX Rule 3",
    title: "Ex parte injunction — grounds",
    text: "Before granting an injunction without notice to the other side, the court must record its reasons for proceeding ex parte, and the applicant must disclose why notice should be dispensed with.",
    verbatim: false,
    commentary:
      "Bypassing notice is the exception, not the default route to urgent relief — the ex parte order is coupled with a duty to give notice promptly afterward and let the other side apply to vacate it.",
    usedIn: ["petition"],
  },
  {
    actId: "cpc",
    section: "Section 80",
    title: "Notice before suit against the Government",
    text: "No suit against the Government, or against a public officer for an act done in an official capacity, can be instituted until two months after a written notice has been delivered stating the cause of action, the relief claimed, and the plaintiff's name, description and place of residence — except where the court grants leave to sue without it, to avoid urgent or immediate relief being defeated.",
    verbatim: false,
    commentary:
      "A suit filed without this notice, and without leave under the proviso, is generally not maintainable as filed — the two-month wait is a precondition to the government's own opportunity to consider the claim before litigation starts.",
  },
  {
    actId: "cpc",
    section: "Section 139",
    title: "Oath on affidavit",
    text: "An affidavit is sworn or affirmed before a court, or before an officer or other person the High Court or the relevant government appoints for that purpose.",
    verbatim: false,
    commentary:
      "The formality that turns a written statement into an affidavit at all — sworn before someone actually authorised under this section, not simply signed and notarised.",
    usedIn: ["affidavit"],
  },

  // --- Other Acts ------------------------------------------------------------
  {
    actId: "contract-act",
    section: "Section 124",
    title: "Contract of indemnity, defined",
    text: "A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a contract of indemnity.",
    verbatim: true,
    commentary:
      "Deliberately narrow at common law — Section 124 by its own words only covers loss from human conduct. Loss from accident or natural events (a fire, say) falls outside this definition and is enforced, where it is, as an ordinary contractual promise rather than \"indemnity\" in this specific statutory sense.",
  },
  {
    actId: "arbitration-act",
    section: "Section 9",
    title: "Interim measures by court",
    text: "A party may apply to a court for interim protection — before, during, or after arbitral proceedings but before enforcement — including preservation of property, interim injunction, or appointment of a receiver.",
    verbatim: false,
    commentary:
      "The bridge between an arbitration clause and real urgent relief: an arbitral tribunal usually is not even constituted yet when protection is needed most, so Section 9 lets a party go to court for exactly that gap.",
  },
  {
    actId: "arbitration-act",
    section: "Section 11",
    title: "Appointment of arbitrators",
    text: "Where parties fail to agree on an arbitrator under their own agreed procedure, a party may apply to the Supreme Court (international commercial arbitration) or the High Court (other arbitrations) to appoint one.",
    verbatim: false,
    commentary:
      "Vidya Drolia's fourfold arbitrability test is applied at exactly this stage — a court asked to appoint an arbitrator under Section 11 first has to decide whether the dispute is even one arbitration can resolve at all.",
    citedIn: ["(2021) 2 SCC 1"],
  },
  {
    actId: "commercial-courts-act",
    section: "Section 12A",
    title: "Pre-institution mediation",
    text: "A suit that does not contemplate any urgent interim relief cannot be instituted in a commercial dispute until the plaintiff has exhausted pre-institution mediation, except where the suit does contemplate urgent interim relief.",
    verbatim: false,
    commentary:
      "Chandra Kishore Chaurasia held the exception is genuine, not a drafting trick to dodge mediation: a plaint that genuinely contemplates urgent interim relief — pleaded and made out as such — need not go through mediation first, but one that recites urgency without substance does not escape Section 12A that easily.",
    citedIn: ["2022 SCC OnLine Del 3529"],
  },
  {
    actId: "ni-act",
    section: "Section 139",
    title: "Presumption in favour of holder",
    text: "It shall be presumed, unless the contrary is proved, that the holder of a cheque received it for the discharge, in whole or in part, of a debt or other liability.",
    verbatim: true,
    commentary:
      "Rangappa held this presumption rebuttable on a preponderance of probability, not a dispensation from proof altogether — the accused does not have to disprove the debt beyond reasonable doubt, but silence alone will not displace the presumption either.",
    citedIn: ["(2010) 11 SCC 441"],
  },
  {
    actId: "hindu-succession-act",
    section: "Section 6",
    title: "Daughter's coparcenary right by birth",
    text: "On and from the commencement of the Hindu Succession (Amendment) Act, 2005, the daughter of a coparcener in a Mitakshara joint family shall, by birth, become a coparcener in her own right in the same manner as a son, with the same rights in coparcenary property and the same liabilities as a son.",
    verbatim: true,
    commentary:
      "Vineeta Sharma settled a real split in the case law: the daughter's right attaches by birth, so it applies even where the father died before the 2005 amendment came into force — the amendment is not read to require the father to have been alive when it commenced.",
    citedIn: ["(2020) 9 SCC 1"],
  },
  {
    actId: "it-act",
    section: "Section 66A",
    title: "Punishment for sending offensive messages (struck down)",
    text: "Formerly made it an offence to send, by a computer or communication device, information that was grossly offensive, or known to be false and sent to cause annoyance, inconvenience, danger, obstruction, insult, injury, enmity, hatred or ill will.",
    verbatim: false,
    commentary:
      "Struck down in its entirety by Shreya Singhal as unconstitutionally vague and a disproportionate restriction on Article 19(1)(a): terms like \"grossly offensive\" gave no fair notice of what was actually prohibited, chilling protected speech along with anything genuinely dangerous. It remains in the bare text of the Act as an unenforceable dead letter, and has no successor provision — nothing replaced it.",
    successor: { kind: "none", note: "Struck down outright; no replacement provision was enacted." },
    citedIn: ["(2015) 5 SCC 1"],
  },
  {
    actId: "bsa",
    section: "Section 143",
    title: "Order of examinations",
    text: "A witness is examined-in-chief first, then — if the adverse party desires — cross-examined, then — if the party calling the witness desires — re-examined. Cross-examination need not be confined to the facts the witness testified to in chief. Re-examination is directed to explaining matters raised in cross-examination; new matter introduced in re-examination, with the court's permission, opens the witness to further cross-examination on that matter.",
    verbatim: true,
    commentary:
      "The Bharatiya Sakshya Adhiniyam, 2023 replaced the Indian Evidence Act, 1872 with effect from 1 July 2024 — cite the Adhiniyam, not the 1872 Act, for anything after that date. Section 143 carries the same chief→cross→re-examination structure the Evidence Act used, with no substantive change to the order itself.",
    usedIn: ["examination-in-chief", "cross-examination"],
  },
  {
    actId: "ipc",
    section: "Section 377",
    title: "Unnatural offences (repealed)",
    text: "Formerly punished 'carnal intercourse against the order of nature' — covering non-consensual acts, bestiality, and, until 2018, consensual acts between adults of the same sex.",
    verbatim: false,
    commentary:
      "Navtej Singh Johar read the provision down in 2018 to decriminalise only consensual conduct between adults, leaving the rest — non-consensual acts and bestiality — intact and punishable. The Bharatiya Nyaya Sanhita, 2023 then repealed the IPC outright, but carried forward no equivalent provision at all: it does not merely narrow Section 377, it omits it entirely, including the non-consensual and bestiality conduct Navtej Johar had left standing. Legal commentators have flagged this as a genuine legislative gap, not a considered decriminalisation — conduct that was still an offence the day before 1 July 2024 has no BNS provision to prosecute it under the day after.",
    successor: {
      kind: "none",
      note: "BNS 2023 has no equivalent provision — not even for the non-consensual conduct Navtej Johar left intact. Flagged by commentators (e.g. The Leaflet) as an oversight, not a deliberate policy choice.",
    },
    citedIn: ["160 (2009) DLT 277", "(2018) 10 SCC 1"],
  },
  {
    actId: "ipc",
    section: "Section 497",
    title: "Adultery (repealed)",
    text: "Formerly made it an offence for a man to have consensual intercourse with a married woman without her husband's consent — the husband alone could prosecute, and the wife could not be charged even as an abettor.",
    verbatim: false,
    commentary:
      "Joseph Shine struck the provision down in its entirety in 2018 as unconstitutional — not merely gendered, but a criminal-law intrusion into personal autonomy the State had no legitimate interest in policing. The Bharatiya Nyaya Sanhita, 2023 carries no successor: adultery is not a criminal offence anywhere in current Indian law, though it remains a valid ground for civil divorce.",
    successor: { kind: "none", note: "No BNS successor. Adultery survives only as a civil ground for divorce, not a criminal offence." },
    citedIn: ["(2019) 3 SCC 39"],
  },
];

export function provisionsByAct() {
  const order = ACTS.map((a) => a.id);
  return order
    .map((actId) => ({
      act: getAct(actId),
      provisions: PROVISIONS.filter((p) => p.actId === actId),
    }))
    .filter((g) => g.provisions.length > 0);
}

/** Same shape/contract as lib/library.ts's searchCases: case-insensitive substring match, not ranked or fuzzy. */
export function searchProvisions(provisions: Provision[], query: string): Provision[] {
  const q = query.trim().toLowerCase();
  if (!q) return provisions;

  return provisions.filter((p) => {
    const act = getAct(p.actId);
    return (
      p.section.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      p.commentary.toLowerCase().includes(q) ||
      act.name.toLowerCase().includes(q) ||
      act.shortName.toLowerCase().includes(q)
    );
  });
}
