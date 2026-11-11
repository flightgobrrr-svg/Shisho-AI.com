import { OG_SIZE, ogCard } from "@/lib/ogCard";
import { getDocument } from "@/lib/documents";

export const alt = "Court document reference — Shisho AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocument(slug);
  return ogCard({
    eyebrow: doc?.provision.cite ?? "Documents",
    title: doc?.name ?? "Documents",
    line: doc?.lede,
  });
}
