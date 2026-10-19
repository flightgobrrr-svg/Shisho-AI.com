import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Card, Headline, Notice, Screen, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { COURSES } from "@/lib/courses";

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <Screen>
        <Notice title="Course not found" body="That course is not in the list." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: course.name }} />
      <T v="label" tone="indigo">{course.level}</T>
      <Headline text={`*${course.name}*`} />
      <T tone="soft">{course.summary}</T>
      <T v="small" tone="faint">{course.duration} · {course.modules} modules</T>

      <T v="label" tone="indigo" style={{ marginTop: 8 }}>Syllabus</T>
      {course.syllabus.map((m, i) => (
        <View key={m.title} style={{ flexDirection: "row", gap: space.md }}>
          <T v="mono" tone="faint">{String(i + 1).padStart(2, "0")}</T>
          <View style={{ flex: 1, gap: 2 }}>
            <T v="h3">{m.title}</T>
            <T v="small" tone="soft">{m.detail}</T>
          </View>
        </View>
      ))}

      <Card>
        <T v="label" tone="indigo">What is included</T>
        {course.included.map((item) => (
          <T key={item} v="small">• {item}</T>
        ))}
      </Card>
      <T v="small" tone="faint">The course material is on the website. This page lists what each course covers.</T>
    </Screen>
  );
}
