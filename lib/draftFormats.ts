/**
 * The 99-format civil/criminal drafting index for the Advocates flow
 * (app/draft-bot/formats). Content — names, categories, and descriptions —
 * is transcribed from a reference list an advocate supplied directly, not
 * generated; the serial numbers below are that same list's own numbering
 * (an already-alphabetical A-Z sequence spanning both civil and criminal),
 * kept as-is rather than renumbered per category so an item's number stays
 * a stable reference regardless of which tab it's viewed from. Items
 * originally marked "Civil/Criminal" (or otherwise usable in either
 * jurisdiction) are `category: "both"` and appear under both tabs.
 */

export type FormatCategory = "civil" | "criminal" | "both";

export type DraftFormat = {
  sno: number;
  name: string;
  category: FormatCategory;
  description: string;
};

export const DRAFT_FORMATS: DraftFormat[] = [
  { sno: 1, name: "Adjournment Petition", category: "both", description: "A short petition stating the genuine reason for seeking time, such as illness, non-availability of a witness, non-receipt of documents or engagement before a superior court. Avoid vague grounds." },
  { sno: 2, name: "Affidavit", category: "civil", description: "Contains the deponent's description, numbered facts based on personal knowledge, verification, signature and attestation. Interlocutory applications are ordinarily supported by affidavits." },
  { sno: 3, name: "Affidavit in Lieu of Chief-Examination", category: "civil", description: "Prepared under Order XVIII Rule 4 CPC. It must follow the pleadings, identify documents and avoid facts outside the plaint or written statement." },
  { sno: 4, name: "Anticipatory Bail Petition", category: "criminal", description: "Contains crime number, alleged offences, prosecution allegations, defence version, absence of criminal antecedents, cooperation undertaking and grounds showing why custodial interrogation is unnecessary." },
  { sno: 5, name: "Appeal Memorandum", category: "both", description: "Contains particulars of the impugned judgment, limitation, valuation, concise grounds of challenge and prayer to set aside, modify or reverse the decision." },
  { sno: 6, name: "Arrest Before Judgment Petition", category: "civil", description: "Filed under Order XXXVIII Rule 5 CPC. Specific material must show that the defendant intends to obstruct or delay execution by disposing of or removing property." },
  { sno: 7, name: "Bail Application — Regular", category: "criminal", description: "Sets out arrest and remand dates, allegations, stage of investigation, period of custody, recoveries, criminal antecedents, parity, health and undertaking to comply with conditions." },
  { sno: 8, name: "Bail Bond and Surety Bond", category: "criminal", description: "Contains particulars of the accused and surety, bond amount, property or identity details and undertaking to secure the accused's appearance." },
  { sno: 9, name: "Brief Facts Note", category: "both", description: "A private advocate's working note containing chronology, parties, pleadings, issues, evidence, contradictions, exhibits, applicable provisions, citations and precise relief required." },
  { sno: 10, name: "Cause Title (Civil)", category: "civil", description: "Shows the name of the court, case number, full particulars of parties and their procedural status. Representatives, minors, firms and legal heirs must be correctly described." },
  { sno: 11, name: "Cause Title (Criminal)", category: "criminal", description: "Shows the court, case or crime number, complainant or State, accused particulars and status such as petitioner, respondent, accused or de facto complainant." },
  { sno: 12, name: "Caveat Petition", category: "civil", description: "Filed under Section 148-A CPC when litigation is expected. It requests the court not to pass an interim order without notice to the caveator." },
  { sno: 13, name: "Chief-Examination", category: "criminal", description: "The witness narrates relevant facts in chronological order and identifies material objects and documents. Leading questions on disputed facts should be avoided." },
  { sno: 14, name: "Civil Miscellaneous Appeal", category: "civil", description: "Challenges appealable interlocutory orders. It contains facts, limitation, statutory provision, grounds and interim prayer where necessary." },
  { sno: 15, name: "Commission Petition", category: "civil", description: "Filed under Order XXVI CPC for local inspection, measurement, noting physical features, examination of witnesses, accounts or scientific investigation." },
  { sno: 16, name: "Complaint to Magistrate", category: "criminal", description: "Contains the court's jurisdiction, parties, occurrence, role of each accused, ingredients of offences, witnesses, documents, limitation and prayer for cognizance." },
  { sno: 17, name: "Compromise Petition", category: "both", description: "Records lawful terms voluntarily accepted by the parties. In criminal matters, compounding depends upon the nature of the offence and statutory permission." },
  { sno: 18, name: "Condone Delay Petition", category: "both", description: "Must explain the entire material period of delay, supported by an affidavit and documents. “Sufficient cause” must be pleaded honestly and specifically." },
  { sno: 19, name: "Counter Affidavit", category: "both", description: "Begins with preliminary objections, replies paragraph-wise to the opposing affidavit, presents the respondent's case and ends with the dismissal prayer." },
  { sno: 20, name: "Cross-Examination Method", category: "both", description: "Secure admissions, test personal knowledge, expose omissions and contradictions, challenge documents and establish the defence theory through short, controlled questions." },
  { sno: 21, name: "Defence Statement", category: "criminal", description: "A concise statement of the accused's version, false implication, material contradictions, missing links and documents supporting the defence." },
  { sno: 22, name: "Delay Condonation Affidavit", category: "both", description: "Provides a date-wise explanation, demonstrates bona fides and states that refusal would cause substantial injustice while no irreparable prejudice would be caused to the opposite party." },
  { sno: 23, name: "Discharge Petition", category: "criminal", description: "Shows that the police report and prosecution material, even if accepted at face value, do not disclose sufficient grounds to proceed against the accused." },
  { sno: 24, name: "Document Petition", category: "both", description: "Seeks reception of a document, explaining its relevance, authenticity, custody and, where filed belatedly, the reason for non-production earlier." },
  { sno: 25, name: "Electronic Evidence Certificate", category: "both", description: "A certificate accompanying electronic records in accordance with the Bharatiya Sakshya Adhiniyam, 2023, stating the manner of production, device particulars and integrity of the electronic record." },
  { sno: 26, name: "Execution Petition", category: "civil", description: "Contains decree particulars, date of decree, satisfaction or adjustment, amount due, limitation and the mode of execution sought under Order XXI CPC." },
  { sno: 27, name: "Exemption from Personal Appearance", category: "criminal", description: "States the genuine reason for absence, representation by counsel, undertaking not to dispute identity and assurance of appearance whenever directed." },
  { sno: 28, name: "Ex Parte Decree Set-Aside Petition", category: "civil", description: "Filed under Order IX Rule 13 CPC, explaining non-service of summons or sufficient cause preventing appearance when the suit was called." },
  { sno: 29, name: "Final Arguments — Civil", category: "civil", description: "Proceed issue-wise: pleadings, burden of proof, evidence, admissions, exhibits, governing law, precedents and exact relief." },
  { sno: 30, name: "Final Arguments — Criminal Defence", category: "criminal", description: "Proceed ingredient-wise: presumption of innocence, burden on prosecution, contradictions, omissions, defective investigation, missing links and reasonable doubt." },
  { sno: 31, name: "Final Report/Charge-Sheet Objections", category: "criminal", description: "The de facto complainant may point out ignored evidence, omitted accused, incorrect conclusions or defects before the court acts upon the police report." },
  { sno: 32, name: "Garnishee Petition", category: "civil", description: "Seeks attachment of money belonging to the judgment-debtor but held by a third party, such as a bank, employer or debtor." },
  { sno: 33, name: "Guardianship Petition", category: "civil", description: "Contains the minor's particulars, relationship of parties, present custody, welfare considerations, property details and the relief sought." },
  { sno: 34, name: "Habeas Corpus-Related Magistrate Representation", category: "criminal", description: "Where relevant, records allegedly unlawful custody and seeks immediate production or appropriate protective directions. The principal constitutional remedy lies before the High Court or Supreme Court." },
  { sno: 35, name: "Handwriting or Signature Expert Petition", category: "both", description: "Seeks comparison or expert examination of disputed signatures, handwriting, thumb impressions or alterations when the question is material to adjudication." },
  { sno: 36, name: "Implead Petition", category: "civil", description: "Filed under Order I Rule 10 CPC. It must show that the proposed party is necessary or proper for complete and effective adjudication." },
  { sno: 37, name: "Injunction Petition", category: "civil", description: "Filed under Order XXXIX Rules 1 and 2 CPC. Establish prima facie case, balance of convenience and irreparable injury." },
  { sno: 38, name: "Interim Maintenance Petition", category: "both", description: "States the relationship, dependency, needs, income and earning capacity of both parties, existing liabilities and the amount reasonably required." },
  { sno: 39, name: "Interlocutory Application", category: "civil", description: "The standard structure is cause title, provision invoked, relief sought, supporting affidavit, grounds, prayer and documents." },
  { sno: 40, name: "Issue Memo", category: "civil", description: "Each proposed issue should identify a material proposition affirmed by one party and denied by the other. Avoid argumentative or evidentiary language." },
  { sno: 41, name: "Judgment Review Note", category: "both", description: "A practical note identifying pleadings, issues or charges, findings, evidence considered or ignored, legal errors, relief granted and appealable defects." },
  { sno: 42, name: "Jurisdiction Objection", category: "both", description: "Clearly distinguish territorial, pecuniary and subject-matter jurisdiction. State the relevant statutory provision and facts excluding the court's authority." },
  { sno: 43, name: "Legal Notice", category: "civil", description: "Contains parties, transaction, breach, demand, time for compliance and intended proceedings. Avoid unnecessary allegations or admissions." },
  { sno: 44, name: "Legal Notice under Section 138 NI Act", category: "criminal", description: "Identifies cheque particulars, dishonour memo, legally enforceable liability and demands the cheque amount within the statutory period." },
  { sno: 45, name: "Legal-Heir Petition", category: "civil", description: "Seeks bringing legal representatives of a deceased party on record, supported by death certificate, relationship particulars and applications to set aside abatement or condone delay where necessary." },
  { sno: 46, name: "List of Documents", category: "both", description: "Documents should be serially numbered with date, description, original/copy status, relevance and proposed mode of proof." },
  { sno: 47, name: "List of Witnesses", category: "both", description: "Mention the witness's name, address and the material fact or document intended to be proved through that witness." },
  { sno: 48, name: "Maintenance Case", category: "both", description: "Pleads relationship, neglect or refusal, inability of the claimant to maintain himself or herself, respondent's means and monthly requirements." },
  { sno: 49, name: "Memo", category: "both", description: "Used to place a limited fact on record, report compliance, file documents, furnish an address, adopt pleadings, report death or withdraw a request where permissible." },
  { sno: 50, name: "Memo of Costs", category: "civil", description: "Contains court fee, process fee, advocate's fee and other permissible expenses claimed by the successful party." },
  { sno: 51, name: "Memo of Evidence", category: "both", description: "A concise list of oral and documentary evidence relied upon by a party." },
  { sno: 52, name: "NI Act Complaint", category: "criminal", description: "Pleads legally enforceable debt, issuance of cheque, timely presentation, dishonour, notice within 30 days, failure to pay within 15 days, jurisdiction, limitation and prayer." },
  { sno: 53, name: "Non-Bailable Warrant Recall Petition", category: "criminal", description: "Explains non-appearance, expresses readiness to participate, offers an undertaking and requests recall of the warrant on suitable terms." },
  { sno: 54, name: "Notice to Admit Documents", category: "civil", description: "Calls upon the opposite party to admit specified documents or facts, narrowing the controversy and avoiding unnecessary proof." },
  { sno: 55, name: "Objections in Execution", category: "civil", description: "State whether the objection concerns executability, satisfaction, identity of property, excess execution, attachment, limitation or rights of third parties." },
  { sno: 56, name: "Objections to Commissioner's Report", category: "civil", description: "Identify specific factual, procedural or technical defects and seek rejection, remittance or examination of the commissioner." },
  { sno: 57, name: "Original Petition", category: "civil", description: "Used in matrimonial, guardianship, succession, arbitration and special-statute proceedings. Its form depends upon the governing enactment and local rules." },
  { sno: 58, name: "Plaint", category: "civil", description: "The essential structure is cause title, description of parties, material facts, cause of action, jurisdiction, limitation, valuation, court fee, relief and verification." },
  { sno: 59, name: "Police Custody Objection", category: "criminal", description: "Challenges necessity, duration and purpose of custody, highlighting prior interrogation, recoveries, cooperation and safeguards against coercion." },
  { sno: 60, name: "Private Complaint", category: "criminal", description: "Narrates the offence and role of each accused, lists witnesses and documents and seeks cognizance, inquiry/investigation where permissible, and issuance of process." },
  { sno: 61, name: "Proof Affidavit", category: "civil", description: "Must remain within pleadings, state facts in the witness's knowledge and properly identify documents proposed for marking." },
  { sno: 62, name: "Property Schedule", category: "civil", description: "Must accurately state district, mandal, village, survey number, subdivision, extent, municipal number and four boundaries. Ambiguity may affect execution." },
  { sno: 63, name: "Protest Petition", category: "criminal", description: "Filed against a closure or referred report, pointing out ignored evidence and requesting rejection of the report, further investigation or treatment as a complaint." },
  { sno: 64, name: "Questionnaire for Client Conference", category: "both", description: "Ascertain chronology, participants, documents, payments, witnesses, prior litigation, notices, admissions, adverse facts, limitation and the exact result expected." },
  { sno: 65, name: "Recall Witness Petition", category: "both", description: "Specifies why recall is necessary, the limited matter for further examination and why the request is not intended to fill a deliberate lacuna." },
  { sno: 66, name: "Rejoinder", category: "civil", description: "Confined to new facts raised in the counter. It should not substantially alter the original case without appropriate amendment." },
  { sno: 67, name: "Reply Notice", category: "both", description: "Respond allegation-wise, preserve the client's rights, avoid unintended admissions and set out the correct facts and legal position." },
  { sno: 68, name: "Restoration Petition", category: "civil", description: "Seeks restoration of a suit, petition or application dismissed for default by explaining sufficient cause for non-appearance." },
  { sno: 69, name: "Return of Property Petition", category: "criminal", description: "Describes the property, ownership or entitlement, seizure particulars and need for interim custody, with an undertaking to produce it when directed." },
  { sno: 70, name: "Set-Off", category: "civil", description: "A defendant claims adjustment of an ascertained sum legally recoverable from the plaintiff, subject to the requirements of Order VIII CPC." },
  { sno: 71, name: "Stay Petition", category: "both", description: "Identifies the proceeding or order sought to be stayed, urgency, prejudice, prima facie case and proposed safeguards." },
  { sno: 72, name: "Succession Certificate Petition", category: "civil", description: "Contains death particulars, family members, debts and securities, jurisdiction, absence of impediment and the applicant's entitlement." },
  { sno: 73, name: "Summon Document Petition", category: "both", description: "Clearly identifies the document, custodian, relevance and reason why production through court process is necessary." },
  { sno: 74, name: "Summon Witness Petition", category: "both", description: "Provides the witness's complete address, purpose of examination and requisite process fee and batta." },
  { sno: 75, name: "Surety Verification Memo", category: "criminal", description: "Contains identity, address, relationship, financial capacity, property documents and declaration regarding other surety obligations." },
  { sno: 76, name: "Temporary Injunction Counter", category: "civil", description: "Challenge the prima facie case, possession, suppression, delay, balance of convenience and alleged irreparable injury. Plead prejudice to the defendant if restrained." },
  { sno: 77, name: "Transfer Petition", category: "both", description: "States the cases involved, present courts, legally recognised grounds for transfer and reasons supporting convenience, fairness or ends of justice." },
  { sno: 78, name: "Trial Notes — Civil", category: "civil", description: "Maintain separate columns for issue, burden, witness, admission, contradiction, exhibit, objection and argument." },
  { sno: 79, name: "Trial Notes — Criminal", category: "criminal", description: "Maintain charge-wise ingredients, prosecution witness purpose, contradictions, omissions, recoveries, forensic evidence, admissibility objections and defence suggestions." },
  { sno: 80, name: "Undertaking Memo", category: "both", description: "Records a voluntary commitment regarding appearance, payment, non-alienation, production of property or compliance with a court direction." },
  { sno: 81, name: "Urgent Hearing Petition", category: "both", description: "Explains the immediate event, fixed date, threatened prejudice and precise interim protection required." },
  { sno: 82, name: "Vakalatnama", category: "both", description: "Contains party particulars, advocate's authority, signatures, acceptance, identifying witness and required stamps. Authority for compromise or receipt of money should be separately verified." },
  { sno: 83, name: "Verification of Pleadings", category: "civil", description: "The party must distinguish paragraphs based on personal knowledge from those based on information or legal advice, and state place and date." },
  { sno: 84, name: "Victim Assistance Petition", category: "criminal", description: "May seek notice, participation, copies, protection, compensation or opportunity of hearing as permitted by the governing procedure." },
  { sno: 85, name: "Written Arguments — Civil", category: "civil", description: "Use a short synopsis, admitted facts, disputed questions, issue-wise submissions, evidence chart, legal propositions, citations and prayer." },
  { sno: 86, name: "Written Arguments — Criminal", category: "criminal", description: "Use charge-wise ingredients, prosecution burden, evidence deficiencies, contradictions, inadmissible material, defence case and acquittal or conviction submission." },
  { sno: 87, name: "Written Statement", category: "civil", description: "Contains preliminary objections, paragraph-wise admissions or denials, defendant's affirmative case, limitation and jurisdiction objections, additional pleas and prayer." },
  { sno: 88, name: "Witness Preparation", category: "both", description: "Explain court procedure and refresh the witness's memory from genuine records. Never coach false evidence. Prepare the witness to listen carefully and answer only what is asked." },
  { sno: 89, name: "Xerox/Certified Copy Reception Petition", category: "both", description: "Explains why the original is unavailable and lays the factual foundation required for admitting secondary evidence. Mere production of a photocopy does not prove its contents." },
  { sno: 90, name: "Cross-Examination Plan (“X” Practice Note)", category: "both", description: "Divide questions into identity, capacity, source of knowledge, chronology, documents, omissions, contradictions, motive, probability and final defence suggestions." },
  { sno: 91, name: "Year-Wise Chronology", category: "both", description: "Prepare a date-and-event chronology before drafting. It assists in detecting limitation, inconsistencies, prior proceedings and missing documents." },
  { sno: 92, name: "Zero-Defect Filing Checklist", category: "both", description: "Verify court name, jurisdiction, case type, party names, statutory provisions, limitation, valuation, court fee, signatures, verification, affidavit, attestation, annexures, pagination, copies, process fee and vakalatnama." },
  { sno: 93, name: "Plaintiff/Complainant Style", category: "both", description: "Narrate affirmative facts chronologically and establish every ingredient necessary for granting relief." },
  { sno: 94, name: "Defendant/Accused Style", category: "both", description: "First identify what the opponent must prove; then attack maintainability, legal ingredients, credibility, documents and burden of proof." },
  { sno: 95, name: "Petition Style", category: "both", description: "Keep facts brief and focus on the statutory condition required for the particular interlocutory relief." },
  { sno: 96, name: "Affidavit Style", category: "both", description: "Use first-person factual statements. Avoid arguments, lengthy quotations and facts outside personal knowledge unless their source is disclosed." },
  { sno: 97, name: "Cross-Examination Style", category: "both", description: "Ask one fact per question, use short leading questions and obtain admissions before confronting the witness with documents or contradictions." },
  { sno: 98, name: "Oral Argument Style", category: "both", description: "Begin with the exact relief, identify the decisive question, state three or four strongest facts, connect them to the provision and precedent, and conclude with the precise order requested." },
  { sno: 99, name: "Senior-Practitioner Style", category: "both", description: "Separate admitted facts from disputed facts; identify the burden of proof; rely on the record rather than rhetoric; address the opponent's strongest point fairly; and hand over a short note containing the proposition, evidence and authority." },
];

/** The 18-point structure most principal filings should contain — reference
 *  text on the formats page, not itself one of the 99 selectable items. */
export const STANDARD_FILING_STRUCTURE: string[] = [
  "Name of the court.",
  "Case number or proposed case number.",
  "Correct cause title.",
  "Provision under which the proceeding is filed.",
  "Description of parties.",
  "Short introductory facts.",
  "Chronological material facts.",
  "Essential statutory ingredients.",
  "Specific role or liability of each opposite party or accused.",
  "Cause of action or occurrence particulars.",
  "Territorial and subject-matter jurisdiction.",
  "Limitation.",
  "Interim relief, if required.",
  "Main prayer.",
  "Verification or supporting affidavit.",
  "List of documents.",
  "List of witnesses.",
  "Advocate's signature, party's signature, place and date.",
];

export function formatsByCategory(category: "civil" | "criminal"): DraftFormat[] {
  return DRAFT_FORMATS.filter((f) => f.category === category || f.category === "both").sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}

export function getFormat(sno: number): DraftFormat | undefined {
  return DRAFT_FORMATS.find((f) => f.sno === sno);
}
