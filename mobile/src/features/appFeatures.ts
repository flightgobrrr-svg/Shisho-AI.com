import type { Href } from "expo-router";

/**
 * What the app has built for the audiences the website still lists as
 * planned. The shared audience data (lib/audiences.ts, lib/audiencePages.ts,
 * lib/nav.ts) stays as it is, because the website has not built these: it
 * would be untrue there. The app reads this list on top of it, so each
 * audience page, the Menu and "What works today" say "In the app" only for
 * what really is in the app.
 */
export type AppFeature = { label: string; note: string; href: Href; offline?: boolean };

export const APP_FEATURES: Record<string, AppFeature[]> = {
  corporate: [
    { label: "Contract review", note: "A contract marked up clause by clause, each note naming the Indian provision.", href: "/tools/contract-review" },
  ],
  scholars: [
    { label: "Trace a doctrine", note: "The verified Library as timelines, by subject or by provision, with your own notes.", href: "/tools/doctrine", offline: true },
  ],
  judges: [
    { label: "Case record", note: "Issues, facts, chronology, authorities and orders, arranged neutrally from the papers.", href: "/tools/case-record" },
  ],
  lecturers: [
    { label: "Lesson plan", note: "Objectives, a timed outline, verified cases, discussion and an assessment for one class.", href: "/tools/lesson-plan" },
    { label: "Trace a doctrine", note: "Judgments on a subject in date order, to build case materials from.", href: "/tools/doctrine", offline: true },
  ],
  clat: [
    { label: "CLAT legal knowledge test", note: "Timed, from verified provisions and landmark judgments, every answer explained.", href: "/tests/clat", offline: true },
  ],
  "judicial-exams": [
    { label: "Judicial services prelims test", note: "CPC, limitation, BSA, IPC to BNS and documents, timed and explained.", href: "/tests/judicial", offline: true },
  ],
  "court-staff": [
    { label: "Court staff exam test", note: "Filing, scrutiny, limitation and procedure, timed and explained.", href: "/tests/court-staff", offline: true },
  ],
  citizens: [
    { label: "Plain-language answer", note: "A notice, summons or process explained in plain English or Hindi.", href: "/tools/plain-answer" },
  ],
  advice: [
    { label: "Plain-language answer", note: "What a legal paper means, any time limit, and what you can do next.", href: "/tools/plain-answer" },
  ],
  students: [
    { label: "Exam revision", note: "Key points and self-test questions for each module of your course.", href: "/exam-revision" },
  ],
};

/** Planned items in the shared lists that the app has built, by their label. */
export const BUILT_IN_APP: Record<string, Href> = {
  "Exam revision": "/exam-revision",
  "Contract review": "/tools/contract-review",
  "Mock tests": "/tests",
  "Case record for judges": "/tools/case-record",
  "Lecturer tools": "/tools/lesson-plan",
  "Plain-language answers": "/tools/plain-answer",
  "Online payment": "/pricing",
};

/** True when the app serves this audience even though the website lists it as planned. */
export const builtInApp = (slug: string) => (APP_FEATURES[slug]?.length ?? 0) > 0;

/** The tools and tests, in the order the Menu lists them. */
export const APP_TOOLS: AppFeature[] = [
  { label: "Clerk Work", note: "Daily dashboard, cases, 63 clerk services", href: "/clerk-work" },
  { label: "Contract review", note: "For corporate lawyers", href: "/tools/contract-review" },
  { label: "Case record", note: "For judges", href: "/tools/case-record" },
  { label: "Lesson plan", note: "For lecturers", href: "/tools/lesson-plan" },
  { label: "Plain-language answer", note: "For everyone", href: "/tools/plain-answer" },
  { label: "Trace a doctrine", note: "For scholars", href: "/tools/doctrine", offline: true },
  { label: "Mock tests", note: "CLAT, judicial services, court staff", href: "/tests", offline: true },
  { label: "Exam revision", note: "For students", href: "/exam-revision" },
  { label: "Saved results", note: "On this phone", href: "/tools/saved", offline: true },
];
