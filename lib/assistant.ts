/**
 * Shared types for the drafting agent, plus its DEMO-MODE reply engine.
 *
 * Mirrors lib/draft.ts's philosophy exactly: demo mode exists so the agent —
 * chat, file attachment, and "a draft lands in the textarea" — is fully
 * testable before a model is connected. It is keyword matching, not
 * analysis, and every demo reply says so. It must never be presented as real
 * model output.
 *
 * This file (and lib/assistantFiles.ts, lib/assistantEntitlements.ts) is new
 * and independent of lib/draft.ts, app/api/draft/route.ts, and
 * lib/entitlements.ts, which stay untouched.
 */

import { DOC_TYPES, DOC_TYPE_LABELS, type DocType } from "@/lib/draft";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** What the client sends when a file is attached to the current turn. */
export type UploadedFile = {
  filename: string;
  mimeType: string;
  /** Raw file bytes, base64-encoded. */
  dataBase64: string;
};

/** Grounding the client already knows, carried over from the workspace. */
export type AssistantContext = {
  docType?: string;
  draftExcerpt?: string;
};

/**
 * What the model returns each turn. `draft` is populated only once there is
 * enough to actually draft something — otherwise the agent is still asking
 * questions and `draft` stays null. This is how the client tells "keep
 * talking" apart from "here is the document," without parsing free text for
 * a marker.
 */
export type AssistantResponse = {
  mode: "demo" | "live";
  reply: string;
  draft: string | null;
  docType: DocType | null;
};

export const MAX_MESSAGE_CHARS = 4_000;
export const MAX_HISTORY_MESSAGES = 20;
export const MAX_HISTORY_CHARS = 24_000;

/** Draft excerpt sent along as grounding context — capped independently of
 *  and smaller than MAX_DRAFT_CHARS (lib/draft.ts), since it only needs to
 *  orient the agent, not carry the whole document. */
export const MAX_CONTEXT_DRAFT_CHARS = 4_000;

/** ~15MB raw, checked against decoded byte length, not the base64 string length. */
export const MAX_FILE_BYTES = 15_000_000;

export const ACCEPTED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export function isAcceptedMimeType(value: unknown): value is AcceptedMimeType {
  return (
    typeof value === "string" &&
    (ACCEPTED_MIME_TYPES as readonly string[]).includes(value)
  );
}

/* ==========================================================================
   DEMO MODE
   ========================================================================== */

/** Fires when the message reads as a request to actually draft something,
 *  rather than a fact still being described. */
function looksLikeDraftRequest(message: string): boolean {
  return /\bdraft\b|\bwrite (me|us|out)\b|\bprepare\b|\bgenerate\b|\bready to draft\b/i.test(
    message,
  );
}

/** Best-effort doc-type guess from the conversation, for demo mode only —
 *  the live route lets the model decide instead. */
function guessDocType(message: string, context?: AssistantContext): DocType {
  if (context?.docType && (DOC_TYPES as readonly string[]).includes(context.docType)) {
    return context.docType as DocType;
  }
  const lower = message.toLowerCase();

  /* Most specific first: an "affidavit of evidence" is an examination-in-chief
     rather than a bare affidavit, and "written statement" must not fall
     through to "written arguments". */
  if (/\bwritten.statements?\b/.test(lower)) return "written-statement";
  if (/\bcounter.?claims?\b/.test(lower)) return "counter-claim";
  if (/\brejoinder\b|\breplication\b/.test(lower)) return "rejoinder";
  if (/\bexamination.in.chief\b|\baffidavit of evidence\b/.test(lower)) {
    return "examination-in-chief";
  }
  if (/\bwritten.arguments?\b/.test(lower)) return "written-arguments";
  if (/\baffidavit\b/.test(lower)) return "affidavit";
  if (/\bnotice\b/.test(lower)) return "notice";
  if (/\bcontract\b|\bagreement\b/.test(lower)) return "contract";
  if (/\bapplication\b|\binterlocutory\b|\bstay\b|\binjunction\b/.test(lower)) {
    return "application";
  }
  return "plaint";
}

