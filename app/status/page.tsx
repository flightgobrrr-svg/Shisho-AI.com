import type { Metadata } from "next";
import { StatusList } from "@/components/for/StatusList";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { STATUS_LIVE, STATUS_PLANNED } from "@/lib/status";

export const metadata: Metadata = {
  title: "What works today",
  description:
    "What is live on Shisho AI today, and what is planned, in one place.",
};


export default function StatusPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Shisho AI</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          What works <Emphasis>today</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Shisho AI is pre-launch. This is the plain list of what you can use
          now and what is still planned.
        </p>

        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Live</Eyebrow>
            <div className="mt-5">
              <StatusList items={STATUS_LIVE} />
            </div>
          </div>
          <div>
            <Eyebrow>Planned</Eyebrow>
            <div className="mt-5">
              <StatusList items={STATUS_PLANNED} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
