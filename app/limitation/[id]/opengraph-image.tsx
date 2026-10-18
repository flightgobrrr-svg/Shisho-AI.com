import { OG_SIZE, ogCard } from "@/lib/ogCard";
import { LIMITATION_ENTRIES, periodLabel } from "@/lib/limitation";

export const alt = "Limitation period — Shisho AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = LIMITATION_ENTRIES.find((e) => e.id === id);
  return ogCard({
    eyebrow: entry?.article ?? "Limitation",
    title: `Limitation for ${entry?.label.toLowerCase() ?? "a claim"}`,
    line: entry ? `${periodLabel(entry.period)}. Work out the last day to file.` : undefined,
  });
}
