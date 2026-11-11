import { cn } from "@/lib/cn";

/**
 * The one tab style on the site: a hairline under the row and a 2px ink rule
 * under the selected tab. Used by the Shisho workspace (draft / review), the
 * class tracks (recorded / live) and the formats picker (civil / criminal).
 * Mode switches, not actions — so they stay out of the button palette rather
 * than competing with the page's one filled button.
 */
export const TAB_LIST_CLASS = "flex gap-x-8 border-b border-ink/15";

export function tabClass(selected: boolean, className?: string) {
  return cn(
    "-mb-px border-b-2 px-1 pt-1 pb-3 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
    selected
      ? "border-ink text-ink"
      : "border-transparent text-ink-soft hover:border-ink/30 hover:text-ink",
    className,
  );
}

export const TAB_LABEL_CLASS =
  "block font-display text-[1.05rem] leading-snug font-semibold sm:text-[1.15rem]";
