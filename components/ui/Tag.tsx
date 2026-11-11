import { cn } from "@/lib/cn";

/**
 * Small ruled tags: the feature chips under an audience section, and the
 * jump links beside them. Square like every other box on the site
 * (--radius-seal is 0): these were pills, the one rounded shape on a page of
 * cut corners.
 *
 *   TAG_CLASS       — a static label. Quieter than a button (fainter rule,
 *                     softer text, no hover) so it never reads as clickable.
 *   TAG_LINK_CLASS  — the same shape as a link, with the ghost button's
 *                     hover so it plainly is clickable.
 */
export const TAG_CLASS =
  "inline-flex items-center rounded-seal border border-ink/20 bg-paper-raised/50 px-2.5 py-1 text-[13px] leading-snug text-ink-soft";

export const TAG_LINK_CLASS = cn(
  "inline-flex min-h-9 items-center rounded-seal border border-ink/30 px-3 text-[13.5px] leading-snug text-ink",
  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/70 hover:bg-ink/[0.04]",
);

/** A row of static tags. */
export function TagList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li key={item} className={TAG_CLASS}>
          {item}
        </li>
      ))}
    </ul>
  );
}
