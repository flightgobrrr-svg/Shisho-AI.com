import { AmbientDrift } from "@/components/home/AmbientDrift";
import { Magnetic } from "@/components/motion/Magnetic";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import { Button } from "@/components/ui/Button";
import { StateSelect } from "@/components/map/StateSelect";
import { HERO_TIMING } from "@/lib/motion";
import { getDictionary, type Locale, type Segment } from "@/lib/i18n/dictionaries";
import { getStatePickerCopy } from "@/lib/i18n/statePicker";
import { cn } from "@/lib/cn";

/**
 * The hero. A server component — every layer of motion is CSS, so there is no
 * client JS on the landing page's most important element.
 *
 * The headline is built twice over:
 *   1. an `sr-only` span carrying the complete sentence — the accessible and
 *      SEO source of truth, read once, cleanly, with no partial-text churn;
 *   2. an `aria-hidden` layer of per-character spans that types itself in.
 *
 * Because every character is in the DOM from first paint and only its opacity
 * changes, the headline box is full-size immediately — the type-on causes no
 * layout shift.
 */

/** Character count of a line's text, ignoring the `em` split — used to time
 *  when the next line's typewriter should start. */
function lineLength(segments: Segment[]) {
  return segments.reduce((n, s) => n + [...s.text].length, 0);
}

/** Joined with a space between the two lines so a screen reader reads
 *  "…had a shisho. Now yours is AI…" rather than "shisho.Now". */
function fullHeadline(line1: Segment[], line2: Segment[]) {
  return [line1, line2].map((line) => line.map((s) => s.text).join("")).join(" ");
}

/**
 * Reveals a word at a time, not a character at a time.
 *
 * The first version of this split every character into its own <span> with an
 * absolutely-positioned caret inside it. That was wrong twice over:
 *
 *   1. The caret relied on `step-end` + `animation-fill-mode: forwards` to
 *      hide itself once it had passed. At the final keyframe boundary that
 *      combination is not reliable across engines — WebKit holds the pre-jump
 *      value — so every caret could stay at opacity 1, leaving seal-coloured
 *      bars stuck throughout the headline.
 *   2. Putting each glyph in its own inline box disables kerning and
 *      ligatures across every pair, which is plainly visible in a display
 *      serif at this size with negative tracking.
 *
 * Whole words keep the text a continuous run, so kerning, ligatures, and line
 * breaking are all native. There is no caret at all: the brief allows exactly
 * one perpetual animation and the ambient drift has it.
 *
 * Cadence still reads as typing because a word's delay is derived from how
 * many characters precede it — longer words land later, as they would if the
 * line were being typed out.
 */
type Token = { text: string; delay: number };
type PreparedSegment = { em?: boolean; tokens: Token[] };

/**
 * Assigns each word its reveal time. Written as a fold rather than a mutating
 * loop so nothing is reassigned inside a render closure, and evaluated once at
 * module scope — the lines are static, so there is no reason to recompute this
 * on every render.
 *
 * Each token keeps its own trailing whitespace, so the gaps between words
 * survive without needing spans of their own.
 */
function prepare(segments: Segment[], startAt: number): PreparedSegment[] {
  return segments.reduce<{ out: PreparedSegment[]; chars: number }>(
    (acc, segment) => {
      const raw = segment.text.match(/\S+\s*|\s+/g) ?? [];

      const folded = raw.reduce<{ tokens: Token[]; chars: number }>(
        (t, text) => ({
          tokens: [
            ...t.tokens,
            { text, delay: startAt + t.chars * HERO_TIMING.type.charMs },
          ],
          chars: t.chars + text.length,
        }),
        { tokens: [], chars: acc.chars },
      );

      return {
        out: [...acc.out, { em: segment.em, tokens: folded.tokens }],
        chars: folded.chars,
      };
    },
    { out: [], chars: 0 },
  ).out;
}

function TypedLine({
  segments,
  className,
}: {
  segments: PreparedSegment[];
  className?: string;
}) {
  return (
    <span className={cn("block", className)}>
      {segments.map((segment, si) => {
        const words = segment.tokens.map((token, ti) => (
          <span
            key={`${si}-${ti}`}
            className="opacity-100"
            /* A real duration with a normal easing curve — deliberately NOT
               `step-end`. A 1ms step-end animation holds opacity at 0 for its
               whole interval and jumps only at progress 1.0, and resolving the
               forwards fill exactly at that step boundary is where engines
               disagree: the word paints in, then a later style recalculation
               resolves the fill back to the pre-jump value and it vanishes.
               That is the same defect that stranded the carets visible. A
               180ms fade has no step boundary to get wrong, and reads better. */
            style={{
              animation: "shisho-type 180ms var(--ease-precise) both",
              animationDelay: `${token.delay}ms`,
            }}
          >
            {token.text}
          </span>
        ));

        return segment.em ? (
          <em key={si} className="annotate">
            {words}
          </em>
        ) : (
          <span key={si}>{words}</span>
        );
      })}
    </span>
  );
}

