import Link from "next/link";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { PAGE_AUDIENCES } from "@/lib/audiences";

/**
 * One section per audience, text on one side and a small labelled sample on
 * the other, alternating sides so the scroll has a rhythm.
 *
 * They read as one chapter, not eleven separate pages stacked up: a single
 * opening with an index of every audience (so a visitor can jump straight to
 * theirs), one paper tone throughout with hairlines between, and tighter
 * spacing than a standalone section. Alternating band colours on top of
 * alternating sides made the run read as a striped wall.
 *
 * Advocates (junior, senior, designated senior) are served today and say
 * "Available now"; the rest are planned, and every section says which.
 */
export function AudienceSections() {
  return (
    <div id="audiences" className="border-t border-ink/10 bg-paper-raised">
      <Container className="pt-20 pb-6 md:pt-28 md:pb-10">
        <Eyebrow>Who it is for</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-title font-semibold text-balance">
          Built for students and advocates. Next, for <Emphasis>everyone</Emphasis> the law touches.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft">
          Advocates can use Shisho today. The rest are planned. Each section says
          which, and each has its own page with what exists now and what is to come.
        </p>
        <nav aria-label="Audiences" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {PAGE_AUDIENCES.map((a) => (
              <li key={a.slug}>
                <a
                  href={`#${a.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-ink/30 px-3.5 text-[13.5px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/70 hover:bg-paper"
                >
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      {PAGE_AUDIENCES.map((a, i) => {
        const flip = i % 2 === 1;
        return (
          <Section
            key={a.slug}
            id={a.slug}
            tone="raised"
            className="!pt-0 !pb-12 md:!pb-16"
          >
            <Container>
              <div className="grid items-center gap-10 border-t border-ink/10 pt-12 md:pt-16 lg:grid-cols-2 lg:gap-20">
                <div className={flip ? "lg:order-2" : undefined}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <Eyebrow>{a.eyebrow}</Eyebrow>
                    <span className="label-mono text-ink-faint">
                      {a.live ? "Available now" : "Planned"}
                    </span>
                  </div>
                  <h2 className="mt-4 max-w-xl font-display text-[2rem] font-semibold leading-[1.12] text-ink md:text-[2.4rem]">
                    <AudienceHeadline text={a.headline} />
                  </h2>
                  <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">
                    {a.blurb}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {a.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-ink/30 px-3.5 py-1.5 text-[13.5px] text-ink"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/for/${a.slug}`}
                    className="underline-draw mt-6 inline-block text-[14px] text-ink"
                  >
                    See the {a.name} page
                  </Link>
                </div>

                {a.sample ? (
                  <div
                    className={
                      "w-full max-w-md rounded-seal border border-ink/20 bg-paper p-6 md:p-7 " +
                      (flip ? "lg:order-1" : "lg:justify-self-end")
                    }
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="label-mono text-indigo">{a.sample.label}</p>
                      <p className="label-mono text-ink-faint">Sample</p>
                    </div>
                    <dl className="mt-5 divide-y divide-ink/10">
                      {a.sample.rows.map((row) => (
                        <div
                          key={row.term}
                          className="flex items-baseline justify-between gap-6 py-3"
                        >
                          <dt className="font-display text-[16px] font-semibold text-ink">
                            {row.term}
                          </dt>
                          {row.detail ? (
                            <dd className="max-w-[26ch] text-right text-[14px] leading-relaxed text-ink-soft">
                              {row.detail}
                            </dd>
                          ) : null}
                        </div>
                      ))}
                    </dl>
                    {a.disclaimer ? (
                      <p className="mt-4 text-[13px] italic text-ink-soft">
                        {a.disclaimer}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Container>
          </Section>
        );
      })}
    </div>
  );
}
