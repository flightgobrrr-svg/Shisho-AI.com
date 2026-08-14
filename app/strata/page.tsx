import type { Metadata } from "next";
import Image from "next/image";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";

export const metadata: Metadata = {
  title: "Strata",
  description: "A layered scroll study — four planes drifting at four depths.",
  robots: { index: false, follow: false },
};

/**
 * STRATA — a scroll-depth demo. Not linked from the nav; it is a sandbox.
 *
 * Four planes drift at four speeds against the scroll, so the scene resolves
 * as depth rather than as a slideshow. Built on components/motion/ParallaxLayer
 * rather than GSAP + Lenis:
 *
 *   - globals.css states "No animation library. This is deliberate."
 *   - Lenis replaces native scrolling for the whole document. This site's
 *     reveals run on `animation-timeline: view()` and its anchors rely on
 *     `scroll-padding-top`; handing scroll to a rAF loop puts both at risk for
 *     a demo page.
 *   - ParallaxLayer already opts out entirely under prefers-reduced-motion —
 *     it attaches no listener at all — which the GSAP version does not.
 *
 * Speeds stay inside ParallaxLayer's stated budget: past ~0.12 the effect
 * stops reading as depth. The four here run 0.10 → -0.02, back to front, the
 * negative plane drifting against the rest to open the gap up.
 *
 * Photography is the project's own; nothing here is stock. Each photo carries
 * a radial mask that reaches full transparency well inside its own box, so no
 * straight cut appears at any point in the drift — the PhotoBackdrop rule.
 */

const MASK =
  "radial-gradient(58% 58% at 50% 45%, #000 0%, #000 42%, transparent 78%)";

export default function StrataPage() {
  return (
    <>
      <Section className="relative min-h-[92vh] overflow-hidden !pb-0">
        {/* Plane 1 — furthest back, travels most.
            Held to the right column and hidden below lg. A photo must never
            sit behind the type column at any breakpoint, and below lg there is
            no side column to move it into. */}
        <ParallaxLayer
          speed={0.1}
          className="pointer-events-none absolute top-0 right-0 -z-10 hidden h-[78vh] w-[54%] lg:block"
        >
          <div
            className="relative h-full w-full opacity-45"
            style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          >
            <Image
              src="/gurukul-teaching.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
          </div>
        </ParallaxLayer>

        {/* Plane 2 — a ruled ground, the flat plane between the two photos. */}
        <ParallaxLayer
          speed={0.07}
          className="pointer-events-none absolute inset-x-0 top-[38vh] -z-10"
        >
          <div className="mx-auto h-px w-full max-w-6xl bg-ink/15" />
          <div className="mx-auto mt-24 h-px w-full max-w-4xl bg-ink/10" />
          <div className="mx-auto mt-24 h-px w-full max-w-2xl bg-ink/[0.07]" />
        </ParallaxLayer>

        {/* Plane 3 — the type. Nearly still, so it stays readable. */}
        <ParallaxLayer speed={0.03} className="relative">
          <Container>
            <Eyebrow>Scroll study</Eyebrow>
            <h1 className="mt-4 max-w-3xl font-display text-[3.2rem] leading-[1.04] font-semibold tracking-[-0.02em] sm:text-[4.5rem]">
              Four planes, four <Emphasis>depths</Emphasis>.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">
              Each plane moves at its own rate against the scroll. Nothing here
              animates on its own — stop scrolling and the scene stops with you.
            </p>
          </Container>
        </ParallaxLayer>

        {/* Plane 4 — nearest, drifting against the rest to open the gap. */}
        <ParallaxLayer
          speed={-0.02}
          className="pointer-events-none absolute right-[-4%] bottom-[-6vh] -z-10 hidden h-[52vh] w-[46%] lg:block"
        >
          <div
            className="relative h-full w-full opacity-70"
            style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          >
            <Image
              src="/gurukul-question.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </ParallaxLayer>
      </Section>

      {/* Runway. The effect needs somewhere to travel, and a plane centred in
          the viewport sits at rest — without this the scene never resolves. */}
      <Section tone="raised" className="border-y border-ink/10">
        <Container>
          <Eyebrow>What is happening</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
            Depth, not <Emphasis>decoration</Emphasis>.
          </h2>
          <ul className="mt-10 max-w-2xl space-y-5 text-[15px] leading-relaxed text-ink-soft">
            <li className="border-l border-ink/45 pl-5">
              Each plane is offset from its own centre, so it rests when centred
              in the viewport and drifts either side of that. Offset never
              accumulates down a long page.
            </li>
            <li className="border-l border-ink/45 pl-5">
              Scroll fires far faster than the compositor can use it, so writes
              are coalesced to one per frame.
            </li>
            <li className="border-l border-ink/45 pl-5">
              Under <code className="font-mono text-[13.5px]">
                prefers-reduced-motion
              </code>{" "}
              no listener is attached at all. Every plane renders at its natural
              position — there is nothing to neutralise afterwards.
            </li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
            Keep scrolling and back to the top — the planes separate on the way
            down and close again on the way up.
          </p>
        </Container>
      </Section>
    </>
  );
}
