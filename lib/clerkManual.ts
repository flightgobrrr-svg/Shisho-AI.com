/**
 * The Advocate Clerks' Practice Manual (app/clerks) — Lower Courts, High
 * Courts and Supreme Court, A-Z, Sl. Nos. 1-99. Content is transcribed from
 * a manual an advocate supplied directly, not generated. The closing notes
 * on Supreme Court/AP High Court specifics are kept because they carry a
 * live caveat ("verify local rules") that matters more than it looks —
 * don't drop it when editing this file.
 */

export type ClerkManualEntry = {
  sno: number;
  name: string;
  description: string;
};

export const CLERK_MANUAL_INTRO =
  'An "advocate clerk" means a registered clerk assisting an advocate with filing, scrutiny, court-fee verification, case tracking, certified copies, process, document custody and registry compliance. An advocate clerk is not a court employee, law clerk, advocate or authorised legal adviser.\n\nRegistration, identification, dress, access and filing requirements vary between District Courts, each High Court and the Supreme Court. The relevant court rules and current circulars must therefore be verified.';

export const CLERK_MANUAL: ClerkManualEntry[] = [
  { sno: 1, name: "Advocate-Clerk Registration", description: "Obtain registration from the concerned court or registry in the prescribed form. Submit the advocate's recommendation, photographs, identity and address proof, educational proof and other prescribed documents." },
  { sno: 2, name: "Advocate's Authorisation", description: "The clerk must work only under the authority of the advocate with whom the clerk is registered. A clerk cannot sign pleadings, affidavits, vakalats or legal opinions for the advocate or party." },
  { sno: 3, name: "Affidavit Checking", description: "Confirm the deponent's name, age, address, case particulars, paragraph numbering, verification, place, date, signature and proper attestation." },
  { sno: 4, name: "Appeal Filing Data", description: "Note the date of judgment, decree or order; date of copy application; date copy was made ready; date of delivery; limitation; court fee; and delay, if any." },
  { sno: 5, name: "Acknowledgment Register", description: "Maintain proof of every document, notice, brief, original or amount received and delivered." },
  { sno: 6, name: "Advance-Service Proof", description: "Where required, serve the opposite counsel or designated authority and preserve the signed acknowledgment, email record, postal receipt or electronic delivery proof." },
  { sno: 7, name: "Bail Case File", description: "Keep FIR, complaint, remand report, bail dismissal orders, charge-sheet status, medical papers, criminal antecedent instructions, surety documents and current case stage." },
  { sno: 8, name: "Batta and Process Fee", description: "Calculate and pay process fee, witness batta, postal charges and other prescribed charges within time. Record the payment number and date." },
  { sno: 9, name: "Bench and Court-Hall Verification", description: "Check the daily cause list, roster, court number, serial number, item category and whether the matter is physical, hybrid or virtual." },
  { sno: 10, name: "Brief Movement Register", description: "Record when the file was taken from the office, person receiving it, purpose, court and time of return." },
  { sno: 11, name: "Bundle Preparation", description: "Arrange the file as cause title, index, pleadings, affidavits, applications, counters, documents, orders, evidence and office notes. Paginate continuously." },
  { sno: 12, name: "C.A. — Copy Application", description: "Prepare a copy application for a judgment, decree, order, deposition, exhibit, petition, written statement or other permissible record." },
  { sno: 13, name: "C.A. Diary", description: "Record C.A. number, case number, document applied for, application date, stamps or fee required, compliance date, ready date and delivery date." },
  { sno: 14, name: "Case Diary", description: "Maintain the previous date, proceedings, next date, purpose, advocate assigned, documents required and client instructions." },
  { sno: 15, name: "Cause List", description: "Download or obtain the daily cause list. Mark every office matter, court number, item number, advocate's name and likely time." },
  { sno: 16, name: "Cause-Title Verification", description: "Check spelling, initials, parentage, age, address, party status, legal representatives and case-number particulars." },
  { sno: 17, name: "Certified Copy Collection", description: "Verify completeness, seal, certification, page count and date of delivery. Scan the copy and immediately calculate limitation." },
  { sno: 18, name: "Caveat Search", description: "Before urgent filing, check whether a caveat is lodged and arrange service upon the caveator where required." },
  { sno: 19, name: "Check Slip", description: "Prepare an internal checklist showing court fee, limitation, jurisdiction, signatures, affidavits, annexures, copies, process and filing compliance." },
  { sno: 20, name: "Compliance Memo", description: "Prepare and file a memo stating how a court direction or registry objection has been complied with." },
  { sno: 21, name: "Cost Memo", description: "Prepare details of court fee, process fee, advocate's fee and other legally recoverable expenses following the applicable rules." },
  { sno: 22, name: "Court-Fee Verification", description: "Check the governing statute, valuation, relief, fixed or ad valorem fee, additional court fee and deficit court fee." },
  { sno: 23, name: "Court Order Data", description: "Enter the date, court, order passed, next step, time limit, compliance required and person responsible." },
  { sno: 24, name: "Criminal Case Number Conversion", description: "Track crime number, P.R.C. number, C.C./S.C. number, appeal or revision number and the court to which the matter is committed or transferred." },
  { sno: 25, name: "Daily Board Preparation", description: "Prepare one consolidated list of all cases for the day, court-wise and advocate-wise, before court begins." },
  { sno: 26, name: "Daily Court Report", description: "After court hours, note what happened in every matter, the next date, purpose and action required." },
  { sno: 27, name: "Dates Register", description: "Maintain separate lists for tomorrow, the next seven days, the next thirty days and limitation-sensitive matters." },
  { sno: 28, name: "Defect/Objection Register", description: "Enter filing number, objection, date notified, last date for compliance, person responsible, date refiled and final registration number." },
  { sno: 29, name: "Decree Copy", description: "In civil appeals and execution matters, verify whether both judgment and decree copies are required." },
  { sno: 30, name: "Depositions", description: "Obtain or copy witness depositions, preserve the exhibit markings and provide them to the advocate before cross-examination or arguments." },
  { sno: 31, name: "Document Custody", description: "Keep originals in sealed or clearly labelled covers. Never staple, mark, alter or hand over an original without acknowledgment." },
  { sno: 32, name: "Draft Comparison", description: "Compare the final print with the advocate-approved draft, especially names, dates, survey numbers, amounts, sections, prayers and schedules." },
  { sno: 33, name: "E-Courts Case Status", description: "Check case status, orders, next hearing date and purpose. Do not rely exclusively on an unofficial screenshot when the court record differs." },
  { sno: 34, name: "E-Filing", description: "Convert documents to the prescribed PDF format, arrange bookmarks, OCR, pagination, digital signatures and upload under the correct case category." },
  { sno: 35, name: "Electronic Payment", description: "Preserve the receipt for court fee, copy fee, process fee or e-filing payment and tag it to the concerned case." },
  { sno: 36, name: "Email Register", description: "Maintain case-related emails sent to registries, standing counsel, clients and advocates, with attachments and delivery status." },
  { sno: 37, name: "Exhibit Register", description: "Record exhibit number, date, description, witness through whom marked and whether it is an original, certified copy or electronic record." },
  { sno: 38, name: "Execution Calculation", description: "Update decree amount, interest, costs, payments received and balance due before filing an execution petition or calculation memo." },
  { sno: 39, name: "Filing Counter Work", description: "Present the filing, obtain diary or filing number, receive objections and track the matter until final registration." },
  { sno: 40, name: "Filing Index", description: "Every item should show serial number, description, date and page numbers. Annexure and document descriptions must match the body of the pleading." },
  { sno: 41, name: "Filing Number Register", description: "Record temporary filing number, date, case type, party names, defects, registration number and advocate concerned." },
  { sno: 42, name: "Final Order Follow-Up", description: "Check whether the final order is uploaded, whether a decree is drawn and whether a certified copy or compliance is required." },
  { sno: 43, name: "Fresh-Case File", description: "Open separate physical and digital folders with cause title, client details, limitation note, documents received and filing status." },
  { sno: 44, name: "General Diary Verification", description: "Where accessible, compare the advocate's notes with the court's recorded proceedings and immediately report any discrepancy." },
  { sno: 45, name: "Grounds and Prayer Check", description: "Confirm that the final filing contains the intended grounds, interim relief and main prayer approved by the advocate." },
  { sno: 46, name: "Hearing Folder", description: "For each listed case, keep the latest pleadings, impugned order, important evidence, citations, chronology and one-page hearing note." },
  { sno: 47, name: "High Court Filing", description: "Verify case classification, roster, cause title, affidavit, annexures, impugned order, certified copy requirements, court fee, advance service and required sets." },
  { sno: 48, name: "High Court Writ Set", description: "Ordinarily arrange synopsis, dates, cause title, writ petition, affidavit, material papers, impugned order, representations, proof of service and vakalat." },
  { sno: 49, name: "Hybrid/Virtual Hearing Link", description: "Verify the link and access instructions. Send them only to the authorised advocate and preserve confidentiality." },
  { sno: 50, name: "Identity Card", description: "Carry the valid clerk's identity card while entering filing sections, copying sections and other restricted registry areas." },
  { sno: 51, name: "Indexing", description: "Use exact page references and consistent descriptions. Correct the index whenever additional documents are filed." },
  { sno: 52, name: "Interlocutory Application Register", description: "Track I.A. number, provision, relief, filing date, counter status, order and next step." },
  { sno: 53, name: "Interim-Order Compliance", description: "Note the operative portion, duration, conditions and returnable date. Arrange service and proof of compliance immediately." },
  { sno: 54, name: "Judgment and Order Download", description: "Download only from the official court portal wherever possible. Preserve both the searchable PDF and relevant case-status page." },
  { sno: 55, name: "Judgment/Order Register", description: "Maintain date, case number, parties, result, advocate informed, client informed, copy applied for and limitation." },
  { sno: 56, name: "Judicial Form Selection", description: "Use the prescribed form for summons, warrant, process, copy application, execution, surety or other court procedure." },
  { sno: 57, name: "Limitation Register", description: "Record the starting date, excluded copy period, last date, holidays, delay and proposed filing date. The advocate must independently approve the computation." },
  { sno: 58, name: "List of Documents", description: "Mention serial number, document date, description, original/copy status and page number." },
  { sno: 59, name: "List of Witnesses", description: "Record name, address, purpose of examination, summons status, batta payment and hearing date." },
  { sno: 60, name: "Lower-Court Filing", description: "Check plaint or complaint, petition, affidavit, verification, valuation, court fee, property schedule, vakalat, copies, process forms and supporting documents." },
  { sno: 61, name: "Memo Preparation", description: "Use a memo only for a limited procedural statement such as filing documents, reporting compliance, furnishing address, adopting pleadings or recording payment." },
  { sno: 62, name: "Material-Paper Book", description: "Arrange only the papers needed for hearing, with clear tabs and page numbers." },
  { sno: 63, name: "Monthly Case Audit", description: "Identify unattended cases, missing orders, pending C.As., unresolved defects, process not paid, dormant execution cases and approaching limitation." },
  { sno: 64, name: "Notice Preparation", description: "Check the correct address, number of respondents, copies, covers, acknowledgment cards and required postal or electronic method." },
  { sno: 65, name: "Notice-Service Register", description: "Record notice date, mode, address, tracking number, delivery date, refusal, return endorsement and next legal step." },
  { sno: 66, name: "Next-Date Communication", description: "Send the client and responsible advocate the next date, purpose and documents or attendance required." },
  { sno: 67, name: "Non-Bailable Warrant Tracking", description: "Immediately report the warrant, reason for issuance, next date and steps required for recall, bail or production." },
  { sno: 68, name: "Objection Compliance", description: "Answer every registry objection separately. Make corrections only after advocate approval when the substance of the case is affected." },
  { sno: 69, name: "Order Copy — Plain Copy", description: "Download or collect the available plain copy for immediate information, while separately applying for a certified copy when legally required." },
  { sno: 70, name: '"Out Order" or Result Sheet', description: "Prepare the day's case outcome: called/not called, representation, order, adjournment, next date, purpose and compliance." },
  { sno: 71, name: "Original-Document Register", description: "Mention document description, person delivering it, date received, case, storage place, production date and return acknowledgment." },
  { sno: 72, name: "Pagination", description: "Number every page clearly and continuously. Ensure the index, bookmarks, internal references and physical bundle correspond." },
  { sno: 73, name: "Paper-Book Preparation", description: "Follow the prescribed order, paper size, margins, printing, binding, indexing and number of sets applicable to the concerned court." },
  { sno: 74, name: "Party-Service Set", description: "Prepare a complete, legible copy of the filing and annexures for every party required to be served." },
  { sno: 75, name: "Process Memo", description: "State the party to be served, complete address, mode of service and process required. Attach sufficient copies and pay the prescribed fee." },
  { sno: 76, name: "Process Register", description: "Track summons, notices and warrants from payment until service, return or reissue." },
  { sno: 77, name: "Proof of Service", description: "Preserve acknowledgment, tracking report, bailiff return, email delivery, affidavit of service or endorsement by counsel." },
  { sno: 78, name: "Quality-Control Review", description: "Before filing, perform a final check for blank spaces, inconsistent dates, missing signatures, inverted pages, unreadable scans and incomplete annexures." },
  { sno: 79, name: "Receipt for Client Documents", description: "Give a written receipt specifying each original and copy received. Obtain acknowledgment upon return." },
  { sno: 80, name: "Refile Diary", description: "Record defects cured, refile date, remaining objections and next scrutiny date." },
  { sno: 81, name: "Register of Court Expenses", description: "Record amount received, court fee, process fee, copying charges, printing, binding, travel and balance returned. Attach receipts." },
  { sno: 82, name: "Restoration and Recall Dates", description: "Track dismissals for default, warrants and ex parte orders so that restoration, recall or set-aside applications are moved promptly." },
  { sno: 83, name: "Scanning", description: "Scan clearly, in correct orientation and prescribed resolution. Ensure seals, signatures, photographs, maps and reverse-side endorsements are visible." },
  { sno: 84, name: "Scrutiny Follow-Up", description: "Continue checking until the case receives its regular number. A filing number alone does not establish successful registration." },
  { sno: 85, name: "Supreme Court Clerk Registration", description: "A clerk assisting an Advocate-on-Record must obtain the prescribed Supreme Court registration and identity card and renew it as required." },
  { sno: 86, name: "Supreme Court Filing", description: "Only an Advocate-on-Record is entitled to act and file for a party in the Supreme Court. The clerk assists the AOR but cannot independently file or act." },
  { sno: 87, name: "Supreme Court Paper Book", description: "Verify prescribed forms, chronology, list of dates, impugned orders, certificates, affidavits, annexures, translations, court fee and service requirements." },
  { sno: 88, name: "Supreme Court Defect List", description: "Check registry defects daily and place them before the AOR. Cure and refile within the permitted time." },
  { sno: 89, name: "Supreme Court Listing Follow-Up", description: "Monitor diary number, registration, defects, tentative listing, final cause list, court number, item number, office report and orders." },
  { sno: 90, name: "Surety Papers", description: "Check identity, address, solvency or property records, photographs and signatures, subject to the concerned court's directions." },
  { sno: 91, name: "Tomorrow's Work Sheet", description: "Prepare it before closing the office: cases, court numbers, stages, advocates, clients or witnesses required, files, process and urgent applications." },
  { sno: 92, name: "Translation Verification", description: "Ensure translation of vernacular documents is complete and accurate and carries the required affidavit or certification." },
  { sno: 93, name: "Transmission of Records", description: "Track records called from a subordinate court, dispatch details, receipt in the appellate court and return after disposal." },
  { sno: 94, name: "Vakalatnama", description: "Check the client's complete particulars, case description, signatures, advocate's acceptance, identification, welfare stamp, court fee and date." },
  { sno: 95, name: "Vakalat Register", description: "Record client name, opposite party, case number, advocate, date signed, date filed, change of advocate and discharge or no-objection status." },
  { sno: 96, name: "Verification of Daily Cases", description: "Cross-check the office diary, official cause list, case-status portal and instructions from the appearing advocate." },
  { sno: 97, name: "Witness Coordination", description: "Inform the witness of the date, court and required documents. Confirm attendance without tutoring or influencing testimony." },
  { sno: 98, name: "Weekly Pending-Work Report", description: "List pending filings, defects, C.As., notices, process, certified copies, court orders, client documents and limitation matters." },
  { sno: 99, name: "Zero-Defect Closing Routine", description: "Before leaving, update every case outcome, return all briefs, back up scanned documents, prepare tomorrow's list, report urgent orders and secure originals." },
];

