import { cn } from "@/lib/cn";

/**
 * The brand tic: one key word per heading, set in italic and underlined in
 * seal — the mentor's red pen on a student's draft.
 *
 * Use it SPARINGLY. One <Emphasis> per heading, and not in every heading on a
 * page. If two words in a heading feel like they deserve it, neither does.
 *
 * Renders <em>, so the emphasis is carried to screen readers and to any
 * reading mode that strips CSS.
 */
export function Emphasis({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <em className={cn("annotate", className)}>{children}</em>;
}
