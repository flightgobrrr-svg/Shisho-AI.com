import Link from "next/link";
import { Eyebrow } from "@/components/ui/Section";
import { DOCUMENTS } from "@/lib/documents";

/** ISO-ish week number, so the pick changes every Monday and is the same for everyone. */
function weekNumber(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const day = Math.floor((d.getTime() - start) / 86_400_000);
  return Math.floor((day + new Date(start).getUTCDay()) / 7);
}

/** One reference page, rotated weekly — a reason to come back and read one. */
export function DocumentOfTheWeek() {
  const now = new Date();
  const doc = DOCUMENTS[(weekNumber(now) + now.getUTCFullYear()) % DOCUMENTS.length];

  return (
    <div className="mt-10 rounded-seal border border-ink/20 bg-paper-raised p-6 md:p-7">
      <Eyebrow>Document of the week</Eyebrow>
      <p className="mt-3 font-display text-[1.35rem] font-semibold text-ink">{doc.name}</p>
      <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-ink-soft">{doc.lede}</p>
      <p className="label-mono mt-3 text-indigo">{doc.provision.cite}</p>
      <Link href={`/documents/${doc.slug}`} className="underline-draw mt-4 inline-block text-[14px] text-ink">
        Read what it must contain
      </Link>
    </div>
  );
}