export const CLERK_DAILY_ROUTINE: { heading: string; items: string[] }[] = [
  {
    heading: "Before Court",
    items: [
      "Download the cause lists.",
      "Mark every office case court-wise.",
      "Check additions, deletions and supplementary lists.",
      "Prepare court-hall bundles.",
      "Verify vakalats, memos and petitions to be filed.",
      "Confirm client and witness attendance.",
      "Check process, batta and copy-application work.",
      "Inform each appearing advocate of the item number and stage.",
    ],
  },
  {
    heading: "During Court Hours",
    items: [
      "Follow each court's running serial number.",
      "Keep the correct file ready before the matter is called.",
      "Record the order accurately.",
      "Obtain advocate approval before filing any memo.",
      "Complete filing, copying and process work.",
      "Collect returned papers and receipts.",
      "Report urgent orders immediately.",
    ],
  },
  {
    heading: "After Court",
    items: [
      "Prepare the out-order/result sheet.",
      "Update the case diary.",
      "Enter the next date and purpose.",
      "Communicate the result to the advocate and client.",
      "Apply for urgent copies when directed.",
      "Calculate appeal or compliance limitation.",
      "Prepare the next day's case list.",
      "Return every original and brief to its designated place.",
    ],
  },
];

export type ClerkFormatField = { label: string; blank?: boolean };

