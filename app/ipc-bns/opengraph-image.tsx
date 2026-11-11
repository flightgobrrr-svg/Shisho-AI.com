import { OG_SIZE, ogCard } from "@/lib/ogCard";

export const alt = "IPC to BNS — Shisho AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Bharatiya Nyaya Sanhita, 2023",
    title: "The old section, the new number.",
    line: "Find the BNS section for a common IPC section.",
  });
}
