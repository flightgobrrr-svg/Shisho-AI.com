import type { AudienceItem } from "@/lib/audiencePages";

/**
 * "What works today": what is live and what is planned, shared by the
 * website's /status and the app's "What works today" so the two never give
 * different answers. Pre-launch honesty (PRODUCT.md): nothing here is marked
 * live that is not.
 */
export const STATUS_LIVE: AudienceItem[] = [
  {
    label: "Shisho — drafting and review",
    note: "Describe the facts for a first draft, or paste one for margin notes. Drafting and margin notes come from a live AI model when one is connected; without one, Shisho runs in a labelled demo mode.",
    status: "live",
    href: "/draft-bot",
  },
  {
    label: "Legal Library",
    note: "Judgments with citation digests, and bare Acts. Every citation checked against a real source.",
    status: "live",
    href: "/library",
  },
  {
    label: "Hearing prep",
    note: "Ask Shisho to prepare you for a hearing. It will not cite a case it is unsure of; read the note before you rely on it.",
    status: "live",
    href: "/draft-bot?mode=ask#ask",
  },
  {
    label: "Limitation checker",
    note: "Last day to file under twelve Articles of the Limitation Act, 1963, plus the written-statement period.",
    status: "live",
    href: "/limitation",
  },
  {
    label: "IPC to BNS",
    note: "Find the new section for a common IPC section. A short list of mappings two published tables agree on.",
    status: "live",
    href: "/ipc-bns",
  },
  {
    label: "Courses",
    note: "Starter and Proficient tracks, plus Legal English and Spoken English classes.",
    status: "live",
    href: "/courses",
  },
  {
    label: "The Map and Documents",
    note: "Every stage of a civil matter, and a reference page for each document filed.",
    status: "live",
    href: "/map",
  },
  {
    label: "Advocate Clerks' manual",
    note: "Registration, filing, scrutiny and working formats, A to Z.",
    status: "live",
    href: "/clerks",
  },
  {
    label: "Moot kit, case-brief practice and revision",
    note: "A memorial outline, an oral-round timer, a brief-then-compare exercise, and saved briefs that return after 1, 7 and 30 days.",
    status: "live",
    href: "/courses/moot",
  },
  {
    label: "Internship guide",
    note: "The Bar Council requirement, and how to meet it.",
    status: "live",
    href: "/internship",
  },
];

export const STATUS_PLANNED: AudienceItem[] = [
  { label: "Contract review", note: "Clause-by-clause review for corporate lawyers.", status: "planned", href: "/for/corporate" },
  { label: "Mock tests", note: "CLAT, judicial services and court staff exams.", status: "planned", href: "/for/clat" },
  { label: "Case record for judges", note: "Issues, facts, authorities and orders, arranged for the bench.", status: "planned", href: "/for/judges" },
  { label: "Lecturer tools", note: "Lesson plans, case materials and assessments.", status: "planned", href: "/for/lecturers" },
  { label: "Plain-language answers", note: "Explaining a notice or a process to a non-lawyer.", status: "planned", href: "/for/citizens" },
  { label: "Online payment", note: "Paid plans are shown, but no one is billed yet.", status: "planned", href: "/refund" },
];

