import { AmbientDrift } from "@/components/home/AmbientDrift";
import { DocumentMockup } from "@/components/home/DocumentMockup";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
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
    <section className="relative overflow-hidden">
      {/* The gurukul, low and right: the mask's dense centre lands below the
          writ mockup rather than behind it, so what shows through is the
          teacher and the seated students rather than the canopy above them. */}
      <PhotoBackdrop
        src="/gurukul-teaching.jpg"
        focus="50% 58%"
        mask="radial-gradient(120% 110% at 92% 62%, #000 22%, transparent 74%)"
        frameClassName="inset-y-0 right-0 w-full lg:w-[68%]"
      />
      <AmbientDrift />

      <Container className="pt-16 pb-28 md:pt-24 md:pb-40">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-16">
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
                <Button href="/draft-bot" size="lg">
                  Try the Draft Bot
                </Button>
                <Button href="/courses" variant="ghost" size="lg">
                  Browse courses
                </Button>
              </div>
              <p className="mt-3.5 text-[13.5px] text-ink-soft">
                No card required.
              </p>
            </div>
          </div>

          {/* ---- The annotated draft ---------------------------------- */}
          <div
            className="rise"
            style={{ animationDelay: `${HERO_TIMING.rise.document}ms` }}
          >
            <DocumentMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
