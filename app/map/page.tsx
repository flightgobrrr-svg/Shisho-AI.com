import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
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
            checks. A dashed box is one still being confirmed.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10 !pt-0">
        <Container>
          <ol className="reveal-stagger">
            {MAP_STAGES.map((stage, i) => (
              <li
                key={stage.n}
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
                  <StepMark n={stage.n} className="relative bg-paper-raised" />
                  <h2 className="label-mono text-ink-soft">{stage.title}</h2>
                </div>

                {/* One column width for the whole page, so boxes line up in
                    columns down every stage rather than each row ending
                    ragged. Boxes within a stage are siblings, not a sequence —
                    the spine carries the order, so there are deliberately no
                    left-to-right connectors here implying one. */}
                <ul className="mt-4 ml-9.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                      "text-[14.5px] leading-snug text-balance",
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
                              "transition-[transform,background-color,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                              "hover:-translate-y-0.5 hover:border-ink/75 hover:bg-paper",
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
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
