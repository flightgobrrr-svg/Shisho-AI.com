import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { StageTrail } from "@/components/map/StageTrail";
import { SampleCard } from "@/components/for/SampleCard";
import { SidePhoto } from "@/components/for/SidePhoto";
import { AUDIENCES } from "@/lib/audiences";
import { StatusList } from "@/components/for/StatusList";
import { EXTRAS } from "@/lib/audiencePages";
import {
  CASE_BRIEF_SAMPLE,
  COURSES,
  COURSES_FAQS,
  COURSES_INTRO,
} from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Two courses for Indian law — Starter for foundations, Proficient for interim relief, commercial drafting, and litigation strategy. Plans from ₹9 at /pricing.",
};

export default function CoursesPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Courses</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-[2.05rem] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[2.6rem] lg:text-display">
            Two courses, one <Emphasis>mentor</Emphasis>.
          </h1>
          <StageTrail product="courses" className="mt-6" />
          <p className="mt-6 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
            {COURSES_INTRO}
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="!pt-0 pb-20 md:pb-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-seal border border-ink/45 bg-paper-raised p-8 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Eyebrow>Plans</Eyebrow>
              <h2 className="mt-4 max-w-lg font-display text-[22px] font-semibold text-ink">
                Start free. Upgrade when the bot becomes part of your{" "}
                <Emphasis>routine</Emphasis>.
              </h2>
              <p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-soft">
                Four plans from ₹9 a month, and a standalone Shisho add-on —
                full breakdown on the pricing page.
              </p>
            </div>
            <Button href="/pricing" size="lg" className="shrink-0">
              See plans &amp; pricing
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-start gap-6 rounded-seal border border-ink/45 bg-paper-raised p-8">
              <div className="min-w-0">
                <Eyebrow>Recorded classes</Eyebrow>
                <h2 className="mt-4 font-display text-[22px] font-semibold text-ink">
                  Legal English — reading and <Emphasis>writing</Emphasis>.
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                  Reading a judgment, writing a pleading — a separate, ungraded
                  track. Watch in any order.
                </p>
              </div>
              <Button
                href="/courses/english"
                variant="ghost"
                size="lg"
                className="shrink-0"
              >
                Watch the classes
              </Button>
            </div>

            <div className="flex flex-col items-start gap-6 rounded-seal border border-ink/45 bg-paper-raised p-8">
              <div className="min-w-0">
                <Eyebrow>Recorded classes</Eyebrow>
                <h2 className="mt-4 font-display text-[22px] font-semibold text-ink">
                  Spoken English — arguing in <Emphasis>court</Emphasis>.
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                  Oral argument and courtroom submissions — its own ungraded
                  track. Watch in any order.
                </p>
              </div>
              <Button
                href="/courses/spoken-english"
                variant="ghost"
                size="lg"
                className="shrink-0"
              >
                Watch the classes
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* The law students photo on the right, like the homepage hero's; the
          list and the case-brief sample on the left. */}
      <Section className="relative isolate overflow-hidden !py-14 md:!py-16">
        <Container>
          <StudentsPhoto />
          <div className="lg:max-w-[54%]">
            <Eyebrow>For law students</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[1.5rem] font-semibold text-ink">
              Learn the law. Then learn to <Emphasis>apply</Emphasis> it.
            </h2>
            <div className="mt-6">
              <StatusList items={EXTRAS.students} />
              <div className="mt-8">
                <SampleCard className="max-w-md" sample={CASE_BRIEF_SAMPLE} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="raised">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 font-display text-title font-semibold">
                Before you <Emphasis>begin</Emphasis>.
              </h2>
            </div>

            <dl className="space-y-8">
              {COURSES_FAQS.map((faq) => (
                <div key={faq.q} className="min-w-0">
                  <dt className="font-display text-[18px] font-semibold text-ink">
                    {faq.q}
                  </dt>
                  <dd className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Container className="mt-16 px-0 text-center md:px-0">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                Try Shisho free
              </Button>
            </Magnetic>
          </Container>
        </Container>
      </Section>
    </>
  );
}

/** The law students photo from the promo video, beside the case-brief sample. */
function StudentsPhoto() {
  const photo = AUDIENCES.find((a) => a.slug === "students")?.photo;
  return photo ? <SidePhoto photo={photo} /> : null;
}
