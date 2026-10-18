import type { Metadata } from "next";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { FormatsPicker } from "@/components/draft/FormatsPicker";
import { DRAFT_FORMATS } from "@/lib/draftFormats";

export const metadata: Metadata = {
  title: "Formats",
  description:
    "99 civil and criminal drafting formats, from an adjournment petition to written arguments — pick one and describe your facts.",
};

export default function DraftFormatsPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Shisho</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          {DRAFT_FORMATS.length} formats, civil and <Emphasis>criminal</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
          Pick the format that matches your matter, then describe the facts.
          Shisho drafts it from there, in the same conversation you&rsquo;d
          use for anything else.
        </p>

        <div className="mt-10">
          <FormatsPicker />
        </div>
      </Container>
    </Section>
  );
}