export function Hero({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).hero;
  const line2Start =
    HERO_TIMING.type.start +
    lineLength(t.line1) * HERO_TIMING.type.charMs +
    HERO_TIMING.type.lineGap;
  const preparedLine1 = prepare(t.line1, HERO_TIMING.type.start);
  const preparedLine2 = prepare(t.line2, line2Start);
  const fullHeadlineText = fullHeadline(t.line1, t.line2);

  return (
    /* Full viewport minus the 4rem sticky nav, so the hero is the whole
       first screen and the fold lands exactly at its foot. `svh` rather
       than `vh` so mobile browser chrome collapsing doesn't overshoot. */
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* The gurukul, as a right-hand panel rather than full-bleed.
          The source is portrait (519×690). Stretched across a wide hero,
          `object-cover` had to zoom it ~3x to fill, which cropped it down
          to an unreadable band — the photograph stopped looking like
          anything. At ~52% width the frame's aspect is close to the
          source's, so the crop is slight and the guru stays legible.

          At this width the whole source already sits inside the frame, so
          the mask is the only thing deciding what is seen. It is a wide,
          low-centred ellipse: wide enough to take in the row of seated
          students as well as the guru, dropped to 55% so the foreground row
          is inside it rather than clipped off the bottom.

          The old hard border came from the mask still being opaque where
          the frame ran out. This one reaches transparent before all four
          frame edges — including under the parallax's ±45px of travel — so
          the image dissolves into the paper on every side instead of
          butting against a line.

          `-inset-y-16` oversizes the frame by 4rem top and bottom so that
          drift never pulls the photograph's own edge into view. */}
      <PhotoBackdrop
        src="/gurukul-teaching.jpg"
        focus="50% 50%"
        mask="radial-gradient(62% 48% at 52% 51%, #000 16%, transparent 72%)"
        opacity={0.5}
        parallax={0.06}
        frameClassName="-inset-y-16 right-0 w-full lg:w-[52%]"
        sizes="(min-width: 1024px) 52vw, 100vw"
      />

      {/* Mobile-only legibility wash. Below `lg` the frame is full width, so
          the photograph sits directly behind the copy and needs knocking
          back. From `lg` up the panel is clear of the text column entirely
          and this would only grey the image out — hence `lg:hidden`. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-paper/60 lg:hidden"
      />

      <AmbientDrift />

      {/* The drift's lowest glow and the photograph both run past the
          section's foot, and `overflow-hidden` cut them off in a straight
          line, so the hero ended on a visible edge. This fades every
          background layer out to plain paper before the section ends. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-paper"
      />

      {/* The same 72rem track as the nav and every section below, so the
          headline starts on the line the logo starts on. Hugging the page
          gutter instead put the copy 60px or more left of everything else
          from 1280px up, which read as a misalignment, not an anchor. The
          photograph is its own right-hand panel, so the copy never has to
          compete with it for the middle. */}
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8 md:py-24">
        <div className="max-w-[38rem]">
          {/* ---- Copy ------------------------------------------------- */}
          <div>
            <p
              className="rise label-mono text-ink-faint"
              style={{ animationDelay: `${HERO_TIMING.rise.eyebrow}ms` }}
            >
              {t.eyebrow}
            </p>

            <h1
              className={cn(
                "rise mt-5 font-display text-[2.05rem] leading-[1.06] font-semibold tracking-[-0.022em]",
                "sm:text-[2.6rem] lg:text-display",
              )}
              style={{ animationDelay: `${HERO_TIMING.rise.headline}ms` }}
            >
              <span className="sr-only">{fullHeadlineText}</span>
              <span aria-hidden="true">
                <TypedLine segments={preparedLine1} className="text-ink" />
                <TypedLine segments={preparedLine2} className="text-seal" />
              </span>
            </h1>

            <p
              className="rise mt-6 max-w-[46ch] text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]"
              style={{ animationDelay: `${HERO_TIMING.rise.subhead}ms` }}
            >
              {t.subhead}
            </p>

            <div
              className="rise mt-8"
              style={{ animationDelay: `${HERO_TIMING.rise.ctas}ms` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button href="/draft-bot" size="lg">
                    {t.ctaPrimary}
                  </Button>
                </Magnetic>
                <Button href="/courses" variant="ghost" size="lg">
                  {t.ctaSecondary}
                </Button>
              </div>
              <p className="mt-3.5 text-[13.5px] text-ink-soft">{t.ctaNote}</p>

              {/* Same picker /map uses to answer "which High Court hears
                  this", in the page's language (lib/i18n/statePicker.ts),
                  just without the ml-9.5 that aligns it under a StepMark
                  there — the hero has no StepMark to align under. The
                  question itself is swapped: /map asks where the *matter*
                  is (it decides jurisdiction); a first-time visitor here
                  isn't mid-filing, so the hero asks about them instead —
                  same derived High Court answer, a question that actually
                  fits who's reading it. */}
              <StateSelect
                className="mt-6 ml-0 max-w-xs"
                locale={locale}
                label={getStatePickerCopy(locale).askVisitor}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
