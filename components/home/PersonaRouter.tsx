import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";

/**
 * Three doors into the product. Hairline borders, no fills — the calm layout
 * is the canvas, so nothing here competes with the hero's annotation.
 */
const PERSONAS = [
  {
    href: "/courses",
    label: "Student",
    title: "You are learning the law",
    body: "Structured tracks from reading your first judgment to drafting your first plaint.",
  },
  {
    href: "/draft-bot",
    label: "Practising lawyer",
    title: "You are drafting today",
    body: "Clause-level review of pleadings and contracts, with Indian authorities cited.",
  },
  {
    href: "/library",
    label: "Exploring law",
    title: "You are deciding if this is for you",
    body: "Read landmark Supreme Court judgments explained in plain language, free.",
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

        <ul className="reveal-stagger mt-12 grid gap-px overflow-hidden rounded-seal border border-ink/10 bg-ink/10 md:grid-cols-3">
          {PERSONAS.map((persona, i) => (
            <li
              key={persona.label}
              style={{ "--i": i } as React.CSSProperties}
              className="min-w-0 bg-paper"
            >
              <Link
                href={persona.href}
                className="group flex h-full flex-col p-7 transition-[transform,background-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:bg-paper-raised md:p-8"
              >
                <span className="label-mono text-ink-soft/70">
                  {persona.label}
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
