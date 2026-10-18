import Link from "next/link";
import type { AudienceItem } from "@/lib/audiencePages";

/** A plain ruled list: label, one line, and whether it is live or planned. */
export function StatusList({ items }: { items: AudienceItem[] }) {
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => {
        const inner = (
          <>
            <span className="min-w-0">
              <span className="block font-display text-[17px] font-semibold text-ink">
                {item.label}
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">
                {item.note}
              </span>
            </span>
            <span
              className={
                "label-mono shrink-0 " +
                (item.status === "live" ? "text-indigo" : "text-ink-soft/70")
              }
            >
              {item.status === "live" ? "Live" : "Planned"}
            </span>
          </>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-baseline justify-between gap-6 py-4 transition-colors hover:bg-ink/[0.03]"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-baseline justify-between gap-6 py-4">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
