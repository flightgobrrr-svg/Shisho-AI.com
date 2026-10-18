import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { CaseCitations, CaseDigest } from "@/lib/caseBrief";

/**
 * The book-quality citation digest layout — shared by the curated Library's
 * app/library/judgments/[slug] and the live-search app/library/lookup,
 * which differ only in where their title/citation/court/source link come
 * from (a verified PreviewCase vs. a live Kanoon search result), never in
 * how the digest itself renders. Format specified directly by the product
 * owner: court name prominent at top, side headings only, no numbering, no
 * decorative text.
 */

const CITATION_LABELS: Record<keyof CaseCitations, string> = {
  scc: "SCC",
  air: "AIR",
  sccOnline: "SCC OnLine",
  airScw: "AIR SCW",
  scale: "SCALE",
  alt: "ALT",
  ald: "ALD",
  aplj: "APLJ",
  crilj: "CriLJ",
  other: "Other",
};

function Field({ heading, children }: { heading: string; children: string }) {
  return (
    <div className="border-t border-ink/10 pt-8">
      <p className="label-mono text-ink-soft">{heading}</p>
      <p className="mt-3 max-w-[68ch] text-[15.5px] leading-relaxed text-ink">{children}</p>
    </div>
  );
}

const DIGEST_SECTIONS: Array<{ heading: string; field: keyof CaseDigest }> = [
  { heading: "Headnote", field: "headnote" },
  { heading: "Synopsis", field: "synopsis" },
  { heading: "Important Observations of the Court", field: "importantObservations" },
  { heading: "Ratio Decidendi", field: "ratioDecidendi" },
  { heading: "Judicial Analysis", field: "judicialAnalysis" },
  { heading: "Analogy", field: "analogy" },
  { heading: "Result of the Case", field: "resultOfCase" },
  { heading: "Practical Litigation Application", field: "practicalLitigationApplication" },
  { heading: "Practical Test Laid Down", field: "practicalTestLaidDown" },
  { heading: "Key Takeaway", field: "keyTakeaway" },
  { heading: "Final Court Principle", field: "finalCourtPrinciple" },
  { heading: "Strongest Citable Point", field: "strongestCitablePoint" },
  { heading: "One-Line Legal Principle", field: "oneLineLegalPrinciple" },
  { heading: "Ready Reference Note", field: "readyReferenceNote" },
];

export function DigestView({
  title,
  citation,
  court,
  digest,
  sourceHref,
  sourceIsDirect,
  backHref,
  backLabel,
}: {
  title: string;
  citation: string | null;
  court: string;
  digest: CaseDigest;
  sourceHref: string;
  /** True for a verified direct document link; false for a search-query
   *  fallback — changes the button's own wording to match. */
  sourceIsDirect: boolean;
  backHref: string;
  backLabel: string;
}) {
  const citations = Object.entries(digest.citations).filter(
    (entry): entry is [keyof CaseCitations, string] => Boolean(entry[1]),
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <Link
        href={backHref}
        className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
      >
        {backLabel}
      </Link>

      <div className="mt-10 text-center">
        <p className="font-display text-[20px] font-bold tracking-wide text-ink">
          {digest.courtHeader}
        </p>
        <h1 className="mt-5 font-display text-[26px] font-bold uppercase leading-snug text-ink">
          {title}
        </h1>
        {citation ? <p className="label-mono mt-4 text-indigo">{citation}</p> : null}
      </div>

      <dl className="mt-14 grid gap-x-10 gap-y-6 border-y border-ink/10 py-8 sm:grid-cols-2">
        <div>
          <dt className="label-mono text-ink-soft/70">Case Number</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{digest.caseNumber}</dd>
        </div>
        <div>
          <dt className="label-mono text-ink-soft/70">Court</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{court}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="label-mono text-ink-soft/70">Bench</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{digest.bench}</dd>
        </div>
        <div>
          <dt className="label-mono text-ink-soft/70">Date of Judgment</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{digest.dateOfJudgment}</dd>
        </div>
        <div>
          <dt className="label-mono text-ink-soft/70">Nature of Proceedings</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{digest.natureOfProceedings}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="label-mono text-ink-soft/70">Result</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{digest.result}</dd>
        </div>
      </dl>

      {citations.length > 0 && (
        <div className="mt-8 border-b border-ink/10 pb-8">
          <p className="label-mono text-ink-soft/70">Equivalent Citations</p>
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {citations.map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-2">
                <dt className="label-mono text-ink-soft/70">{CITATION_LABELS[key]}</dt>
                <dd className="text-[14.5px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-4 space-y-8">
        {DIGEST_SECTIONS.map(({ heading, field }) => (
          <Field key={field} heading={heading}>
            {digest[field] as string}
          </Field>
        ))}
      </div>

      <p className="mt-10 border-t border-ink/10 pt-6 text-[13px] leading-relaxed text-ink-soft/70">
        This digest is prepared by Shisho from the primary judgment text — original
        analysis, not a reproduction of any published headnote or digest. Read the
        judgment itself below before relying on it.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href={sourceHref} target="_blank" rel="noreferrer">
          {sourceIsDirect ? "Read the judgment on Indian Kanoon" : "Find the judgment on Indian Kanoon"}
        </Button>
        <Button href={backHref} variant="ghost">
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
