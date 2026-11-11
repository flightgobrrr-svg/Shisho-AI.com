/**
 * ============================================================================
 * THE DOCUMENTS — one reference page per pleading the map names.
 * ============================================================================
 *
 * VERIFICATION RULE, same as lib/library.ts: every provision cited here was
 * checked against a source before it was written down, and nothing is included
 * on the strength of it sounding right. If you add an entry, verify the rule
 * first — a wrong Order and Rule on a page aimed at litigators is worse than
 * no page.
 *
 * Checked for this file:
 *   - Order VI r.15 / r.15A ...... verification; Statement of Truth in a
 *                                  commercial dispute
 *   - Order VII r.1, 7, 11 ....... particulars of a plaint; relief; rejection
 *   - Order VIII r.1 ............. 30 days, extendable by the court for
 *                                  recorded reasons to 90
 *   - Order VIII r.3–5 ........... specific denial; evasive denial
 *   - Order VIII r.6, 6A ......... set-off; counter-claim
 *   - Order XIV r.1 .............. issues arise on a material proposition
 *                                  affirmed by one side and denied by the other
 *   - Order XVIII r.2(3A) ........ written arguments, four weeks before oral
 *   - Order XVIII r.4 ............ examination-in-chief on affidavit
 *   - Order XIX r.3 .............. affidavits confined to facts of the
 *                                  deponent's own knowledge
 *   - Order XXXIX r.1–2 .......... temporary injunction, the three limbs
 *   - BSA 2023 s.143 ............. order of examinations. The Bharatiya Sakshya
 *                                  Adhiniyam replaced the Indian Evidence Act
 *                                  1872 with effect from 1 July 2024 — cite the
 *                                  Adhiniyam, not the 1872 Act.
 *   - Kailash v. Nanhku, (2005) 4 SCC 480 — the Order VIII r.1 limit is
 *                                  directory for an ordinary suit
 *
 * The commercial-suit position differs from the ordinary one in several
 * places and is called out where it does, rather than flattened into one rule.
 */

import type { DocType } from "@/lib/draft";

export type LegalDocument = {
  slug: string;
  /**
   * The Shisho draft type this document maps to, so a document page can
   * pre-load the workspace instead of dropping the reader on a generic one.
   * Where the slug and the type share a name that is deliberate, not
   * incidental — the relationship lives here and nowhere else.
   *
   * ABSENT means the document is not one a party drafts and files, and the
   * page must not offer to draft it: `issues` is settled by the court on the
   * pleadings (Order XIV Rule 1), and cross-examination and oral arguments
   * happen at the bar.
   */
  draftsAs?: DocType;
  /** Title case, as an advocate would name it. */
  name: string;
  /** The map stage this belongs to (lib/sitemap.ts). */
  stage: number;
  /** One sentence: what the document IS. */
  lede: string;
  /** The provision that governs it. */
  provision: { cite: string; gist: string };
  /** What it must contain to be a competent document. */
  mustContain: string[];
  /** How it actually goes wrong. */
  defects: string[];
  /** Other documents worth reading beside it. */
  related: string[];
};

