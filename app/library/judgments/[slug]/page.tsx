import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PREVIEW_CASES, findCaseBySlug, judgmentSearchUrl, type PreviewCase } from "@/lib/library";
import { fetchVerifiedCases } from "@/lib/verifiedCases";
import { getCaseDigest } from "@/lib/caseBrief";
import { DigestView } from "@/components/library/DigestView";

async function allCases(): Promise<PreviewCase[]> {
  const verifiedFromSupabase = await fetchVerifiedCases();
  return [...PREVIEW_CASES, ...verifiedFromSupabase];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findCaseBySlug(await allCases(), slug);
  if (!item) return {};
  return { title: `${item.title} — Legal Library`, description: item.topic };
}

/**
 * A book-quality citation digest for one of the curated Library's own
 * cases — headnote through ready-reference note, built from the judgment's
 * own real text (lib/caseBrief.ts fetches it live from the case's verified
 * sourceUrl), not the model's memory of the case. Rendering itself lives in
 * components/library/DigestView.tsx, shared with app/library/lookup (a
 * judgment outside the curated Library, found via a live search).
 */
export default async function JudgmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findCaseBySlug(await allCases(), slug);
  if (!item) notFound();

  const digest = await getCaseDigest(item, slug);

  return (
    <DigestView
      title={item.title}
      citation={item.citation}
      court={item.court}
      digest={digest}
      sourceHref={item.sourceUrl ?? judgmentSearchUrl(item)}
      sourceIsDirect={Boolean(item.sourceUrl)}
      backHref="/library"
      backLabel="Legal Library"
    />
  );
}
