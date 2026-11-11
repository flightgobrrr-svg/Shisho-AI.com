import Link from "next/link";
import { SampleCard } from "@/components/for/SampleCard";
import { SidePhoto } from "@/components/for/SidePhoto";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { Emphasis } from "@/components/ui/Emphasis";
import { TAG_LINK_CLASS, TagList } from "@/components/ui/Tag";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { PAGE_AUDIENCES } from "@/lib/audiences";

/**
 * One section per audience. With a photo: the copy and its labelled sample on
 * the left, the photo on the right, treated like the hero's (SidePhoto) and
 * always on the right. Without one: copy left, sample right.
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
    <div id="audiences" className="band-raised">
      <Container className="pt-20 pb-6 md:pt-28 md:pb-10">
        <Eyebrow>Who it is for</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-title font-semibold text-balance">
          Built for students and advocates. Next, for{" "}
          <Emphasis>everyone</Emphasis> the law touches.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft">
          Advocates can use Shisho today. The rest are planned. Each section
          says which, and each has its own page with what exists now and what is
          to come.
        </p>
        <nav aria-label="Audiences" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {PAGE_AUDIENCES.map((a) => (
              <li key={a.slug}>
                <a href={`#${a.slug}`} className={TAG_LINK_CLASS}>
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      {PAGE_AUDIENCES.map((a) => {
        const sample = a.sample ? (
          <SampleCard
            sample={{ ...a.sample, note: a.disclaimer }}
            className={
              a.photo ? "mt-8 max-w-md" : "max-w-md lg:justify-self-end"
            }
          />
        ) : null;
        const copy = (
          <div>
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
            <TagList items={a.chips} className="mt-6" />
            <Link
              href={`/for/${a.slug}`}
              className="underline-draw mt-6 inline-block text-[14px] text-ink"
            >
              See the {a.name} page
            </Link>
          </div>
        );
        return (
          <Section
            key={a.slug}
            id={a.slug}
            className="relative isolate overflow-hidden !pt-0 !pb-12 md:!pb-16"
          >
            <Container>
              <div className="border-t border-ink/10 pt-12 md:pt-16">
                {a.photo ? (
                  <>
                    <SidePhoto photo={a.photo} />
                    <div className="lg:max-w-[54%]">
                      {copy}
                      {sample}
                    </div>
                  </>
                ) : (
                  <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
                    {copy}
                    {sample}
                  </div>
                )}
              </div>
            </Container>
          </Section>
        );
      })}
    </div>
  );
}
