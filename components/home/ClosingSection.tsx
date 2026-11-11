import { Emphasis } from "@/components/ui/Emphasis";
import { TagList } from "@/components/ui/Tag";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

const VERBS = ["Read", "Research", "Analyse", "Argue", "Evolve"];

/** The video's closing slide: one line on why the product keeps teaching. */
export function ClosingSection() {
  return (
    <Section className="!py-16 md:!py-24">
      <Container>
        <Eyebrow>Always learning</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-[2rem] font-semibold leading-[1.12] text-ink md:text-[2.6rem]">
          A student of <Emphasis>law</Emphasis>, for life.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">
          Shisho AI keeps pace with the way the profession works and learns.
        </p>
        <TagList items={VERBS} className="mt-6" />
        <p className="label-mono mt-8 text-ink-faint">
          Wisdom · Guidance · Intelligence
        </p>
      </Container>
    </Section>
  );
}
