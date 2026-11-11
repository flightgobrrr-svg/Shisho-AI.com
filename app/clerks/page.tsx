import type { Metadata } from "next";
import { StatusList } from "@/components/for/StatusList";
import { NextDateReminder } from "@/components/tools/NextDateReminder";
import { Emphasis } from "@/components/ui/Emphasis";
import { EXTRAS } from "@/lib/audiencePages";
import { SidePhoto } from "@/components/for/SidePhoto";
import { AUDIENCES } from "@/lib/audiences";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
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
  const present = new Set(groups.map((g) => g.letter));

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

      <Section id="routine" tone="raised">
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

          {/* A–Z jump bar, held under the site nav while the manual scrolls:
              99 entries is too long to hunt through by scrolling alone.
              Letters with no entry stay in place, unlinked, so the alphabet
              keeps its shape. */}
          <nav
            aria-label="Jump to a letter"
            className="sticky top-16 z-10 -mx-6 mt-6 bg-paper/95 px-6 py-3 backdrop-blur-sm md:-mx-8 md:px-8"
          >
            <ul className="flex flex-wrap gap-1">
              {ALPHABET.map((letter) =>
                present.has(letter) ? (
                  <li key={letter}>
                    <a href={`#letter-${letter}`} className={cn(LETTER_CELL, "border-ink/25 text-ink hover:border-ink/70 hover:bg-ink/[0.04]")}>
                      {letter}
                    </a>
                  </li>
                ) : (
                  <li key={letter} aria-hidden="true" className={cn(LETTER_CELL, "border-transparent text-ink-faint/50")}>
                    {letter}
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <div key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-16">
                <h3 className="label-mono border-b border-ink/15 pb-2 text-indigo">
                  {group.letter}
                </h3>
                <dl className="mt-4 grid gap-x-8 gap-y-5 lg:grid-cols-2">
                  {group.entries.map((entry) => (
                    <div key={entry.sno} className="min-w-0">
                      <dt className="flex items-baseline gap-2.5 font-display text-[15.5px] font-semibold text-ink">
                        <span className="label-mono w-6 shrink-0 text-right font-sans text-ink-faint tabular-nums">
                          {entry.sno}.
                        </span>
                        {entry.name}
                      </dt>
                      <dd className="mt-1.5 pl-[2.125rem] text-[13.5px] leading-relaxed text-ink-soft">
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

      <Section id="formats" tone="raised">
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
                  <p className="mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-faint">
                    {format.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* The clerks photo on the right, like the homepage hero's. */}
      <Section className="relative isolate overflow-hidden !py-14 md:!py-16">
        <Container>
          <ClerksPhoto />
          <div className="lg:max-w-[54%] lg:min-h-[26rem]">
            <Eyebrow>More for clerks</Eyebrow>
            <h2 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">
              Every filing, date and file in <Emphasis>order</Emphasis>.
            </h2>
            <div className="mt-6">
              <StatusList items={EXTRAS.clerks} />
            </div>
          </div>
        </Container>
      </Section>

      <Section id="reminder" tone="raised" className="!py-14 md:!py-16">
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

/** The clerks photo from the promo video, beside what the site does for them. */
function ClerksPhoto() {
  const photo = AUDIENCES.find((a) => a.slug === "clerks")?.photo;
  return photo ? <SidePhoto photo={photo} /> : null;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_CELL =
  "label-mono inline-flex size-8 items-center justify-center rounded-seal border transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]";
