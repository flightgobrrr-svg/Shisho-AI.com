import { cn } from "@/lib/cn";

/**
 * The numbered square that marks a stage in a sequence — a persona box, a
 * syllabus module, a step in the drafting flow.
 *
 * Ink, never seal: this is a ruled marker on a form, not an annotation, and
 * the seal budget belongs to primary CTAs and the red-pen motif.
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
      aria-hidden="true"
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
