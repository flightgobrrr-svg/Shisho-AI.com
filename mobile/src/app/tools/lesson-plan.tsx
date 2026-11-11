import { useState } from "react";
import { View } from "react-native";
import { Chip, Field, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { ToolRunner } from "@/features/ToolRunner";
import { LESSON_LEVELS, LESSON_MINUTES, type LessonLevel, type LessonMinutes } from "@/lib/toolTypes";

/** For lecturers: one class planned, with cases drawn only from the verified Library. */
export default function LessonPlan() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<LessonLevel>(LESSON_LEVELS[0]);
  const [minutes, setMinutes] = useState<LessonMinutes>(60);
  return (
    <ToolRunner
      photo={require("../../../assets/screens/lesson-plan.jpg")}
      tool="lesson-plan"
      eyebrow="For lecturers"
      headline="Spend class time *teaching*, not preparing."
      intro="Name a topic and Shisho plans one class: objectives, a timed outline, cases to read, the provisions, questions for discussion and a short assessment with answers. Cases come only from Shisho's verified Library."
      runLabel="Plan the class"
      build={() => (topic.trim().length >= 3 ? { topic: topic.trim(), level, minutes } : "Name the topic for the class.")}
      saveTitle={(r) => r.output.title || topic}
    >
      <Field label="Topic" value={topic} onChangeText={setTopic} placeholder="Basic structure; Order VII Rule 11; consideration" />
      <T v="label" tone="indigo">Level</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {LESSON_LEVELS.map((l) => (
          <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />
        ))}
      </View>
      <T v="label" tone="indigo">Class length</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {LESSON_MINUTES.map((m) => (
          <Chip key={m} label={`${m} minutes`} selected={minutes === m} onPress={() => setMinutes(m)} />
        ))}
      </View>
    </ToolRunner>
  );
}