export type ClerkPracticalFormat = {
  title: string;
  fields: string[];
  note?: string;
};

export const CLERK_PRACTICAL_FORMATS: ClerkPracticalFormat[] = [
  {
    title: "Filing Checklist",
    fields: [
      "Vakalatnama signed",
      "Court fee paid",
      "Paper book indexed",
      "Copy served on opposite side",
      "Next date added to diary",
    ],
  },
  {
    title: "Daily Court Case Sheet",
    fields: [
      "Court:",
      "Case number:",
      "Party names:",
      "Item number:",
      "Stage/purpose:",
      "Advocate appearing:",
      "Client/witness required: Yes/No",
      "Petition/memo to be filed:",
      "Result/order:",
      "Next date and purpose:",
      "Immediate compliance:",
      "Clerk's initials:",
    ],
  },
  {
    title: "Out-Order/Daily Result Format",
    fields: [
      "Court:",
      "Case number:",
      "Parties:",
      "Item number:",
      "Representation:",
      "Order passed:",
      "Next date:",
      "Next purpose:",
      "Copy required: Yes/No",
      "Process required: Yes/No",
      "Client informed: Yes/No",
      "Advocate informed: Yes/No",
      "Clerk:",
    ],
  },
  {
    title: "Vakalat Register",
    fields: [
      "Serial number:",
      "Date received:",
      "Client's name:",
      "Opposite party:",
      "Court and case number:",
      "Nature of case:",
      "Advocate's name:",
      "Client's signature verified:",
      "Required stamps affixed:",
      "Filing date:",
      "Filing/diary number:",
      "Remarks:",
    ],
  },
  {
    title: "Copy Application — C.A. Working Format",
    fields: [
      "Applicant:",
      "Document required: Judgment/Decree/Order/Deposition/Exhibit/Other",
      "Date of document:",
      "Purpose: Appeal/Revision/Execution/Office record/Other",
      "Urgent/Ordinary:",
    ],
    note: "It is requested that a certified copy of the above document be furnished to the applicant.\n\nC.A. Office Tracking — C.A. filed on / C.A. number / Stamps or fee called for / Due date / Charges deposited / Copy ready on / Copy delivered on / Limitation calculated up to.",
  },
  {
    title: "Process Memo",
    fields: [
      "Name:",
      "Parentage:",
      "Complete address with PIN code:",
      "Mobile number, if permitted:",
      "Mode of service requested: Court process/Registered post/Speed post/Email/Other",
      "Hearing date:",
    ],
    note: "It is respectfully requested that summons/notice/warrant be issued to the above person. Necessary process fee, copies and postal covers are filed.",
  },
  {
    title: "Cost Memo",
    fields: [
      "Court fee paid: ₹",
      "Process fee: ₹",
      "Advocate's fee as permissible: ₹",
      "Witness batta: ₹",
      "Commissioner's fee: ₹",
      "Copying charges: ₹",
      "Other permissible costs: ₹",
      "Total: ₹",
    ],
  },
  {
    title: "Defect/Objection Register",
    fields: [
      "Filing number:",
      "Case title:",
      "Filing date:",
      "Objections notified on:",
      "Full objections:",
      "Last date to cure:",
      "Advocate informed on:",
      "Compliance completed on:",
      "Refiled on:",
      "Regular case number:",
      "Remarks:",
    ],
  },
  {
    title: "Original Document Receipt",
    fields: ["Received from:", "Date:", "Case number:", "Documents (list):"],
    note: "The documents shall be retained solely for the authorised case work and returned against acknowledgment. Signed by: receiving clerk, advocate, client.",
  },
  {
    title: "Limitation Data Sheet",
    fields: [
      "Nature of proposed proceeding:",
      "Date of impugned order/judgment:",
      "Date of knowledge, if relevant:",
      "Copy application date:",
      "Copy ready date:",
      "Copy delivery date:",
      "Time excluded:",
      "Prescribed limitation:",
      "Last date:",
      "Holidays affecting filing:",
      "Delay, if any:",
      "Delay-condonation petition required: Yes/No",
      "Verified by advocate:",
    ],
  },
  {
    title: "Tomorrow's Work Sheet",
    fields: [
      "Cases listed:",
      "Fresh filings:",
      "Defect compliances:",
      "Copy applications:",
      "Copies to collect:",
      "Process and batta:",
      "Clients required:",
      "Witnesses required:",
      "Originals to carry:",
      "Urgent limitation matters:",
      "Advocate-wise file allocation:",
      "Pending office instructions:",
    ],
  },
];