const DEMO_SKELETONS: Record<DocType, string> = {
  plaint: `IN THE COURT OF THE CIVIL JUDGE AT [PLACE]

[SUIT No. ____ of 20__]

[Plaintiff's name] ..... Plaintiff
versus
[Defendant's name] ..... Defendant

MOST RESPECTFULLY SHOWETH:

1. [Parties and their capacity to sue/be sued.]
2. [Facts giving rise to the cause of action, in chronological order.]
3. [When and how the cause of action arose, so limitation can be checked.]

PRAYER

It is therefore prayed that this Hon'ble Court may be pleased to [relief sought].

VERIFICATION
Verified at [place] on this [date] that the contents of paragraphs 1 to 3 are true to my knowledge and the rest are believed to be true on information received.`,
  notice: `TO,
[Recipient's name and address]

NOTICE UNDER [applicable provision, e.g. Section 80 CPC / relevant statute]

Sir/Madam,

Under instructions from and on behalf of my client, [client's name], I address you as follows:

1. [Facts giving rise to the claim.]
2. [The specific default or wrong complained of.]
3. You are hereby called upon to [demand], within [notice period] days of receipt of this notice, failing which my client shall be constrained to initiate appropriate proceedings against you, at your risk, cost, and consequences.

[Advocate's name]
For the Sender`,
  "written-statement": `IN THE COURT OF THE CIVIL JUDGE AT [PLACE]

[SUIT No. ____ of 20__]

[Plaintiff's name] ..... Plaintiff
versus
[Defendant's name] ..... Defendant

WRITTEN STATEMENT ON BEHALF OF THE DEFENDANT

PRELIMINARY OBJECTIONS

1. [Objections going to the root — limitation, jurisdiction, no cause of action, non-joinder. Limitation is not saved for later; unpleaded, it is very hard to argue.]

PARAGRAPH-WISE REPLY

2. [Reply to paragraph 1 of the plaint. Admit, deny, or state what is not admitted — specifically. An allegation not specifically denied is taken to be admitted.]
3. [Reply to paragraph 2 of the plaint.]

ADDITIONAL PLEAS

4. [New facts the Plaintiff must meet — discharge, fraud, and anything else that would otherwise take him by surprise.]

PRAYER

It is therefore prayed that the suit be dismissed with costs.

VERIFICATION
Verified at [place] on this [date] that the contents of paragraphs 1 to 4 are true to my knowledge and the rest are believed to be true on information received.`,
  "counter-claim": `IN THE COURT OF THE CIVIL JUDGE AT [PLACE]

[SUIT No. ____ of 20__]

COUNTER-CLAIM ON BEHALF OF THE DEFENDANT
[Under Order VIII Rule 6A CPC, filed with the written statement.]

MOST RESPECTFULLY SHOWETH:

1. [The right or claim accruing to the Defendant against the Plaintiff, and the date it accrued — it must have accrued before the defence was delivered.]
2. [The facts constituting the cause of action for the counter-claim, pleaded as they would be in a plaint, not as argument against the plaint.]
3. [The value of the counter-claim, for jurisdiction and for court fee. Court fee is payable as on a plaint.]

PRAYER

It is therefore prayed that this Hon'ble Court may be pleased to [specific relief claimed against the Plaintiff], with costs.

VERIFICATION
Verified at [place] on this [date] that the contents of paragraphs 1 to 3 are true to my knowledge and the rest are believed to be true on information received.`,
  rejoinder: `IN THE COURT OF THE CIVIL JUDGE AT [PLACE]

[SUIT No. ____ of 20__]

REJOINDER ON BEHALF OF THE PLAINTIFF TO THE WRITTEN STATEMENT
[Filed with the leave of this Hon'ble Court granted on [date]. A rejoinder is not a pleading the Code guarantees.]

MOST RESPECTFULLY SHOWETH:

1. [Answer confined to the new facts raised in the written statement. A rejoinder cannot repair a cause of action that was never pleaded, and cannot set up a fresh case — that needs an amendment under Order VI Rule 17.]
2. [Specific denial of each new allegation not admitted.]

PRAYER

It is therefore prayed that the preliminary objections and additional pleas be rejected and the suit decreed as prayed.

VERIFICATION
Verified at [place] on this [date] that the contents of paragraphs 1 to 2 are true to my knowledge and the rest are believed to be true on information received.`,
  application: `IN THE COURT OF [FORUM]

[SUIT/CASE No. ____ of 20__]

APPLICATION UNDER [applicable provision]

MOST RESPECTFULLY SHOWETH:

1. [Background of the main proceeding.]
2. [Grounds for the relief sought in this application — for interim relief, address prima facie case, balance of convenience, and irreparable injury.]

PRAYER

It is therefore prayed that this Hon'ble Court may be pleased to [interim relief sought], pending disposal of the main [suit/petition].`,
  affidavit: `IN THE COURT OF [FORUM]

[SUIT/CASE No. ____ of 20__]

AFFIDAVIT OF [deponent's name]

I, [full name], aged about [age] years, [occupation], resident of [address], do hereby solemnly affirm and state as follows:

1. That I am the [capacity — Plaintiff / Defendant / authorised representative] in the above matter and am competent to swear this affidavit.
2. [One matter to a paragraph, confined to facts within my own knowledge. No argument and no submission — an affidavit that argues is not an affidavit under Order XIX Rule 3.]
3. [For anything on information: name the source of the information, then state that it is believed to be true.]

DEPONENT

VERIFICATION
Verified at [place] on this [date] that paragraphs [__] of this affidavit are true to my knowledge and paragraphs [__] are true on information received from [source] and believed by me to be true, and that nothing material has been concealed.

DEPONENT

[To be sworn or affirmed before a person authorised to administer the oath under Section 139 CPC.]`,
  "examination-in-chief": `IN THE COURT OF [FORUM]

[SUIT No. ____ of 20__]

AFFIDAVIT BY WAY OF EXAMINATION-IN-CHIEF OF [witness's name], [PW-__ / DW-__]
[Filed under Order XVIII Rule 4 CPC.]

I, [full name], aged about [age] years, [occupation], resident of [address], do hereby solemnly affirm and state as follows:

1. That I am the [capacity] in the above matter and depose to the following facts from my own knowledge.
2. [The facts this witness is called to prove, in the order they occurred. Evidence, not argument — an affidavit that argues is neither a valid affidavit nor a valid examination-in-chief.]
3. That I have seen the [document] dated [date], now shown to me and marked Exhibit [__]. [Every document to be proved through this witness must be brought in here, or it is left unproved.]

DEPONENT

VERIFICATION
Verified at [place] on this [date] that the contents of this affidavit are true to my knowledge.

DEPONENT

[A copy is to be furnished to the opposite party, since cross-examination proceeds on it.]`,
  "written-arguments": `IN THE COURT OF [FORUM]

[SUIT No. ____ of 20__]

WRITTEN ARGUMENTS ON BEHALF OF THE [PLAINTIFF / DEFENDANT]
[Filed under Order XVIII Rule 2(3A) CPC — concise, under distinct headings, within four weeks before oral arguments commence.]

I. LIST OF DATES
[The chronology, briefly.]

II. ISSUE NO. 1 — [the issue as framed by the court]
[The submission on this issue, and the evidence on record it rests on — the deposition of [PW-__], Exhibit [__]. Argument, not the plaint restated.]
[Authority: [case and citation], cited for the proposition that [proposition it is cited for].]

III. ISSUE NO. 2 — [the issue as framed by the court]
[As above, issue by issue.]

IV. CONCLUSION
[The relief sought, tied back to the issues answered.]

[A copy has been furnished to the opposite party.]`,
  contract: `THIS AGREEMENT is made on [date]

BETWEEN

[Party A's name], [address] (hereinafter "the First Party")

AND

[Party B's name], [address] (hereinafter "the Second Party")

WHEREAS [background/recitals].

NOW THIS AGREEMENT WITNESSES as follows:

1. [Scope/subject matter of the agreement.]
2. [Consideration.]
3. [Term and termination.]
4. [Indemnity — state whose conduct it covers.]

IN WITNESS WHEREOF the parties have set their hands on the day, month, and year first above written.`,
};

