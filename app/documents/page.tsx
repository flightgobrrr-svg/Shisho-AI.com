import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { StageTrail } from "@/components/map/StageTrail";
import { DOCUMENTS, documentsByStage } from "@/lib/documents";
import { MAP_STAGES } from "@/lib/sitemap";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Every pleading a civil matter passes through — what each one must contain, and how each one goes wrong.",
};

/**
 * The document index, grouped by the map stage each pleading belongs to, so
 * the two views agree: /map is the shape of a matter, this is what you file at
 * each point of it.
 */
export default function DocumentsPage() {
  const groups = documentsByStage();
  const stageTitle = (n: number) =>
    MAP_STAGES.find((s) => s.n === n)?.title ?? "";

  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Eyebrow>Documents</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            What you file, and what it must <Emphasis>carry</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
            {DOCUMENTS.length} documents, each with the provision that governs
            it, what it must contain to be competent, and the ways it actually
            fails.
          </p>

          {/* The index is the hub for stages 5 to 7, so it carries the return
              path to all three rather than to one. */}
          <StageTrail stages={[5, 6, 7]} className="mt-7" />
        </Container>
      </Section>

      <Section className="border-y border-ink/10">
        <Container>
          <div className="reveal-stagger space-y-14">
            {groups.map((group, gi) => (
              <section
                key={group.stage}
                style={{ "--i": gi } as React.CSSProperties}
              >
                <div className="flex items-center gap-3.5">
                  <StepMark n={group.stage} className="bg-paper" />
                  <h2 className="label-mono text-indigo">
                    {stageTitle(group.stage)}
                  </h2>
                </div>

                <ul className="mt-5 ml-9.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.documents.map((doc) => (
                    <li key={doc.slug} className="min-w-0">
                      <Link
                        href={`/documents/${doc.slug}`}
                        className="group flex h-full flex-col border border-ink/45 bg-paper-raised p-5 transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:border-ink/75 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]"
                      >
                        <h3 className="font-display text-[18px] font-semibold text-ink">
                          {doc.name}
                        </h3>
                        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-soft">
                          {doc.lede}
                        </p>
                        <p className="label-mono mt-4 text-ink-soft/70">
                          {doc.provision.cite.split(",")[0]}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