export const CLERK_BASIC_REQUIREMENTS: string[] = [
  "Prescribed minimum age and educational qualification under the applicable rules.",
  "Good character and verifiable address.",
  "Recommendation or employment certificate from the advocate/AOR.",
  "Court registration and valid identity card wherever prescribed.",
  "Working knowledge of civil and criminal case classifications.",
  "Ability to read cause lists, orders and registry objections.",
  "Basic computer, PDF, scanning, email and e-filing skills.",
  "Accuracy in dates, names, amounts and case numbers.",
  "Knowledge of court fee, process and copy procedures.",
  "Confidentiality, honesty and safe custody of documents and money.",
  "Discipline in maintaining registers and receipts.",
  "Clear understanding that the clerk cannot give legal advice, argue, sign pleadings or impersonate an advocate.",
];

export const CLERK_CLOSING_NOTES =
  "The Supreme Court publishes separate forms for fresh registration and renewal of advocate clerks. Supreme Court proceedings must be instituted and acted upon through an Advocate-on-Record; clerk registration does not confer filing or acting rights. The Registry operates under the Supreme Court Rules, 2013 and its Practice and Procedure Handbook. The Andhra Pradesh High Court separately publishes its High Court Rules, e-filing circulars and online copy procedures; its current online certified-document system states a uniform charge of ₹25 per copy application. Local District Court and High Court instructions should always be checked before adopting any fee, number of sets or filing method.";

export function clerkEntriesByLetter(): { letter: string; entries: ClerkManualEntry[] }[] {
  const groups = new Map<string, ClerkManualEntry[]>();
  for (const entry of CLERK_MANUAL) {
    // Skips leading punctuation (entry 70, `"Out Order" or Result Sheet`,
    // starts with a literal quote mark) so it groups under its first real
    // letter rather than spawning its own one-item punctuation group.
    const letter = (entry.name.match(/[A-Za-z]/)?.[0] ?? entry.name[0]!).toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(entry);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, entries]) => ({ letter, entries: entries.sort((a, b) => a.sno - b.sno) }));
}
