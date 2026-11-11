import { OG_SIZE, ogCard } from "@/lib/ogCard";

export const alt = "Limitation checker — Shisho AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Limitation Act, 1963",
    title: "Is the claim still in time?",
    line: "Work out the last day to file.",
  });
}
