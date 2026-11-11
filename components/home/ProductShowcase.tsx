import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { DRAFT_EXCERPT } from "@/lib/showcase";

/**
 * Adapted from the supplied Tailark `hero-section-1` block.
 *
 * Kept from the original: the announcement pill with its arrow, the centred
 * statement with a dual CTA, and the framed product view with a gradient fade.
 *
 * Rebuilt for this project: paper/ink/seal instead of shadcn's dark-mode
 * tokens; Fraunces instead of the default sans; the existing Button rather
 * than a second cva-based one; a CSS scroll-reveal instead of framer-motion
 * springs (the brief calls for precise 2–4px motion under 0.3s, not a 1.5s
 * spring with bounce); and no second <header>, since the sticky Nav in the
 * root layout already covers that — accessibly.
 *
 * The "screenshot" is real markup, not an image. The brief asks for a page
 * that is not photo-heavy, and a rendered miniature stays sharp at any
 * density, needs no remote host on the critical path, weighs nothing, and
 * reuses the annotation motif rather than sitting beside it.
 */


function DraftBotMiniature({ notes }: { notes: string[] }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 text-left sm:grid-cols-[minmax(0,1fr)_15rem]"
    >
      {/* Left: the draft */}
      <div className="space-y-3 p-5 sm:p-8">
        {DRAFT_EXCERPT.map((line) => (
          <p
            key={line.text}
            className={
              line.heading
                ? "label-mono text-ink-soft"
                : "flex gap-2 font-display text-[14px] leading-snug text-ink sm:text-[15px]"
            }
          >
            {line.heading ? (
              line.text
            ) : (
              <>
                <span
                  className={
                    line.note === undefined
                      ? "min-w-0"
                      : "min-w-0 underline decoration-seal/60 decoration-1 underline-offset-4"
                  }
                >
                  {line.text}
                </span>
                {line.note !== undefined ? (
                  <sup className="mt-1 shrink-0 font-sans text-[10px] font-semibold text-seal">
                    {line.note + 1}
                  </sup>
                ) : null}
              </>
            )}
          </p>
        ))}
      </div>

      {/* Right on desktop, stacked underneath on mobile: the margin only
          exists once there is width to spare for one. */}
      <div className="space-y-3 border-t border-ink/10 bg-paper/50 p-5 sm:border-t-0 sm:border-l sm:p-6">
        <span className="label-mono block text-ink-faint">Shisho notes</span>
        {notes.map((note, i) => (
          <div key={note} className="flex gap-2.5 text-[13px] leading-snug text-ink">
            <span className="mt-px font-sans text-[11px] font-semibold text-seal">{i + 1}</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductShowcase({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).productShowcase;

  return (
    <Section>
      <Container>
        <div className="reveal text-center">
          {/* Announcement pill — the block's arrow slide, retimed to the
              project's 3px / 180ms hover motion. */}
          <Link
            href="/draft-bot"
            className="group mx-auto inline-flex w-fit items-center gap-3 rounded-seal border border-ink/45 bg-paper-raised py-1 pr-3 pl-4 transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75"
          >
            <span className="label-mono text-ink-soft">{t.pill}</span>
            <span aria-hidden="true" className="h-3.5 w-px bg-ink/15" />
            <span
              aria-hidden="true"
              className="nudge-x inline-block text-[13px] text-ink"
            >
              &rarr;
            </span>
          </Link>

          <h2 className="mx-auto mt-8 max-w-2xl font-display text-title font-semibold text-balance">
            {t.heading.map((seg, i) =>
              seg.em ? <Emphasis key={i}>{seg.text}</Emphasis> : <span key={i}>{seg.text}</span>,
            )}
          </h2>

          <p className="mx-auto mt-5 max-w-[48ch] text-[16px] leading-relaxed text-ink-soft">
            {t.body}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                {t.ctaPrimary}
              </Button>
            </Magnetic>
            <Button href="/pricing" variant="ghost" size="lg">
              {t.ctaSecondary}
            </Button>
          </div>
        </div>

        {/* Framed product view. The gradient fade is the block's device — it
            makes the frame read as a window onto something larger rather than
            a cropped screenshot. */}
        <figure className="reveal relative mx-auto mt-14 max-w-4xl">
          <div className="overflow-hidden rounded-seal border border-ink/45 bg-paper-raised p-1.5 shadow-[0_1px_2px_rgba(34,37,43,0.04),0_18px_44px_-16px_rgba(34,37,43,0.18)]">
            <div className="overflow-hidden rounded-[2px] border border-ink/8 bg-paper-raised">
              <DraftBotMiniature notes={t.miniNotes} />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-paper"
          />

          <figcaption className="sr-only">{t.figcaption}</figcaption>
        </figure>
      </Container>
    </Section>
  );
}
