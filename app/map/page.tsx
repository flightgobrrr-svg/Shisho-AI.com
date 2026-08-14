import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { StateSelect } from "@/components/map/StateSelect";
import { MAP_STAGES } from "@/lib/sitemap";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "The map",
  description:
    "Every stage of a matter Shisho covers, from the first client meeting to written arguments.",
};

/**
 * The product map, drawn as the flowchart it was sketched as: nine numbered
 * stages, each a row of ruled boxes, joined by connector rules.
 *
 * Boxes flagged `unread` in lib/sitemap.ts are drawn dashed with a "?" — the
 * transcription could not read that handwriting, and a dashed box says so
 * rather than presenting a guess as settled.
 */
export default function MapPage() {
  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Eyebrow>The map</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            Every stage of a matter, <Emphasis>in order</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
            From the first client meeting to written arguments and citation
            checks.
          </p>
        </Container>
      </Section>

      {/* Ground stays `paper` and the boxes are `paper-raised`, per the token
          comment: paper-raised is for lifted surfaces — cards. This section
          previously put the GROUND on raised and left the boxes unfilled,
          which inverted that and flattened the whole page into one wash. The
          hairline rules still band this section off from the header above. */}
      {/* Keeps its top padding. `!pt-0` was copied in from /library and
          /courses, where the section opens on a heading that brings its own
          space — here it opens straight onto stage 1, so the number box
          collided with the hairline above it. */}
      <Section className="border-y border-ink/10">
        <Container>
          <ol className="reveal-stagger">
            {MAP_STAGES.map((stage, i) => (
              <li
                key={stage.n}
                id={`stage-${stage.n}`}
                style={{ "--i": i } as React.CSSProperties}
                className="relative pb-10 last:pb-0"
              >
                {/* The spine running down the flow. Stops at the last stage so
                    the line never dangles past the final box. */}
                {i < MAP_STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-7 bottom-0 left-3 w-px bg-ink/30"
                  />
                )}

                <div className="flex items-center gap-3.5">
                  <StepMark n={stage.n} className="relative bg-paper" />
                  {/* Indigo, like every other mono label on the site — the
                      palette assigns the cool counter-tone to mono labels and
                      citations, and these were the one set reading as grey. */}
                  <h2 className="label-mono text-indigo">{stage.title}</h2>
                </div>

                {/* Boxes take their natural width and pack along the row.
                    A fixed grid was tried and read as partitioned: single-box
                    stages like Affidavit stretched one cell across a quarter
                    of the page and left three empty, and six-box stages wrapped
                    into a ragged block of cells. Packing them keeps each stage
                    one continuous strip. Uniform height still holds the rows
                    level, so this stays tidy without turning into a table. */}
                <ul className="mt-4 ml-9.5 flex flex-wrap items-stretch gap-2.5">
                  {stage.boxes.map((box) => {
                    const content = (
                      <>
                        {box.ref && (
                          <span className="label-mono shrink-0 text-ink-soft/70">
                            {box.ref}
                          </span>
                        )}
                        <span className="min-w-0">{box.label}</span>
                        {box.unread && (
                          <span
                            className="label-mono ml-auto shrink-0 text-seal"
                            title="Handwriting not read with confidence — needs confirming"
                          >
                            ?
                          </span>
                        )}
                      </>
                    );

                    const shell = cn(
                      "flex h-full min-h-13 items-center gap-2 border px-4 py-3",
                      "bg-paper-raised text-[14.5px] leading-snug text-balance",
                      box.unread
                        ? "border-dashed border-ink/40 text-ink-soft"
                        : "border-ink/45 text-ink",
                    );

                    return (
                      <li key={box.label} className="min-w-0">
                        {box.href ? (
                          <Link
                            href={box.href}
                            className={cn(
                              shell,
                              "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                              /* Lift and darken the rule — never change the
                                 fill. Hovering used to swap to `paper`, which
                                 is DARKER than `paper-raised`, so the box sank
                                 instead of rising. */
                              "hover:-translate-y-0.5 hover:border-ink/75 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                            )}
                          >
                            {content}
                          </Link>
                        ) : (
                          <span className={shell}>{content}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {stage.statePicker && <StateSelect />}
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
