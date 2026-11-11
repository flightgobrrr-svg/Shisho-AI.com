import type { Metadata } from "next";
import { CaseBriefPractice } from "@/components/tools/CaseBriefPractice";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { PREVIEW_CASES, slugify } from "@/lib/library";

export const metadata: Metadata = {
  title: "Case-brief practice",
  description:
    "Write your own facts, issue, held and ratio for a Library judgment, then compare with its digest.",
};

export default function CaseBriefPage() {
  // Only judgments with a verified source can produce a digest.
  const options = PREVIEW_CASES.filter((c) => c.sourceUrl).map((c) => ({
    title: c.title,
    slug: slugify(c.title),
  }));

  return (
    <Section>
      <Container>
        <Eyebrow>For law students</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Brief it first, then <Emphasis>compare</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Read the judgment, write the facts, issue, held and ratio in your own
          words, then open the Library digest to see what you missed.
        </p>
        <div className="mt-12 border-t border-ink/10 pt-10">
          <CaseBriefPractice options={options} />
        </div>
      </Container>
    </Section>
  );
}