const FALLBACK_REPLY =
  "Demo mode has no model connected, so I can't actually gather facts or draft from them — this is a fixed set of sample responses. Tell me you'd like a draft (e.g. \"draft a plaint\") to see the demo skeleton land in the workspace below, or connect a model for the real thing.";

export function demoReply(
  message: string,
  context?: AssistantContext,
  hasFile?: boolean,
): AssistantResponse {
  const trimmed = message.trim();

  if (!trimmed) {
    return { mode: "demo", reply: FALLBACK_REPLY, draft: null, docType: null };
  }

  if (looksLikeDraftRequest(trimmed)) {
    const docType = guessDocType(trimmed, context);
    return {
      mode: "demo",
      reply:
        `Demo mode — here is a sample ${DOC_TYPE_LABELS[docType].toLowerCase()} skeleton, ` +
        "not a real draft from your facts. " +
        "It's in the workspace below; connect a model to get one actually built from what you tell me.",
      draft: DEMO_SKELETONS[docType],
      docType,
    };
  }

  const fileNote = hasFile
    ? " I can see you attached a file, but demo mode doesn't read attachments — connect a model for that."
    : "";

  return {
    mode: "demo",
    reply:
      "Demo mode has no model connected, so I can't gather facts from what you've told me." +
      fileNote +
      " Tell me you're ready to draft (e.g. \"draft a plaint\") to see how a finished draft would land in the workspace below.",
    draft: null,
    docType: null,
  };
}
