import type { Metadata } from "next";
import { StatusList } from "@/components/for/StatusList";
import { NextDateReminder } from "@/components/tools/NextDateReminder";
import { Emphasis } from "@/components/ui/Emphasis";
import { EXTRAS } from "@/lib/audiencePages";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import {
  CLERK_BASIC_REQUIREMENTS,
  CLERK_CLOSING_NOTES,
  CLERK_DAILY_ROUTINE,
  CLERK_MANUAL,
  CLERK_MANUAL_INTRO,
  CLERK_PRACTICAL_FORMATS,
  clerkEntriesByLetter,
} from "@/lib/clerkManual";

export const metadata: Metadata = {
  title: "Advocate Clerks",
  description:
    "The advocate clerks' practice manual — registration, filing, scrutiny, court-fee verification, case tracking and the daily routine, A to Z.",
};

export default function ClerksPage() {
  const groups = clerkEntriesByLetter();

  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Eyebrow>Advocate Clerks</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            The practice manual, A to <Emphasis>Z</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[64ch] whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">
            {CLERK_MANUAL_INTRO}
          </p>
        </Container>
      </Section>

      <Section id="routine" tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>Essential daily routine</Eyebrow>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {CLERK_DAILY_ROUTINE.map((block) => (
              <div key={block.heading}>
                <h2 className="font-display text-[17px] font-semibold text-ink">
                  {block.heading}
                </h2>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink-soft">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="manual">
        <Container>
          <Eyebrow>{CLERK_MANUAL.length} entries</Eyebrow>
          <h2 className="mt-4 font-display text-[1.6rem] font-semibold text-ink">
            The manual
          </h2>

          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <div key={group.letter}>
                <h3 className="label-mono border-b border-ink/15 pb-2 text-indigo">
                  {group.letter}
                </h3>
                <dl className="mt-4 grid gap-x-8 gap-y-5 lg:grid-cols-2">
                  {group.entries.map((entry) => (
                    <div key={entry.sno} className="min-w-0">
                      <dt className="flex items-baseline gap-2.5 font-display text-[15.5px] font-semibold text-ink">
                        <span className="label-mono shrink-0 font-sans text-ink-soft/70">
                          {entry.sno}.
                        </span>
                        {entry.name}
                      </dt>
                      <dd className="mt-1.5 pl-[1.9rem] text-[13.5px] leading-relaxed text-ink-soft">
                        {entry.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="formats" tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>Practical formats</Eyebrow>
          <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-ink-soft">
            Working formats to fill in for daily office use — not pleadings,
            just the fields each one needs.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {CLERK_PRACTICAL_FORMATS.map((format) => (
              <div
                key={format.title}
                className="rounded-seal border border-ink/20 bg-paper p-5"
              >
                <h3 className="font-display text-[16px] font-semibold text-ink">
                  {format.title}
                </h3>
                <ul className="mt-3 space-y-1 text-[13.5px] leading-relaxed text-ink-soft">
                  {format.fields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
                {format.note ? (
                  <p className="mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft/80">
                    {format.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="!py-14 md:!py-16">
        <Container>
          <Eyebrow>More for clerks</Eyebrow>
          <h2 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">
            Every filing, date and file in <Emphasis>order</Emphasis>.
          </h2>
          <div className="mt-6 max-w-3xl">
            <StatusList items={EXTRAS.clerks} />
          </div>
        </Container>
      </Section>

      <Section id="reminder" tone="raised" className="border-y border-ink/10 !py-14 md:!py-16">
        <Container>
          <Eyebrow>Next-date reminder</Eyebrow>
          <h2 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">
            Put the next date in your <Emphasis>calendar</Emphasis>.
          </h2>
          <div className="mt-6">
            <NextDateReminder />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>Basic requirements</Eyebrow>
          <h2 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">
            What a competent clerk should ordinarily have
          </h2>
          <ol className="mt-6 grid list-decimal gap-x-10 gap-y-2 pl-5 text-[14.5px] leading-relaxed text-ink-soft sm:grid-cols-2">
            {CLERK_BASIC_REQUIREMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <p className="mt-10 max-w-[72ch] border-t border-ink/10 pt-6 text-[13px] leading-relaxed text-ink-soft">
            {CLERK_CLOSING_NOTES}
          </p>
        </Container>
      </Section>
    </>
  );
}
