import Link from "next/link";
import { Container, Section } from "@/components/ui/Section";

const FEATURES = [
  {
    href: "/draft-bot",
    name: "Draft Bot",
    body: "Paste a plaint, notice, application, or contract. Get clause-level notes in the margin — the same way a senior would hand it back.",
  },
  {
    href: "/library",
    name: "Legal Library",
    body: "Supreme Court and High Court judgments, bare acts, and commentary. Cited in SCC form, explained in plain language.",
  },
  {
    href: "/courses",
    name: "Courses",
    body: "Two tracks — Starter for foundations, Proficient for interim relief, commercial drafting, and litigation strategy.",
  },
];

export function FeatureStrip() {
  return (
    <Section tone="raised" className="border-y border-ink/10">
      <Container>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {FEATURES.map((feature) => (
            <li key={feature.name} className="min-w-0">
              <h2 className="font-display text-[22px] font-semibold text-ink">
                {feature.name}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {feature.body}
              </p>
              <Link
                href={feature.href}
                className="underline-draw mt-5 inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
              >
                Explore {feature.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
