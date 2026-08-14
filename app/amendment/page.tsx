import type { Metadata } from "next";
import { AmendmentFilm } from "@/components/film/AmendmentFilm";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";

export const metadata: Metadata = {
  title: "The amendment",
  description:
    "One clause of a plaint, corrected under a senior's pen.",
  robots: { index: false, follow: false },
};

/**
 * Host page for the AmendmentFilm section. The film is written to drop into
 * any page — this route exists so it can be judged on its own before it takes
 * a position on a real one.
 *
 * What follows the film is the film's own consequence, not a set of feature
 * cards: the correction just made is the thing being sold.
 */
export default function AmendmentPage() {
  return (
    <>
      <AmendmentFilm />

      <Section tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>Where that came from</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            A senior would have caught it in <Emphasis>seconds</Emphasis>.
          </h2>
          <p className="mt-6 max-w-[54ch] text-[16px] leading-relaxed text-ink-soft">
            An injunction turns on three limbs, and a prayer that gestures at
            hardship pleads none of them. The registry will not tell you. The
            other side will.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/draft-bot">Mark up a draft</Button>
            <Button href="/courses" variant="ghost">
              Learn the triple test
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
