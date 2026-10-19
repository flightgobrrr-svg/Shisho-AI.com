import { Row, Screen, T } from "@/ui/components";
import { COURSES } from "@/lib/courses";
import { LEGAL_ENGLISH_LESSONS, SPOKEN_ENGLISH_LESSONS } from "@/lib/recordings";

/** Same courses and classes as the website, read from the same files. */
export default function Courses() {
  const count = (n: number) => (n === 0 ? "No recorded classes yet" : `${n} recorded ${n === 1 ? "class" : "classes"}`);
  return (
    <Screen gap={4}>
      <T tone="soft">Two tracks built on Indian law, and two English classes for court work.</T>
      <T v="label" tone="indigo" style={{ marginTop: 8 }}>Courses</T>
      {COURSES.map((c) => (
        <Row key={c.id} title={c.name} detail={`${c.level} · ${c.summary}`} href={{ pathname: "/courses/[id]", params: { id: c.id } }} />
      ))}
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>English for court</T>
      <Row title="Legal English" detail={`Reading a judgment, writing a pleading. ${count(LEGAL_ENGLISH_LESSONS.length)}`} href={{ pathname: "/classes/[track]", params: { track: "legal" } }} />
      <Row title="Spoken English" detail={`Oral argument and submissions. ${count(SPOKEN_ENGLISH_LESSONS.length)}`} href={{ pathname: "/classes/[track]", params: { track: "spoken" } }} />
    </Screen>
  );
}
