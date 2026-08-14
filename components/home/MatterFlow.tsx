import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { MAP_STAGES, PRODUCT_META } from "@/lib/sitemap";

/**
 * The homepage's primary way in, organised around the matter itself rather
 * than around the feature list.
 *
 * This replaced a three-door persona router ("student / practising lawyer /
 * exploring"). The map the product was sketched from describes a sequence —
 * client, draft, affidavit, plaint, pleadings, citations — and asking someone
 * to self-identify as a persona made them answer a question about themselves
 * before they could get anywhere. A stage of a matter is something they can
 * simply point at.
 *
 * Stages and copy come from lib/sitemap.ts, which /map also reads, so the two
 * views can never drift. A stage with no `serves` renders without chips: it is
 * on the map but nothing on the site answers it yet, and that is worth showing
 * honestly rather than inventing a destination for.
 */
export function MatterFlow() {
  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Where to start</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-title font-semibold">
              Find the stage you are <Emphasis>at</Emphasis>.
            </h2>
          </div>
          <Link
            href="/map"
            className="underline-draw text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
          >
            See the whole map
          </Link>
        </div>

        {/* Held narrower than the container: at full width the product chips
            drift to the far right edge and stop reading as belonging to the
            stage beside them. */}
        <ol className="reveal-stagger mt-12 max-w-4xl">
          {MAP_STAGES.map((stage, i) => (
            <li
              key={stage.n}
              style={{ "--i": i } as React.CSSProperties}
              className="relative pb-8 last:pb-0"
            >
              {/* The spine. Stops before the last stage so it never dangles. */}
              {i < MAP_STAGES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-7 bottom-0 left-3 w-px bg-ink/30"
                />
              )}

              <div className="flex gap-3.5">
                <StepMark n={stage.n} className="relative bg-paper" />

                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-0.5">
                  <div className="min-w-0 max-w-[52ch]">
                    <h3 className="font-display text-[19px] leading-snug font-semibold text-ink">
                      {stage.title}
                    </h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">
                      {stage.summary}
                    </p>
                  </div>

                  {stage.serves.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {stage.serves.map((product) => {
                        const meta = PRODUCT_META[product];
                        return (
                          <li key={product}>
                            <Link
                              href={meta.href}
                              className="label-mono inline-flex items-center border border-ink/45 px-2.5 py-1.5 text-ink-soft transition-[color,border-color,background-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75 hover:bg-paper-raised hover:text-ink"
                            >
                              {meta.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
