import { AmbientDrift } from "@/components/home/AmbientDrift";
import { Magnetic } from "@/components/motion/Magnetic";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import { Button } from "@/components/ui/Button";
import { HERO_TIMING } from "@/lib/motion";
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

type Segment = { text: string; em?: boolean };

const LINE_ONE: Segment[] = [
  { text: "Every great lawyer had a " },
  { text: "shisho", em: true },
  { text: "." },
];

const LINE_TWO: Segment[] = [
  { text: "Now yours is AI — built for Indian law." },
];

const LINE_ONE_LENGTH = LINE_ONE.reduce((n, s) => n + [...s.text].length, 0);

const LINE_TWO_START =
  HERO_TIMING.type.start +
  LINE_ONE_LENGTH * HERO_TIMING.type.charMs +
  HERO_TIMING.type.lineGap;

/** Joined with a space between the two lines so a screen reader reads
 *  "…had a shisho. Now yours is AI…" rather than "shisho.Now". */
const FULL_HEADLINE = [LINE_ONE, LINE_TWO]
  .map((line) => line.map((s) => s.text).join(""))
  .join(" ");

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

const PREPARED_LINE_ONE = prepare(LINE_ONE, HERO_TIMING.type.start);
const PREPARED_LINE_TWO = prepare(LINE_TWO, LINE_TWO_START);

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

export function Hero() {
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

      {/* Deliberately NOT <Container>. Every other section centres its
          content in a 72rem track, which on a wide monitor leaves the hero
          copy stranded in the middle-left of a full-bleed photograph. Here
          the copy hugs the page gutter instead — same `px-6 md:px-8` as the
          rest of the site, just without the centring — so it reads as
          anchored to the edge rather than floating.

          The consequence is intentional: on wide screens this text starts
          further left than the sections below it. */}
      <div className="w-full px-6 py-20 md:px-8 md:py-24">
        <div className="max-w-[38rem]">
          {/* ---- Copy ------------------------------------------------- */}
          <div>
            <p
              className="rise label-mono text-ink-soft/80"
              style={{ animationDelay: `${HERO_TIMING.rise.eyebrow}ms` }}
            >
              For Indian law · SC &amp; High Courts
            </p>

            <h1
              className={cn(
                "rise mt-5 font-display text-[2.05rem] leading-[1.06] font-semibold tracking-[-0.022em]",
                "sm:text-[2.6rem] lg:text-display",
              )}
              style={{ animationDelay: `${HERO_TIMING.rise.headline}ms` }}
            >
              <span className="sr-only">{FULL_HEADLINE}</span>
              <span aria-hidden="true">
                <TypedLine segments={PREPARED_LINE_ONE} className="text-ink" />
                <TypedLine segments={PREPARED_LINE_TWO} className="text-seal" />
              </span>
            </h1>

            <p
              className="rise mt-6 max-w-[46ch] text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]"
              style={{ animationDelay: `${HERO_TIMING.rise.subhead}ms` }}
            >
              Courses and an AI drafting assistant for Indian law — for law
              students, aspiring lawyers, and practising advocates.
            </p>

            <div
              className="rise mt-8"
              style={{ animationDelay: `${HERO_TIMING.rise.ctas}ms` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button href="/draft-bot" size="lg">
                    Try Shisho
                  </Button>
                </Magnetic>
                <Button href="/courses" variant="ghost" size="lg">
                  Browse courses
                </Button>
              </div>
              <p className="mt-3.5 text-[13.5px] text-ink-soft">
                No card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
