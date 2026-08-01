import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { COLLECTIONS, PREVIEW_CASES } from "@/lib/library";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Legal Library",
  description:
    "Supreme Court and High Court judgments, bare acts, and commentary — searchable and explained in plain language.",
};

export default function LibraryPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Legal Library</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
            The <Emphasis>authorities</Emphasis>, explained.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
            Supreme Court and High Court judgments, bare acts, and commentary —
            searchable, correctly cited, and explained in plain language. Search
            and full text are on the way; below is what the library will hold.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10 !pt-0">
        <Container>
          <h2 className="font-display text-[22px] font-semibold text-ink">
            Three collections
          </h2>
          <ul className="reveal-stagger mt-10 grid gap-6 md:grid-cols-3">
            {COLLECTIONS.map((collection, i) => (
              <li
                key={collection.id}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "flex min-w-0 flex-col rounded-seal border border-ink/10 bg-paper-raised p-7",
                  "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                  "hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                )}
              >
                <span className="label-mono text-ink-soft/70">Coming soon</span>
                <h3 className="mt-4 font-display text-[20px] font-semibold text-ink">
                  {collection.name}
                </h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                  {collection.description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Landmark cases</Eyebrow>
              <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
                Starting with the judgments every student <Emphasis>knows</Emphasis>.
              </h2>
            </div>
            <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
              Subject and subsequent history, flagged where a judgment is no
              longer good law — not a substitute for reading the full report.
            </p>
          </div>

          <ul className="reveal-stagger mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {PREVIEW_CASES.map((item, i) => (
              <li
                key={item.citation}
                style={{ "--i": i } as React.CSSProperties}
                className="group flex min-w-0 flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="min-w-0">
                  <p className="font-display text-[18px] font-semibold text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] group-hover:text-ink-soft">
                    {item.title}
                  </p>
                  <p className="label-mono mt-1.5 text-indigo">{item.citation}</p>
                </div>
                <div className="min-w-0 sm:max-w-xs sm:text-right">
                  <p className="label-mono text-ink-soft/70">{item.court}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    {item.topic}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="raised" className="border-t border-ink/10">
        <Container className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-title font-semibold">
            Read while the library is being <Emphasis>built</Emphasis>.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15.5px] leading-relaxed text-ink-soft">
            Try the Draft Bot on a sample writ petition, or start a course track
            — both cite the same authorities the library will index.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                Try the Draft Bot
              </Button>
            </Magnetic>
            <Button href="/courses" variant="ghost" size="lg">
              Browse courses
            </Button>
          </div>
          <p className="mt-6 text-[13.5px] text-ink-soft">
            Want early access when search goes live?{" "}
            <Link
              href="/"
              className="underline-draw text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink-soft"
            >
              Contact us
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
