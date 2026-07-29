import type { Metadata } from "next";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";

export const metadata: Metadata = {
  title: "Legal Library",
  description:
    "Supreme Court and High Court judgments, bare acts, and commentary — searchable and explained.",
};

export default function LibraryPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Legal Library</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
          The <Emphasis>authorities</Emphasis>, explained.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
          Supreme Court and High Court judgments, bare acts, and commentary —
          searchable, cited correctly, and explained in plain language. This page
          is next.
        </p>
      </Container>
    </Section>
  );
}
