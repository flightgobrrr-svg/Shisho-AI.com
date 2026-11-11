/**
 * The /internship page's content, shared by the website and the app.
 *
 * Stage 9 of the map: what happens after the file closes. This is NOT a
 * Shisho internship programme; there isn't one, and a page implying
 * placements, partner firms or stipends would be invented content. Everything
 * factual is the requirement, verified; everything else is practice.
 *
 * Rules of Legal Education, 2008 (Rule 25). Verified before writing: the
 * durations, the four-week annual cap, and the permitted venues. The copy
 * cites the rule (instrument and rule number) without naming the issuing
 * body, an explicit earlier request; see HANDOFF.md before changing that.
 */
export const INTERNSHIP = {
  backLabel: "Beyond the matter",
  headline: "Twelve weeks, or twenty. What you do with them is the whole *difference*.",
  intro:
    "Every law student in India interns. Most come away with a certificate. The ones who come away with something else treat it as the first file they ever worked, not as attendance.",
  requirementEyebrow: "What the rules require",
  requirementHeading: "The rules set a floor.",
  requirement: [
    { label: "Five-year course", value: "20 weeks", note: "Across the whole degree, not in one block." },
    { label: "Three-year course", value: "12 weeks", note: "Same rule, shorter degree." },
    { label: "In any one year", value: "4 weeks max", note: "You cannot bank it all into a final-year summer." },
  ],
  ruleNote:
    "Rules of Legal Education, 2008, Rule 25. Internships may be served in courts, chambers, law firms, legal departments, or with an NGO — and the weeks must be spread across the degree rather than banked into one final summer.",
  askedEyebrow: "What you will actually be asked to do",
  askedHeading: "Four things, over and over.",
  askedOfYou: [
    {
      title: "Research a point, properly",
      body: "Not a summary of the area — the answer to the question asked, with the authority that decides it and the ones that cut against it. A note that hides the bad case is worse than no note.",
    },
    {
      title: "Draft, and be edited",
      body: "A first draft of an application, a notice, a paragraph of a plaint. It will come back marked. The marks are the point; keep every version.",
    },
    {
      title: "Court duty",
      body: "Carry the file, note what fell, note the next date, and report it the same day. A missed date is a real consequence for a real client.",
    },
    {
      title: "Read the file before you are asked to",
      body: "The pleadings first, then the orders, then the documents. Most questions you will be asked are answerable from the file.",
    },
  ],
  firstWeekEyebrow: "The first week",
  firstWeekHeading: "Be useful before you are *interesting*.",
  firstWeek: [
    "Ask which matters you may read, and read those files end to end before you ask anything else.",
    "Learn the listing: which court, which item, what time, and who appears.",
    "Keep a running note of every task, who gave it, and when it is due. Nobody will chase you for it.",
    "Cite properly from day one — the neutral citation, the paragraph number. Habits formed in week one are the ones that survive.",
    "Ask for the marked-up version of anything you drafted. If it comes back clean, ask again.",
  ],
  leaveEyebrow: "What to leave with",
  leaveHeading: "A record, not a *certificate*.",
  leaveBody:
    "Every draft you touched, in the version you wrote and the version that was filed. The difference between those two is the only teaching material that is genuinely yours, and it is the thing you will still be learning from in your third year of practice.",
} as const;
