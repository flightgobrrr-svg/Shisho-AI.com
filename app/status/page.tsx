import type { Metadata } from "next";
import { StatusList } from "@/components/for/StatusList";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import type { AudienceItem } from "@/lib/audiencePages";

export const metadata: Metadata = {
  title: "What works today",
  description:
    "What is live on Shisho AI today, and what is planned, in one place.",
};

const LIVE: AudienceItem[] = [
  {
    label: "Shisho — drafting and review",
    note: "Describe the facts for a first draft, or paste one for margin notes. Runs in demo mode until a live model is switched on.",
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
    note: "Last day to file for seven common Articles of the Limitation Act, 1963.",
    status: "live",
    href: "/limitation",
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
    label: "Moot kit and case-brief practice",
    note: "A memorial outline, an oral-round timer, and a brief-then-compare exercise.",
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

const PLANNED: AudienceItem[] = [
  { label: "Contract review", note: "Clause-by-clause review for corporate lawyers.", status: "planned", href: "/for/corporate" },
  { label: "Mock tests", note: "CLAT, judicial services and court staff exams.", status: "planned", href: "/for/clat" },
  { label: "Case record for judges", note: "Issues, facts, authorities and orders, arranged for the bench.", status: "planned", href: "/for/judges" },
  { label: "Lecturer tools", note: "Lesson plans, case materials and assessments.", status: "planned", href: "/for/lecturers" },
  { label: "Plain-language answers", note: "Explaining a notice or a process to a non-lawyer.", status: "planned", href: "/for/citizens" },
  { label: "Online payment", note: "Paid plans are shown, but no one is billed yet.", status: "planned", href: "/refund" },
];

export default function StatusPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Shisho AI</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          What works <Emphasis>today</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Shisho AI is pre-launch. This is the plain list of what you can use
          now and what is still planned.
        </p>

        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Live</Eyebrow>
            <div className="mt-5">
              <StatusList items={LIVE} />
            </div>
          </div>
          <div>
            <Eyebrow>Planned</Eyebrow>
            <div className="mt-5">
              <StatusList items={PLANNED} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
