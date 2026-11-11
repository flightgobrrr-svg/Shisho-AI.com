import { cn } from "@/lib/cn";

/**
 * The numbered square that marks a stage in a sequence — a persona box, a
 * syllabus module, a step in the drafting flow.
 *
 * Ink, never seal: this is a ruled marker on a form, not an annotation, and
 * the seal budget belongs to primary CTAs and the red-pen motif.
 *
 * The numeral is NOT hidden from assistive tech. On /map the ordering IS the
 * content — nine stages in sequence — and marking the numbers `aria-hidden`
 * left that order reachable only through DOM order, which is to say invisible.
 * The glyph is decorative; the number it carries is not.
 */
export function StepMark({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-mono flex h-6 w-6 shrink-0 items-center justify-center",
        "border border-ink/45 text-ink-soft",
        className,
      )}
    >
      {n}
    </span>
  );
}
