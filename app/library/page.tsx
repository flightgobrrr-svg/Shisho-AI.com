import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { StageTrail } from "@/components/map/StageTrail";
import {
  COLLECTIONS,
  COURT_FILTERS,
  PREVIEW_CASES,
  isCollectionId,
  isCourtFilter,
} from "@/lib/library";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Legal Library",
  description:
    "Supreme Court and High Court judgments, bare acts, and commentary — searchable and explained in plain language.",
};

/**
 * Accepts `?court=` and `?collection=` so the map's six Library boxes land
 * somewhere that reflects their label instead of all arriving at one page.
 * An unrecognised value is ignored rather than erroring — a bad query should
 * degrade to the full Library, not a 404.
 */
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ court?: string; collection?: string }>;
}) {
  const params = await searchParams;
  const court = isCourtFilter(params.court) ? params.court : null;
  const collection = isCollectionId(params.collection) ? params.collection : null;
  const filter = court ? COURT_FILTERS[court] : null;

  const cases = filter ? PREVIEW_CASES.filter(filter.test) : PREVIEW_CASES;
  const collections = collection
    ? COLLECTIONS.filter((c) => c.id === collection)
    : COLLECTIONS;
  const activeLabel =
    filter?.label ?? COLLECTIONS.find((c) => c.id === collection)?.name ?? null;

  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Legal Library</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
            The <Emphasis>authorities</Emphasis>, explained.
          </h1>
          <StageTrail product="library" className="mt-6" />
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
            Supreme Court and High Court judgments, bare acts, and commentary —
            searchable, correctly cited, and explained in plain language. Search
            and full text are on the way; below is what the library will hold.
          </p>

          {activeLabel && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="label-mono text-ink-soft">Showing</span>
              <span className="flex min-h-11 items-center border border-ink/45 bg-paper-raised px-4 text-[14.5px] text-ink">
                {activeLabel}
              </span>
              <Link
                href="/library"
                className="underline-draw flex min-h-11 items-center text-[14px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
              >
                Show everything
              </Link>
            </div>
          )}
        </Container>
      </Section>

      <Section id="collections" tone="raised" className="border-y border-ink/10 !pt-0">
        <Container>
          <h2 className="font-display text-[22px] font-semibold text-ink">
            {collection ? collections[0]?.name : "Three collections"}
          </h2>
          <ul className="reveal-stagger mt-10 grid gap-6 md:grid-cols-3">
            {collections.map((collection, i) => (
              <li
                key={collection.id}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "flex min-w-0 flex-col rounded-seal border border-ink/45 bg-paper-raised p-7",
                  "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                  "hover:-translate-y-0.5 hover:border-ink/75 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
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

      <Section id="landmarks">
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

          {cases.length === 0 ? (
            /* An empty result that explains itself. `trial-courts` matches
               nothing by design, and saying why is the whole reason that box
               is allowed to be a link. */
            <div className="mt-12 max-w-[62ch] border-l-2 border-seal/70 pl-6">
              <p className="font-display text-[19px] leading-snug font-semibold text-ink">
                Nothing here yet.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {filter?.empty}
              </p>
              <Link
                href="/library"
                className="underline-draw mt-5 inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
              >
                Show everything
              </Link>
            </div>
          ) : (
          <ul className="reveal-stagger mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {cases.map((item, i) => (
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
          )}
        </Container>
      </Section>

      <Section tone="raised" className="border-t border-ink/10">
        <Container className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-title font-semibold">
            Read while the library is being <Emphasis>built</Emphasis>.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15.5px] leading-relaxed text-ink-soft">
            Try Shisho on a sample writ petition, or start a course track
            — both cite the same authorities the library will index.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                Try Shisho
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
