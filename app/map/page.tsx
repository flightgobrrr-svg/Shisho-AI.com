import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { Button } from "@/components/ui/Button";
import { StateSelect } from "@/components/map/StateSelect";
import { BoxMenu } from "@/components/map/BoxMenu";
import { MAP_STAGES, PRODUCT_META } from "@/lib/sitemap";
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
            checks. Codes like <span className="label-mono text-ink">4B</span>{" "}
            are the sub-references drawn on the original sketch this map was
            transcribed from.
          </p>

          {/* An index, for the two things the spine could not give: knowing
              how far this goes before committing to the scroll, and a way past
              it. Nine stages over ~2,400px previously offered no jump and no
              sense of extent — a reader had to scroll the whole thing to learn
              what was in it. */}
          <nav aria-label="Jump to a stage" className="mt-9">
            <ul className="flex flex-wrap gap-2">
              {MAP_STAGES.map((stage) => (
                <li key={stage.n}>
                  <a
                    href={`#stage-${stage.n}`}
                    className="group flex min-h-11 items-center gap-2 border border-ink/25 bg-paper-raised py-2 pr-3.5 pl-2 text-[13.5px] text-ink-soft transition-[transform,border-color,color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:border-ink/60 hover:text-ink"
                  >
                    <StepMark n={stage.n} className="size-5 text-[10px]" />
                    {stage.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
          <ol aria-label="Stages of a matter" className="reveal-stagger">
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
                    className="stage-spine absolute top-7 bottom-0 left-3 w-px bg-ink/30"
                  />
                )}

                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
                  <StepMark n={stage.n} className="relative bg-paper" />
                  {/* The nine stage names ARE the content of this page. Set as
                      11px mono they were smaller than the box labels they
                      contain, so the structure read as captions on its own
                      contents. Display serif at 19px puts the hierarchy back
                      the right way up; the mono treatment stays on the number
                      mark, where it belongs. */}
                  <h2 className="font-display text-[19px] leading-none font-semibold text-ink">
                    {stage.title}
                  </h2>

                  {/* The products that answer this stage. The homepage flow has
                      carried these since it was built; the map itself did not,
                      which left it linking to documents but never to the three
                      things that actually do the work. */}
                  {/* Pushed right, into the empty column. Sitting beside the
                      title they crowded it and read as part of the heading —
                      a problem that only appeared once the title was promoted
                      to display serif. Right-aligned, the row carries one
                      thing on each side instead of three competing systems. */}
                  {/* `ml-9.5` on mobile, where the chips wrap onto their own
                      line: without it they start at the NUMBER's indent while
                      the summary and boxes start at the box indent, so they
                      read as a stray fourth row of the flow. */}
                  {stage.serves.length > 0 && (
                    <ul className="ml-9.5 flex flex-wrap gap-2 sm:ml-auto">
                      {stage.serves.map((product) => {
                        const meta = PRODUCT_META[product];
                        return (
                          <li key={product}>
                            {/* The visible label repeats across stages by
                                design — six chips read "Legal Library" — which
                                left a screen reader's links list with six
                                identical entries. The stage disambiguates the
                                accessible name without adding visible noise. */}
                            <Link
                              href={meta.href}
                              aria-label={`${meta.label} — ${stage.title}`}
                              className="label-mono inline-flex min-h-11 items-center border border-ink/25 px-3 py-2 text-ink-soft transition-[color,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/60 hover:text-ink"
                            >
                              {meta.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Every stage has carried a one-line summary in
                    lib/sitemap.ts since the homepage flow was built, and this
                    page never printed it — leaving "Interlocutory Application"
                    and "Pleadings / Issues" bare in front of the exact reader
                    who cannot decode them. */}
                <p className="mt-2.5 ml-9.5 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-soft">
                  {stage.summary}
                </p>

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
                          <span className="label-mono shrink-0 text-ink-soft">
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
                        {box.options ? (
                          /* The whole box is the trigger, so it stays one
                             object rather than a label with a control beside
                             it. BoxMenu takes the shell so it matches its
                             siblings exactly. */
                          <BoxMenu
                            label={box.label}
                            boxRef={box.ref}
                            options={box.options}
                            className={shell}
                          />
                        ) : box.href ? (
                          <Link
                            href={box.href}
                            /* Petition, Counter-claim and Rejoinder each appear
                               at two stages, so the visible label alone is
                               ambiguous in a links list. */
                            aria-label={`${box.label} — ${stage.title}`}
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

      {/* The map used to stop on a single box and hand straight to the footer:
          a reader who had just understood the whole shape of a matter was
          offered nothing to do with it, and the page spent no seal at all. */}
      <Section>
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-title font-semibold">
              Start at the stage you are <Emphasis>on</Emphasis>.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
              Every document above has a page of its own — what it must contain,
              and how it fails. Each provision on them was checked against its
              source before it was written down.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/documents">Read the documents</Button>
              <Button href="/draft-bot" variant="ghost">
                Have a draft marked
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
