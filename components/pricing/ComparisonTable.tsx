import { COMPARISON_ROWS, TIERS } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * Feature-by-feature breakdown beneath the tier cards. The cards answer "what
 * do I get for this price"; this answers "which plan has X" for a reader
 * comparing one specific capability across all four.
 *
 * A real `<table>`, not a div grid — this content is genuinely tabular (one
 * value per row/column pair) and a table gets keyboard and screen-reader
 * navigation (row/column headers) for free.
 *
 * Wrapped in `overflow-x-auto` with a `min-w` floor on the table itself,
 * matching the mobile-overflow guard PricingGrid already uses elsewhere on
 * this page — four price columns plus a label column will not fit 320px, so
 * it scrolls horizontally there rather than compressing into unreadable text.
 */
export function ComparisonTable() {
  return (
    <div>
      <p className="mb-3 text-[13px] text-ink-soft md:hidden">
        Swipe the table sideways to see every plan.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/10">
              <th
                scope="col"
                className="sticky left-0 z-10 w-36 bg-paper py-4 pr-4 md:w-1/3"
              >
                <span className="sr-only">Feature</span>
              </th>
              {TIERS.map((tier) => (
                <th
                  key={tier.id}
                  scope="col"
                  className="min-w-[110px] py-4 pr-4 font-display text-[15px] font-semibold text-ink"
                >
                  {tier.name}
                  {tier.popular ? (
                    <span className="label-mono ml-2 align-middle text-[10px] text-seal">
                      Recommended for students
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-b border-ink/10 last:border-b-0"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-paper py-4 pr-4 text-[14px] font-normal text-ink-soft"
                >
                  {row.label}
                </th>
                {TIERS.map((tier) => {
                  const value = row.values[tier.id];
                  return (
                    <td
                      key={tier.id}
                      className={cn(
                        "py-4 pr-4 text-[14px]",
                        typeof value === "string"
                          ? "text-ink"
                          : "text-ink-faint",
                      )}
                    >
                      {value === true ? (
                        <span aria-hidden="true">&#10003;</span>
                      ) : value === false ? (
                        <span aria-hidden="true">&mdash;</span>
                      ) : (
                        value
                      )}
                      {typeof value === "boolean" ? (
                        <span className="sr-only">
                          {value ? "Included" : "Not included"}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
