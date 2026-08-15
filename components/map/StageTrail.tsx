import Link from "next/link";
import { StepMark } from "@/components/ui/StepMark";
import { MAP_STAGES, stagesServedBy, type Product } from "@/lib/sitemap";
import { cn } from "@/lib/cn";

/**
 * "Where this sits on the map" — the return path.
 *
 * The map linked outward to every page, but almost nothing linked back, so a
 * visitor who arrived on a document or a course had no way to see the shape it
 * belonged to. This is the other half of that edge.
 *
 * Pass `product` to derive the stages from `serves` in lib/sitemap.ts, or
 * `stages` to name them directly. Deriving is preferred: the relationship then
 * exists once, in the map data, and a stage added there shows up here without
 * anyone remembering to update a second list.
 */
export function StageTrail({
  product,
  stages,
  className,
}: {
  product?: Product;
  stages?: number[];
  className?: string;
}) {
  const resolved = product
    ? stagesServedBy(product)
    : MAP_STAGES.filter((s) => stages?.includes(s.n));

  if (resolved.length === 0) return null;

  return (
    <nav
      aria-label="Where this sits on the map"
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      <Link
        href="/map"
        className="underline-draw label-mono text-indigo transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
      >
        On the map
      </Link>

      <ul className="flex flex-wrap items-center gap-2">
        {resolved.map((stage) => (
          <li key={stage.n}>
            <Link
              href={`/map#stage-${stage.n}`}
              className="group flex items-center gap-2 border border-ink/45 bg-paper-raised py-1.5 pr-3 pl-1.5 text-[13.5px] text-ink-soft transition-[transform,border-color,color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:-translate-y-0.5 hover:border-ink/75 hover:text-ink"
            >
              <StepMark n={stage.n} className="size-5 text-[10px]" />
              {stage.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
