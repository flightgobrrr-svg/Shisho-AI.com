import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { StepMark } from "@/components/ui/StepMark";
import { JsonLd } from "@/components/seo/JsonLd";
import { PrintButton } from "@/components/ui/PrintButton";
import { DOCUMENTS, getDocument } from "@/lib/documents";
import { MAP_STAGES } from "@/lib/sitemap";

export function generateStaticParams() {
  return DOCUMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) return {};
  return { title: doc.name, description: doc.lede };
}

/**
 * One pleading, in full: the provision that governs it, what it must contain,
 * and how it fails.
 *
 * The two lists are deliberately asymmetric in tone. "Must contain" is the
 * standard; "where it fails" is what a senior actually writes in the margin,
 * and it is the half that teaches — which is why it is not softened into a
 * second checklist.
 */
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) notFound();

  const stage = MAP_STAGES.find((s) => s.n === doc.stage);
  const related = doc.related
    .map((r) => getDocument(r))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: doc.name,
          description: doc.lede,
          about: doc.provision.cite,
        }}
      />
      <Section className="!pb-12">
        <Container>
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
            >
              Documents
            </Link>
            {stage && (
              <>
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
                <Link
                  href={`/map#stage-${stage.n}`}
                  className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
                >
                  {stage.title}
                </Link>
              </>
            )}
          </div>

          <div className="mt-3">
            <PrintButton label="Print this guide" />
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-title font-semibold">
            {doc.name}
          </h1>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
            {doc.lede}
          </p>

          {/* The provision, set as a citation block — the one place seal is
              spent on this page, because a governing rule is the annotation
              this whole document hangs from. */}
          <div className="mt-9 max-w-[62ch] border-l-2 border-seal/70 pl-5">
            <p className="label-mono text-indigo">{doc.provision.cite}</p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink">
              {doc.provision.gist}
            </p>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-ink/10">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>It must contain</Eyebrow>
              <ol className="mt-6 space-y-4">
                {doc.mustContain.map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="label-mono mt-1 shrink-0 text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <Eyebrow>Where it fails</Eyebrow>
              <ul className="mt-6 space-y-4">
                {doc.defects.map((item) => (
                  <li
                    key={item}
                    className="border-l border-seal/50 pl-5 text-[15px] leading-relaxed text-ink-soft"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The draft CTA is offered only where `draftsAs` is set — that is,
              where the document is one a party drafts and files. Issues are
              settled by the court, and cross-examination and oral arguments
              happen at the bar; on those three the Library leads instead,
              rather than offering to draft something that is never drafted. */}
          <div className="mt-14 flex flex-wrap gap-3 border-t border-ink/10 pt-10">
            {doc.draftsAs ? (
              <>
                <Button href={`/draft-bot?doc=${doc.slug}`}>
                  Draft this with Shisho
                </Button>
                <Button href="/library" variant="ghost">
                  Find the authority
                </Button>
              </>
            ) : (
              <Button href="/library">Find the authority</Button>
            )}
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>Read beside it</Eyebrow>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="min-w-0">
                  <Link
                    href={`/documents/${r.slug}`}
                    className="flex h-full items-center gap-3 border border-ink/45 bg-paper-raised px-5 py-4 text-[15px] text-ink transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:border-ink/75 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]"
                  >
                    <StepMark n={r.stage} className="bg-paper-raised" />
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
