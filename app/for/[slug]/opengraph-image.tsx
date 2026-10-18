import { OG_SIZE, ogCard } from "@/lib/ogCard";
import { getAudience } from "@/lib/audiences";

export const alt = "Shisho AI audience";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audience = getAudience(slug);
  return ogCard({
    eyebrow: audience?.eyebrow ?? "Shisho AI",
    title: (audience?.headline ?? "Shisho AI").replace(/\*/g, ""),
    line: audience?.blurb,
  });
}
