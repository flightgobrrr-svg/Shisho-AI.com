import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { LimitationChecker } from "@/components/tools/LimitationChecker";
import { Emphasis } from "@/components/ui/Emphasis";
import { TAG_LINK_CLASS } from "@/components/ui/Tag";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { LIMITATION_ENTRIES, SCHEDULE_SOURCE, VERIFIED_ON } from "@/lib/limitation";

export const metadata: Metadata = {
  title: "Limitation checker",
  description:
    "Work out the last day to file under the Limitation Act, 1963 for common suits and applications.",
};

export default async function LimitationPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; d?: string }>;
}) {
  const { a, d } = await searchParams;
  return (
    <Section>
      <Container>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Limitation checker",
            applicationCategory: "LegalService",
            description: "Work out the last day to file under the Limitation Act, 1963.",
            isAccessibleForFree: true,
          }}
        />
        <Eyebrow>Limitation Act, 1963</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Is the claim still in <Emphasis>time</Emphasis>?
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          Pick the kind of claim, enter the date the period starts from, and
          see the last day to file. It covers twelve Articles of the Limitation Act
          and the written-statement period, each checked against its source.
        </p>

        <div className="mt-12 border-t border-ink/10 pt-10">
          <LimitationChecker
            initialEntry={typeof a === "string" ? a : undefined}
            initialDate={typeof d === "string" ? d : undefined}
          />
        </div>

        <div className="mt-14 max-w-3xl border-t border-ink/10 pt-8">
          <p className="label-mono text-indigo">Go straight to a claim</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {LIMITATION_ENTRIES.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/limitation/${e.id}`}
                  className={TAG_LINK_CLASS}
                >
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
          Each entry names its source above (mostly{" "}
          <a
            href={SCHEDULE_SOURCE.url}
            className="underline-draw text-ink"
            rel="noopener noreferrer"
          >
            {SCHEDULE_SOURCE.name}
          </a>
          ). Checked {VERIFIED_ON}. General information, not legal advice.
        </p>
      </Container>
    </Section>
  );
}