export const DOCUMENTS: LegalDocument[] = [
  {
    slug: "plaint",
    draftsAs: "plaint",
    name: "Plaint",
    stage: 6,
    lede: "The suit itself — the document that starts a civil case and fixes the case you must prove.",
    provision: {
      cite: "Order VII, Code of Civil Procedure, 1908",
      gist: "Sets out the particulars every plaint must carry, the relief it must claim, and the grounds on which it will be rejected outright.",
    },
    mustContain: [
      "The name of the court, and the name, description and place of residence of each party — Order VII Rule 1(a)–(c).",
      "The facts constituting the cause of action, and when it arose — Rule 1(e). Not the evidence; the facts.",
      "The facts showing that this court has jurisdiction — Rule 1(f). Territorial and pecuniary, pleaded, not assumed.",
      "The relief claimed, stated specifically — Rules 1(g) and 7. Relief not asked for will not be granted.",
      "The value of the subject matter for jurisdiction and for court fee — Rule 1(i).",
      "Verification under Order VI Rule 15; in a commercial dispute, a Statement of Truth under Order VI Rule 15A.",
    ],
    defects: [
      "No cause of action disclosed — the plaint is liable to be rejected under Order VII Rule 11(a), and rejection is not a dismissal you can quietly refile around.",
      "Relief undervalued, or court fee short, and not corrected within the time the court allows — Rule 11(b)–(c).",
      "Barred by limitation on the face of the plaint — Rule 11(d). A pleading that dates its own cause of action carelessly does this to itself.",
      "Left unverified: the party is not permitted to rely on the pleading as evidence of the matters in it.",
    ],
    related: ["written-statement", "affidavit", "issues"],
  },
  {
    slug: "written-statement",
    draftsAs: "written-statement",
    name: "Written Statement",
    stage: 6,
    lede: "The defence — and the one document where saying nothing is treated as saying yes.",
    provision: {
      cite: "Order VIII, Code of Civil Procedure, 1908",
      gist: "Governs the time to file, the manner of denial, and the defendant's own claims by way of set-off and counter-claim.",
    },
    mustContain: [
      "Filing within 30 days of service of summons. The court may extend it for reasons recorded in writing, up to 90 days — Order VIII Rule 1.",
      "Specific denial of every allegation not admitted — Rules 3 to 5. Denial must meet the allegation, point by point.",
      "New facts raised specifically: limitation, fraud, discharge, and anything else that would take the plaintiff by surprise — Rule 2.",
      "Set-off, with particulars, where an ascertained sum is claimed — Rule 6.",
      "A counter-claim, if the defendant has one — Rule 6A.",
      "Verification, on the same footing as the plaint.",
    ],
    defects: [
      "A general denial. An evasive or non-specific denial is treated as an admission — the fastest way to lose facts that were genuinely in dispute.",
      "Omitting limitation. It is not saved for later; unpleaded, it is very hard to argue.",
      "Missing the deadline in a commercial suit. In an ordinary suit the Order VIII Rule 1 period is directory (Kailash v. Nanhku, (2005) 4 SCC 480); under the commercial-courts regime the outer limit is 120 days and the right to file is forfeited.",
    ],
    related: ["plaint", "counter-claim", "issues"],
  },
  {
    slug: "counter-claim",
    draftsAs: "counter-claim",
    name: "Counter-claim",
    stage: 6,
    lede: "The defendant suing back inside the same suit — a cross-suit in all but name.",
    provision: {
      cite: "Order VIII Rule 6A, Code of Civil Procedure, 1908",
      gist: "Lets the defendant set up any right or claim against the plaintiff, which the court treats as a plaint and decides in the same suit.",
    },
    mustContain: [
      "A right or claim accruing to the defendant before he has delivered his defence — Rule 6A(1).",
      "A claim within the pecuniary jurisdiction of the court trying the suit.",
      "Court fee, as on a plaint. A counter-claim is a claim, and it is paid for like one.",
      "The particulars a plaint would carry: the facts, the cause of action, and the specific relief.",
      "Room for the plaintiff to answer it — the plaintiff may file a written statement in reply — Rule 6A(3).",
    ],
    defects: [
      "Raised after the defence has been delivered, which is outside what Rule 6A permits.",
      "Filed without court fee, and so not a claim the court can decree.",
      "Pleaded as argument against the plaint rather than as an independent claim with its own cause of action.",
    ],
    related: ["written-statement", "rejoinder", "plaint"],
  },
  {
    slug: "rejoinder",
    draftsAs: "rejoinder",
    name: "Rejoinder",
    stage: 6,
    lede: "The plaintiff's answer to new matter in the written statement — permitted, but not as of right.",
    provision: {
      cite: "No express provision; filed with the leave of the court",
      gist: "The Code provides for a plaint and a written statement. A rejoinder is not a pleading the Code guarantees — it is allowed where the written statement raises new facts that call for an answer.",
    },
    mustContain: [
      "Leave of the court. Filed without leave, it may simply be ignored.",
      "An answer confined to the new facts raised in the written statement.",
      "Denials that are specific, on the same footing as any other pleading.",
      "Verification.",
    ],
    defects: [
      "Using it to improve the plaint. A rejoinder cannot repair a cause of action that was not pleaded in the first place.",
      "Introducing a fresh case — the remedy for that is an amendment under Order VI Rule 17, not a rejoinder.",
      "Re-arguing the plaint at length instead of meeting the new matter.",
    ],
    related: ["written-statement", "counter-claim"],
  },
  {
    slug: "affidavit",
    draftsAs: "affidavit",
    name: "Affidavit",
    stage: 5,
    lede: "Evidence on oath, in writing — and the document most often spoiled by argument.",
    provision: {
      cite: "Order XIX, Code of Civil Procedure, 1908; Section 139 CPC",
      gist: "Affidavits are confined to facts the deponent can prove of his own knowledge, and must be sworn before a person authorised to administer the oath.",
    },
    mustContain: [
      "Facts the deponent can prove of his own knowledge — Order XIX Rule 3.",
      "For anything on information and belief: the source of the information, stated.",
      "An oath or affirmation before a person authorised under Section 139 CPC.",
      "Numbered paragraphs, each confined to one matter, and a verification clause identifying which are true to knowledge and which to belief.",
      "The deponent's full description, so it is clear who is swearing.",
    ],
    defects: [
      "Argument and submission in the body. An affidavit carrying argument is neither an affidavit under Order XIX Rule 3 nor a valid affidavit in lieu of examination-in-chief under Order XVIII Rule 4.",
      "Belief without a source, which leaves the statement with nothing behind it.",
      "A verification that does not distinguish knowledge from belief, so the whole document is only as good as its weakest paragraph.",
    ],
    related: ["petition", "examination-in-chief", "plaint"],
  },
  {
    slug: "petition",
    draftsAs: "application",
    name: "Interlocutory Application",
    stage: 5,
    lede: "Relief you need while the suit is still running — most often an injunction.",
    provision: {
      cite: "Order XXXIX Rules 1–2, Code of Civil Procedure, 1908",
      gist: "Empowers the court to grant a temporary injunction. Three limbs must be made out, and they are separate questions, not one impression.",
    },
    mustContain: [
      "A prima facie case — a serious question to be tried, pleaded as such.",
      "The balance of convenience, addressed on both sides rather than asserted for one.",
      "Irreparable injury — harm that damages will not answer. If money would fix it, this limb fails.",
      "A supporting affidavit that satisfies Order XIX Rule 3.",
      "The specific interim relief sought, in terms the court could grant as an order.",
      "Where relief is sought ex parte, the grounds for proceeding without notice — Order XXXIX Rule 3.",
    ],
    defects: [
      "Pleading hardship alone. Hardship is not the test; the three limbs are, and each must be pleaded distinctly.",
      "An affidavit that argues instead of deposing.",
      "Asking for a mandatory order in the guise of an interim one, without meeting the higher standard that attracts.",
    ],
    related: ["affidavit", "counter-claim", "written-arguments"],
  },
  {
    slug: "issues",
    name: "Issues",
    stage: 6,
    lede: "The questions the trial will actually answer — settled from the pleadings, not from the evidence.",
    provision: {
      cite: "Order XIV Rule 1, Code of Civil Procedure, 1908",
      gist: "An issue arises where a material proposition of fact or law is affirmed by one party and denied by the other.",
    },
    mustContain: [
      "A material proposition — one the plaintiff must allege to show a right to sue, or the defendant to make out a defence.",
      "Affirmation on one side and denial on the other. Where both agree, there is no issue to try.",
      "Framing at the first hearing, after reading the plaint and written statement and the examination under Order X Rule 2.",
      "Issues of fact and issues of law recorded separately — Rule 1(4).",
      "The burden of proof allotted on each issue, so both sides know what they must prove.",
    ],
    defects: [
      "Issues drawn from the evidence rather than the pleadings, which is the wrong source and the wrong order.",
      "Omnibus issues — 'whether the plaintiff is entitled to the relief claimed' answers nothing on its own.",
      "Leaving a pleaded defence without an issue, so it never gets tried.",
    ],
    related: ["plaint", "written-statement", "examination-in-chief"],
  },
  {
    slug: "examination-in-chief",
    draftsAs: "examination-in-chief",
    name: "Examination-in-chief",
    stage: 7,
    lede: "Your own witness's evidence — now filed on affidavit before anyone speaks.",
    provision: {
      cite: "Order XVIII Rule 4 CPC; Section 143, Bharatiya Sakshya Adhiniyam, 2023",
      gist: "Examination-in-chief is recorded on affidavit, and a witness is examined in chief first, then cross-examined, then re-examined.",
    },
    mustContain: [
      "An affidavit of evidence — Order XVIII Rule 4(1) — filed at the time the court fixes.",
      "Only relevant facts. The affidavit stands in place of oral testimony and is confined the same way.",
      "Every document the witness is to prove, brought in through that witness.",
      "A copy furnished to the other side, since cross-examination proceeds on it.",
      "Facts within the witness's own knowledge, deposed as such.",
    ],
    defects: [
      "Argument in the affidavit — it is then neither a valid affidavit nor a valid examination-in-chief.",
      "Leaving a document unproved because no witness was asked to speak to it.",
      "Filing further affidavits later without leave, which the court allows only for sufficient cause and by a reasoned order.",
    ],
    related: ["cross-examination", "affidavit", "issues"],
  },
  {
    slug: "cross-examination",
    name: "Cross-examination",
    stage: 7,
    lede: "The other side's witness, tested — and the stage where an unpleaded case dies.",
    provision: {
      cite: "Section 143, Bharatiya Sakshya Adhiniyam, 2023",
      gist: "Witnesses are examined in chief, then cross-examined if the adverse party desires, then re-examined if the party calling them desires. Cross-examination need not be confined to the facts spoken to in chief.",
    },
    mustContain: [
      "Your case, put to the witness. What is never put is taken as never disputed.",
      "Questions on relevant facts — but not limited to what the witness said in chief.",
      "A purpose for each line: to contradict, to test credit, or to elicit something the witness alone can give.",
      "Re-examination kept in view: it is directed to explaining matters raised in cross, and new matter needs the court's permission.",
    ],
    defects: [
      "Not putting your case, and arguing at final hearing something no witness was ever asked about.",
      "Cross-examining at length on matters that do not touch an issue.",
      "Opening a door in cross that lets in evidence the witness could not otherwise have given.",
    ],
    related: ["examination-in-chief", "oral-arguments", "issues"],
  },
  {
    slug: "written-arguments",
    draftsAs: "written-arguments",
    name: "Written Arguments",
    stage: 7,
    lede: "The case in writing, on the record — and it must be in before you stand up.",
    provision: {
      cite: "Order XVIII Rule 2(3A), Code of Civil Procedure, 1908",
      gist: "A party must submit concise written arguments under distinct headings within four weeks before oral arguments begin. They form part of the record.",
    },
    mustContain: [
      "Filing within four weeks before oral arguments commence — Order XVIII Rule 2(3A).",
      "Distinct headings, so the court can follow the structure without reconstructing it.",
      "Argument tied to the issues as framed, issue by issue.",
      "Each proposition supported by the authority it rests on, cited properly.",
      "A copy furnished to the opposite party at the same time as the court.",
    ],
    defects: [
      "A restatement of the plaint. Written arguments are argument, not pleading repeated.",
      "Authorities cited without the proposition they are cited for.",
      "Arguing a point that was never an issue, and never put in cross-examination.",
    ],
    related: ["oral-arguments", "cross-examination", "issues"],
  },
  {
    slug: "oral-arguments",
    name: "Oral Arguments",
    stage: 7,
    lede: "The hearing itself — where the written case is defended out loud, and time is short.",
    provision: {
      cite: "Order XVIII Rule 2, Code of Civil Procedure, 1908",
      gist: "The party with the right to begin states his case and produces his evidence, and the other party then states his case. Written arguments must already be on record before oral arguments begin.",
    },
    mustContain: [
      "Written arguments already filed — Rule 2(3A) puts them before the oral hearing, not after.",
      "The issues, taken in order, and answered.",
      "The record cited by reference: which affidavit, which paragraph, which exhibit.",
      "The authorities you rely on, and a fair account of those against you.",
      "An argument that fits the time the court allows — Rule 2(3B)–(3C) let the court fix limits.",
    ],
    defects: [
      "Reading the written arguments aloud, which spends the hearing on what the court already has.",
      "Raising a case not pleaded, not made an issue, and not put in cross-examination.",
      "Leaving the strongest point until the time has run out.",
    ],
    related: ["written-arguments", "cross-examination"],
  },
];

