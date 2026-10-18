import Link from "next/link";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { PLANNED_AUDIENCES } from "@/lib/audiences";

/**
 * One section per audience, each on its own band — text on one side, a small
 * labelled sample on the other, alternating so the scroll has a rhythm.
 * These audiences are planned, and every section says so.
 */
export function AudienceSections() {
  return (
    <div id="audiences">
      {PLANNED_AUDIENCES.map((a, i) => {
        const flip = i % 2 === 1;
        return (
          <Section
            key={a.slug}
            id={a.slug}
            tone={flip ? "raised" : "paper"}
            className="border-t border-ink/10 !py-16 md:!py-24"
          >
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <div className={flip ? "lg:order-2" : undefined}>
                  <div className="flex items-baseline gap-4">
                    <Eyebrow>{a.eyebrow}</Eyebrow>
                    <span className="label-mono text-ink-faint">Planned</span>
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
                      "w-full max-w-md rounded-seal border border-ink/20 bg-paper-raised p-6 md:p-7 " +
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
