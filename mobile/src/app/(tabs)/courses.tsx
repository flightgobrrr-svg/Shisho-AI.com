import { View } from "react-native";
import { Button, Headline, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space } from "@/ui/theme";
import { CourseCard, Panel, Questions, SampleCard, SectionRule, StageTrail, StatusList } from "@/ui/web";
import { CASE_BRIEF_SAMPLE, COURSES, COURSES_FAQS, COURSES_INTRO } from "@/lib/courses";
import { EXTRAS } from "@/lib/audiencePages";
import { AUDIENCE_PHOTOS } from "@/features/audienceUi";

/**
 * The website's /courses, section for section: the two course cards with
 * their full syllabus, the plans panel, the two recorded-class tracks, "For
 * law students" with its photo and sample, and the questions. Same data
 * (lib/courses.ts, lib/audiencePages.ts).
 */
export default function Courses() {
  return (
    <Screen>
      <T v="label" tone="indigo">Courses</T>
      <Headline text="Two courses, one *mentor*." />
      <StageTrail product="courses" />
      <T tone="soft">{COURSES_INTRO}</T>

      {COURSES.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}

      <SectionRule />
      <Panel
        eyebrow="Plans"
        heading="Start free. Upgrade when the bot becomes part of your *routine*."
        body="Four plans from ₹9 a month, and a standalone Shisho add-on — full breakdown on the pricing page."
        cta={{ label: "See plans & pricing", href: "/pricing" }}
      />
      <Panel
        eyebrow="Recorded classes"
        heading="Legal English — reading and *writing*."
        body="Reading a judgment, writing a pleading — a separate, ungraded track. Watch in any order."
        cta={{ label: "Watch the classes", href: { pathname: "/classes/[track]", params: { track: "legal" } }, variant: "ghost" }}
      />
      <Panel
        eyebrow="Recorded classes"
        heading="Spoken English — arguing in *court*."
        body="Oral argument and courtroom submissions — its own ungraded track. Watch in any order."
        cta={{ label: "Watch the classes", href: { pathname: "/classes/[track]", params: { track: "spoken" } }, variant: "ghost" }}
      />

      <SectionRule />
      <FadedPhoto source={AUDIENCE_PHOTOS.students} height={230} />
      <T v="label" tone="indigo">For law students</T>
      <Headline text="Learn the law. Then learn to *apply* it." v="h2" />
      <StatusList items={EXTRAS.students} />
      <SampleCard label={CASE_BRIEF_SAMPLE.label} rows={CASE_BRIEF_SAMPLE.rows} />

      <SectionRule />
      <Questions heading="Before you *begin*." items={COURSES_FAQS} />
      <View style={{ marginTop: space.md }}>
        <Button label="Try Shisho free" href="/shisho" />
      </View>
    </Screen>
  );
}