export function getDocument(slug: string) {
  return DOCUMENTS.find((d) => d.slug === slug);
}

/** Grouped by the map stage they belong to, in stage order. */
export function documentsByStage() {
  const stages = [...new Set(DOCUMENTS.map((d) => d.stage))].sort(
    (a, b) => a - b,
  );
  return stages.map((stage) => ({
    stage,
    documents: DOCUMENTS.filter((d) => d.stage === stage),
  }));
}

/**
 * Find the document reference page that covers a note's authority, so the
 * review notes can say why a provision matters using text that has already
 * been checked. Deliberately strict: it matches on an Order number plus a Rule
 * (or a document whose cite names the Order with no Rule), and returns nothing
 * when more than one document fits. A free-text authority from a model that
 * does not match cleanly gets no explainer rather than a wrong one.
 */
export function findDocumentForAuthority(authority: string): LegalDocument | undefined {
  const order = authority.match(/\border\s+([ivxlc]+)\b/i)?.[1];
  if (!order) return undefined;
  const rule = authority.match(/(?:rules?|rr?\.?)\s*(\d+[a-z]?(?:\(\d+[a-z]?\))?)/i)?.[1];

  const wordsOf = (text: string) => text.toLowerCase().split(/[^a-z0-9()]+/);
  const namesOrder = (cite: string) => {
    const w = wordsOf(cite);
    return w.some((word, n) => word === "order" && w[n + 1] === order.toLowerCase());
  };
  const sameOrder = DOCUMENTS.filter((d) => namesOrder(d.provision.cite));

  const hasRule = (cite: string) => /\brules?\b/i.test(cite);
  const wanted = rule?.toLowerCase();
  const exact = wanted
    ? sameOrder.filter((d) => {
        const cite = d.provision.cite.toLowerCase();
        return cite.includes("rule " + wanted) || cite.includes("rules " + wanted);
      })
    : [];
  const matches = exact.length > 0 ? exact : sameOrder.filter((d) => !hasRule(d.provision.cite));

  return matches.length === 1 ? matches[0] : undefined;
}

/** Week of the year, counted the way the website's DocumentOfTheWeek counts it. */
function weekNumber(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const day = Math.floor((d.getTime() - start) / 86_400_000);
  return Math.floor((day + new Date(start).getUTCDay()) / 7);
}

/** One reference page, rotated weekly; the same pick on the website and in the app. */
export function documentOfTheWeek(now: Date = new Date()) {
  return DOCUMENTS[(weekNumber(now) + now.getUTCFullYear()) % DOCUMENTS.length];
}
