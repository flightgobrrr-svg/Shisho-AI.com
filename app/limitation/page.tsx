import type { Metadata } from "next";
import { LimitationChecker } from "@/components/tools/LimitationChecker";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { SCHEDULE_SOURCE } from "@/lib/limitation";

export const metadata: Metadata = {
  title: "Limitation checker",
  description:
    "Work out the last day to file under the Limitation Act, 1963 for common suits and applications.",
};

export default function LimitationPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Limitation Act, 1963</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Is the claim still in <Emphasis>time</Emphasis>?
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Pick the kind of claim, enter the date the period starts from, and
          see the last day to file. It covers seven common Articles of the
          Schedule, each checked against the Act.
        </p>

        <div className="mt-12 border-t border-ink/10 pt-10">
          <LimitationChecker />
        </div>

        <p className="mt-14 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
          Source:{" "}
          <a
            href={SCHEDULE_SOURCE.url}
            className="underline-draw text-ink"
            rel="noopener noreferrer"
          >
            {SCHEDULE_SOURCE.name}
          </a>
          . General information, not legal advice.
        </p>
      </Container>
    </Section>
  );
}
