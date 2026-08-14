import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";

/**
 * Three doors into the product, drawn as numbered boxes on a flow — ruled
 * outlines, no fills, so nothing here competes with the hero's annotation.
 */
const PERSONAS = [
  {
    href: "/courses",
    label: "Student",
    title: "You are learning the law",
    body: "You know the sections cold. You have never seen a plaint that was actually filed, settled, and numbered by the registry.",
  },
  {
    href: "/draft-bot",
    label: "Practising lawyer",
    title: "You are drafting today",
    body: "Three matters listed tomorrow. The senior wants the rejoinder tonight — clause-level review, with Indian authorities cited.",
  },
  {
    href: "/library",
    label: "Exploring law",
    title: "You are deciding if this is for you",
    body: "Read a landmark Supreme Court judgment explained in plain language before you pay for anything.",
  },
];

export function PersonaRouter() {
  return (
    <Section>
      <Container>
        <Eyebrow>Where to start</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
          Three ways in, depending on where you <Emphasis>are</Emphasis>.
        </h2>

        <ul className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
          {PERSONAS.map((persona, i) => (
            <li
              key={persona.label}
              style={{ "--i": i } as React.CSSProperties}
              className="relative min-w-0"
            >
              {/* The rule that carries the eye from one box to the next, as on
                  a flowchart. Only between boxes, and only once they sit in a
                  row — stacked on mobile there is nothing to connect. */}
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-5 hidden h-px w-5 bg-ink/30 md:block"
                />
              )}
              <Link
                href={persona.href}
                className="group flex h-full flex-col border border-ink/45 bg-paper p-7 transition-[transform,background-color,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:border-ink/75 hover:bg-paper-raised md:p-8"
              >
                <span className="flex items-center gap-3">
                  <StepMark n={i + 1} />
                  <span className="label-mono text-ink-soft/70">
                    {persona.label}
                  </span>
                </span>
                <span className="mt-5 font-display text-[21px] leading-snug font-semibold text-ink">
                  {persona.title}
                </span>
                <span className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                  {persona.body}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] text-ink">
                  Start here
                  <span aria-hidden="true" className="nudge-x inline-block">
                    &rarr;
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
