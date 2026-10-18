import type { Metadata } from "next";
import { RevisionList } from "@/components/tools/RevisionList";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Revision",
  description: "Case briefs you saved, brought back after 1, 7 and 30 days.",
};

export default function RevisionPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>For law students</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Brief it once. <Emphasis>Remember</Emphasis> it.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Each brief you save returns after a day, a week and a month. The
          cards live in this browser only; nothing is sent to Shisho.
        </p>
        <div className="mt-12 border-t border-ink/10 pt-10">
          <RevisionList />
        </div>
      </Container>
    </Section>
  );
}
