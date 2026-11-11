import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { LimitationChecker } from "@/components/tools/LimitationChecker";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { LIMITATION_ENTRIES, VERIFIED_ON, periodLabel } from "@/lib/limitation";

export function generateStaticParams() {
  return LIMITATION_ENTRIES.map((e) => ({ id: e.id }));
}

function find(id: string) {
  return LIMITATION_ENTRIES.find((e) => e.id === id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = find(id);
  if (!entry) return {};
  return {
    title: `Limitation for ${entry.label.toLowerCase()} (${entry.article})`,
    description: `${periodLabel(entry.period)} under ${entry.article}, running from: ${entry.runsFrom} Work out the last day to file.`,
  };
}

/**
 * One limitation entry on its own page, so someone searching for exactly this
 * claim lands on a page about it, with the checker already set to it.
 */
export default async function LimitationEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = find(id);
  if (!entry) notFound();

  return (
    <Section>
      <Container>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `Limitation checker: ${entry.label}`,
            applicationCategory: "LegalService",
            description: entry.description,
            isAccessibleForFree: true,
          }}
        />
        <Link
          href="/limitation"
          className="underline-draw label-mono text-ink-soft transition-colors hover:text-ink"
        >
          Limitation checker
        </Link>

        <Eyebrow className="mt-6">{entry.article}</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Limitation for {entry.label.toLowerCase()}.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          {entry.description} The period is {periodLabel(entry.period).toLowerCase()}, running from:{" "}
          {entry.runsFrom.charAt(0).toLowerCase() + entry.runsFrom.slice(1)}
        </p>

        <div className="mt-12 border-t border-ink/10 pt-10">
          <LimitationChecker initialEntry={entry.id} />
        </div>

        <p className="mt-14 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
          Checked against{" "}
          <a href={entry.source.url} rel="noopener noreferrer" className="underline-draw text-ink">
            {entry.source.name}
          </a>{" "}
          on {VERIFIED_ON}. General information, not legal advice.
        </p>
      </Container>
    </Section>
  );
}
