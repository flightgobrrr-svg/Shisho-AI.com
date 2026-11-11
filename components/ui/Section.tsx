import { cn } from "@/lib/cn";

/**
 * Vertical rhythm is defined here and nowhere else. Every landing section uses
 * <Section>, so the page reads as one calm document rather than a stack of
 * components each inventing its own spacing.
 *
 * Sections never draw a full-width line on their edges, and the raised tone
 * fades in and out (`band-raised`): hard seams made sections look pasted on.
 */
export function Section({
  children,
  className,
  id,
  tone = "paper",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  id?: string;
  tone?: "paper" | "raised" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
        tone === "raised" && "band-raised",
        tone === "ink" && "bg-inverse text-on-inverse",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-6 md:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Small mono eyebrow above section headings.
 *
 * Set in `indigo` — the palette's cool counter-tone. It appears on every
 * section, so this is where the cool note earns its place against an
 * otherwise entirely warm page. Full opacity, not a tint: at 11px the label
 * needs its whole 9.26:1 contrast.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("label-mono text-indigo", className)}>{children}</p>;
}
