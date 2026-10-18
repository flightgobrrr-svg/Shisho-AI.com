import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { Button } from "@/components/ui/Button";
import { StepMark } from "@/components/ui/StepMark";

export const metadata: Metadata = {
  title: "The internship",
  description:
    "What the rules require, what chambers will actually ask of you, and how to be useful in the first week.",
};

/**
 * Stage 9 of the map — what happens after the file closes.
 *
 * This is NOT a Shisho internship programme. There isn't one, and a page
 * implying placements, partner firms or stipends would be exactly the invented
 * content lib/library.ts and HANDOFF.md forbid. It is what this site is
 * already for: teaching. Everything factual below is the BCI requirement,
 * verified; everything else is practice, written as practice.
 *
 * If a real programme is ever launched, this page becomes its explainer — the
 * requirement section stays true either way.
 */

/* Bar Council of India, Rules of Legal Education 2008 (Rule 25). Verified
   before writing: the durations, the four-week annual cap, and the permitted
   venues are the Council's, not an approximation of them.
   The visible copy below cites the rule (instrument + rule number) without
   naming the issuing body — an explicit later request, not an oversight; see
   HANDOFF.md. Don't "fix" this back without checking there first. */
const REQUIREMENT = [
  {
    label: "Five-year course",
    value: "20 weeks",
    note: "Across the whole degree, not in one block.",
  },
  {
    label: "Three-year course",
    value: "12 weeks",
    note: "Same rule, shorter degree.",
  },
  {
    label: "In any one year",
    value: "4 weeks max",
    note: "You cannot bank it all into a final-year summer.",
  },
];

const ASKED_OF_YOU = [
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
];

const FIRST_WEEK = [
  "Ask which matters you may read, and read those files end to end before you ask anything else.",
  "Learn the listing: which court, which item, what time, and who appears.",
  "Keep a running note of every task, who gave it, and when it is due. Nobody will chase you for it.",
  "Cite properly from day one — the neutral citation, the paragraph number. Habits formed in week one are the ones that survive.",
  "Ask for the marked-up version of anything you drafted. If it comes back clean, ask again.",
];

export default function InternshipPage() {
  return (
    <>
      <Section className="!pb-12">
        <Container>
          <div className="flex items-center gap-3">
            <Link
              href="/map#stage-9"
              className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
            >
              Beyond the matter
            </Link>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-title font-semibold">
            Twelve weeks, or twenty. What you do with them is the
            whole <Emphasis>difference</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
            Every law student in India interns. Most come away with a
            certificate. The ones who come away with something else treat it as
            the first file they ever worked, not as attendance.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>What the rules require</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            The rules set a floor.
          </h2>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {REQUIREMENT.map((r) => (
              <li
                key={r.label}
                className="border border-ink/45 bg-paper p-6"
              >
                <p className="label-mono text-ink-faint">{r.label}</p>
                <p className="mt-3 font-display text-[2rem] leading-none font-semibold text-ink">
                  {r.value}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {r.note}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[62ch] border-l-2 border-seal/70 pl-5 text-[15px] leading-relaxed text-ink-soft">
            Rules of Legal Education, 2008, Rule 25. Internships may be
            served in courts, chambers, law firms, legal departments, or
            with an NGO — and the weeks must be spread across the degree
            rather than banked into one final summer.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>What you will actually be asked to do</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            Four things, over and over.
          </h2>
          <ul className="reveal-stagger mt-10 grid gap-5 md:grid-cols-2">
            {ASKED_OF_YOU.map((item, i) => (
              <li
                key={item.title}
                style={{ "--i": i } as React.CSSProperties}
                className="border border-ink/45 bg-paper-raised p-7"
              >
                <h3 className="font-display text-[19px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>The first week</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            Be useful before you are <Emphasis>interesting</Emphasis>.
          </h2>
          <ol className="reveal-stagger mt-10 max-w-3xl space-y-5">
            {FIRST_WEEK.map((step, i) => (
              <li
                key={step}
                style={{ "--i": i } as React.CSSProperties}
                className="flex gap-4"
              >
                <StepMark n={i + 1} className="mt-0.5 bg-paper-raised" />
                <span className="text-[15.5px] leading-relaxed text-ink">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>What to leave with</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            A record, not a <Emphasis>certificate</Emphasis>.
          </h2>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
            Every draft you touched, in the version you wrote and the version
            that was filed. The difference between those two is the only
            teaching material that is genuinely yours, and it is the thing you
            will still be learning from in your third year of practice.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/documents">Learn the documents</Button>
            <Button href="/draft-bot" variant="ghost">
              Have a draft marked
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
