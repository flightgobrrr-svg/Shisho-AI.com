import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { StepMark } from "@/components/ui/StepMark";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { INTERNSHIP } from "@/lib/internship";

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
              {INTERNSHIP.backLabel}
            </Link>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-title font-semibold">
            <AudienceHeadline text={INTERNSHIP.headline} />
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
            {INTERNSHIP.intro}
          </p>
        </Container>
      </Section>

      <Section tone="raised">
        <Container>
          <Eyebrow>{INTERNSHIP.requirementEyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            {INTERNSHIP.requirementHeading}
          </h2>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {INTERNSHIP.requirement.map((r) => (
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
            {INTERNSHIP.ruleNote}
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>{INTERNSHIP.askedEyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            {INTERNSHIP.askedHeading}
          </h2>
          <ul className="reveal-stagger mt-10 grid gap-5 md:grid-cols-2">
            {INTERNSHIP.askedOfYou.map((item, i) => (
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

      <Section tone="raised">
        <Container>
          <Eyebrow>{INTERNSHIP.firstWeekEyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            <AudienceHeadline text={INTERNSHIP.firstWeekHeading} />
          </h2>
          <ol className="reveal-stagger mt-10 max-w-3xl space-y-5">
            {INTERNSHIP.firstWeek.map((step, i) => (
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
          <Eyebrow>{INTERNSHIP.leaveEyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            <AudienceHeadline text={INTERNSHIP.leaveHeading} />
          </h2>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
            {INTERNSHIP.leaveBody}
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
