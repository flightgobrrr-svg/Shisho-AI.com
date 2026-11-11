import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Button, Headline, Row, T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { MAP_STAGES, stagesServedBy, type Product } from "@/lib/sitemap";
import type { Course } from "@/lib/courses";
import type { AudienceItem } from "@/lib/audiencePages";
import { appRoute } from "@/features/audienceRoutes";

/**
 * The website's recurring page pieces, built once for the app so each screen
 * can be laid out like its website page: StepMark, StageTrail, the course
 * card, the live/planned status list, the sample card, the questions list and
 * the boxed call-to-action panel. Same names as the website components.
 */

/** The small numbered box used for stages, steps and syllabus items. */
export function StepMark({ n, size = 22 }: { n: number; size?: number }) {
  const p = usePalette();
  return (
    <View style={{ width: size, height: size, borderWidth: 1, borderColor: p.lineStrong, alignItems: "center", justifyContent: "center", backgroundColor: p.raised }}>
      <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.mono, fontSize: size < 22 ? 10 : 11, color: p.inkSoft }}>{n}</Text>
    </View>
  );
}

/** "On the map" and the stages a product serves, each opening the Map. */
export function StageTrail({ product, stages }: { product?: Product; stages?: number[] }) {
  const router = useRouter();
  const p = usePalette();
  const resolved = product ? stagesServedBy(product) : MAP_STAGES.filter((s) => stages?.includes(s.n));
  if (resolved.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm }}>
      <Pressable accessibilityRole="link" onPress={() => router.push("/map")} hitSlop={6}>
        <T v="label" tone="indigo" style={{ textDecorationLine: "underline" }}>On the map</T>
      </Pressable>
      {resolved.map((s) => (
        <Pressable
          key={s.n}
          accessibilityRole="link"
          onPress={() => router.push("/map")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: p.lineStrong, backgroundColor: p.raised, paddingVertical: 6, paddingLeft: 6, paddingRight: 10, minHeight: 40 }}
        >
          <StepMark n={s.n} size={18} />
          <T v="small" tone="soft">{s.title}</T>
        </Pressable>
      ))}
    </View>
  );
}

/** The website's CourseCard: level, name, duration, summary, syllabus and what is included. */
export function CourseCard({ course }: { course: Course }) {
  const p = usePalette();
  return (
    <View style={{ borderWidth: 1, borderColor: p.lineStrong, backgroundColor: p.raised, padding: space.xl, gap: space.md }}>
      <T v="label" tone="faint">{course.level}</T>
      <Headline text={`*${course.name}*`} v="h2" />
      <T v="label" tone="faint">{course.duration} · {course.modules} modules</T>
      <T tone="soft">{course.summary}</T>
      <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg, gap: space.md }}>
        <T v="label" tone="faint">Syllabus</T>
        {course.syllabus.map((item, i) => (
          <View key={item.title} style={{ flexDirection: "row", gap: space.md }}>
            <StepMark n={i + 1} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: p.ink }}>{item.title}</Text>
              <T v="small" tone="soft">{item.detail}</T>
            </View>
          </View>
        ))}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg, gap: 6 }}>
        <T v="label" tone="faint">What&apos;s included</T>
        {course.included.map((item) => (
          <T key={item} v="small" tone="soft">✓  {item}</T>
        ))}
      </View>
    </View>
  );
}

/** The website's StatusList: label, one line, Live or Planned, opening the matching screen. */
export function StatusList({ items, numbered = false }: { items: AudienceItem[]; numbered?: boolean }) {
  return (
    <View>
      {items.map((item, i) => {
        const route = item.status === "live" ? appRoute(item.href) : null;
        return (
          <Row
            key={item.label}
            title={numbered ? `${i + 1}  ${item.label}` : item.label}
            detail={item.note}
            status={item.status}
            href={route ?? undefined}
          />
        );
      })}
    </View>
  );
}

/** The website's SampleCard: a labelled illustration, always marked "Sample". */
export function SampleCard({ label, rows, note }: { label: string; rows: { term: string; detail?: string }[]; note?: string }) {
  const p = usePalette();
  return (
    <View style={{ borderWidth: 1, borderColor: p.line, backgroundColor: p.raised, padding: space.xl, gap: space.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
        <T v="label" tone="indigo" style={{ flexShrink: 1 }}>{label}</T>
        <T v="label" tone="faint">Sample</T>
      </View>
      {rows.map((row) => (
        <View key={row.term} style={{ flexDirection: "row", gap: space.md, paddingVertical: space.sm, borderTopWidth: 1, borderTopColor: p.line }}>
          <T v="h3" style={{ fontSize: 16, width: "38%" }}>{row.term}</T>
          {row.detail ? <T v="small" tone="soft" style={{ flex: 1 }}>{row.detail}</T> : null}
        </View>
      ))}
      {note ? <T v="small" tone="soft" style={{ fontStyle: "italic" }}>{note}</T> : null}
    </View>
  );
}

/** "Questions" and a heading, then each question and its answer. */
export function Questions({ heading, items }: { heading: string; items: { q: string; a: string }[] }) {
  return (
    <View style={{ gap: space.md }}>
      <T v="label" tone="indigo">Questions</T>
      <Headline text={heading} v="h2" />
      {items.map((f) => (
        <View key={f.q} style={{ gap: 4 }}>
          <T v="h3">{f.q}</T>
          <T v="small" tone="soft">{f.a}</T>
        </View>
      ))}
    </View>
  );
}

/** A boxed panel with an eyebrow, heading, line and one button. */
export function Panel({
  eyebrow,
  heading,
  body,
  cta,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  cta: { label: string; href: Href; variant?: "primary" | "ghost" };
}) {
  const p = usePalette();
  return (
    <View style={{ borderWidth: 1, borderColor: p.lineStrong, backgroundColor: p.raised, padding: space.xl, gap: space.md }}>
      <T v="label" tone="indigo">{eyebrow}</T>
      <Headline text={heading} v="h2" />
      <T v="small" tone="soft">{body}</T>
      <Button label={cta.label} href={cta.href} variant={cta.variant ?? "primary"} />
    </View>
  );
}

/** A page's opening, as on the website: the eyebrow label, the headline and the intro. */
export function PageHeader({ eyebrow, headline, intro }: { eyebrow: string; headline: string; intro?: string }) {
  return (
    <View style={{ gap: space.md }}>
      <T v="label" tone="indigo">{eyebrow}</T>
      <Headline text={headline} />
      {intro ? <T tone="soft">{intro}</T> : null}
    </View>
  );
}

/** The thin rule the website uses between sections. */
export function SectionRule() {
  const p = usePalette();
  return <View style={{ height: 1, backgroundColor: p.line, marginVertical: space.lg }} />;
}
