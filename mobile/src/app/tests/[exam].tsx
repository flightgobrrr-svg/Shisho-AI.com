import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";
import { Stack, useLocalSearchParams, usePreventRemove } from "expo-router";
import { Button, Card, Notice, Screen, T, TextButton } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { buildTest, getExam, type Question } from "@/lib/mockTests";
import { addSitting, sittings } from "@/state/tools";

/**
 * One mock test: the paper's scope, then a timed sitting (one question at a
 * time, free to move back and forth), then the score with every answer
 * explained and its source. Time running out submits what has been answered.
 */
type Phase = "intro" | "sitting" | "done";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function ExamScreen() {
  const { exam: examId } = useLocalSearchParams<{ exam: string }>();
  const exam = examId ? getExam(examId) : undefined;
  const p = usePalette();
  const { value: history } = sittings.use();

  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState(() => Date.now() % 2147483647);
  const paper: Question[] = useMemo(() => (exam ? buildTest(exam.id, seed) : []), [exam, seed]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [at, setAt] = useState(0);
  const [left, setLeft] = useState(0);
  const started = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  // A sitting is recorded once, however it ends (a double tap on "Hand in",
  // or time running out at the same moment).
  const handedIn = useRef(false);
  const finish = (given: number[]) => {
    if (!exam || handedIn.current) return;
    handedIn.current = true;
    const final = paper.map((_, i) => given[i] ?? -1);
    setAnswers(final);
    const score = paper.reduce((n, q, i) => n + (final[i] === q.answer ? 1 : 0), 0);
    const seconds = Math.round((Date.now() - started.current) / 1000);
    setElapsed(seconds);
    addSitting({ id: `${Date.now()}`, exam: exam.id, seed, takenAt: Date.now(), answers: final, score, total: paper.length, seconds });
    setPhase("done");
  };

  // The clock counts down to a fixed deadline, so time keeps running while the
  // app is in the background instead of pausing (which would give extra time).
  const deadline = useRef(0);
  useEffect(() => {
    if (phase !== "sitting") return;
    const tick = () => setLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [phase]);

  // Leaving mid-test asks first: Back used to throw the answers away silently.
  const [allowLeave, setAllowLeave] = useState(false);
  usePreventRemove(phase === "sitting" && !allowLeave, ({ repeat }) => {
    const answered = answers.filter((a) => a !== undefined && a >= 0).length;
    Alert.alert("Leave the test?", `You have answered ${answered} of ${paper.length}. Leaving now does not save this sitting.`, [
      { text: "Keep going", style: "cancel" },
      { text: "Hand in now", onPress: () => finish(answers) },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          setAllowLeave(true);
          repeat();
        },
      },
    ]);
  });

  // Reaching zero hands in the paper as it stands.
  useEffect(() => {
    if (phase === "sitting" && left === 0 && deadline.current && Date.now() >= deadline.current) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  if (!exam) {
    return (
      <Screen>
        <Notice title="That test is not here" body="Go back and pick one from the list." />
      </Screen>
    );
  }

  const start = (newSeed?: number) => {
    if (newSeed !== undefined) setSeed(newSeed);
    setAnswers([]);
    setAt(0);
    setLeft(exam.minutes * 60);
    started.current = Date.now();
    deadline.current = started.current + exam.minutes * 60 * 1000;
    handedIn.current = false;
    setPhase("sitting");
  };

  const mine = history.filter((s) => s.exam === exam.id);

  if (phase === "intro") {
    return (
      <Screen>
        <Stack.Screen options={{ title: exam.name }} />
        <T v="label" tone="indigo">Mock test</T>
        <T v="title">{exam.name}</T>
        <T tone="soft">{exam.blurb}</T>
        <Card>
          <T v="h3">{exam.length} questions · {exam.minutes} minutes</T>
          <T v="small" tone="soft">One mark each, no negative marking. Move freely between questions; when time runs out the paper is handed in as it stands.</T>
        </Card>
        <T v="small" tone="soft">{exam.scope}</T>
        <Button label="Start the test" onPress={() => start()} />
        {mine.length ? (
          <View style={{ gap: 4, marginTop: space.lg }}>
            <T v="label" tone="indigo">Your last sittings</T>
            {mine.slice(0, 5).map((s) => (
              <T key={s.id} v="small" tone="soft">
                {new Date(s.takenAt).toLocaleDateString("en-IN")} · {s.score}/{s.total} · {mmss(s.seconds)}
              </T>
            ))}
          </View>
        ) : null}
      </Screen>
    );
  }

  if (phase === "sitting") {
    const q = paper[at];
    const answered = answers.filter((a) => a !== undefined && a >= 0).length;
    return (
      <Screen>
        <Stack.Screen options={{ title: exam.name }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T v="label" tone="indigo">Question {at + 1} of {paper.length}</T>
          <T v="mono" tone={left < 60 ? "seal" : "ink"} accessibilityLabel={`${Math.ceil(left / 60)} minutes left`}>{mmss(left)}</T>
        </View>
        {/* Progress: one tick per question, filled once answered. Tap to jump. */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {paper.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setAt(i)}
              accessibilityRole="button"
              accessibilityLabel={`Question ${i + 1}${answers[i] >= 0 ? ", answered" : ""}`}
              hitSlop={4}
              style={{ width: 22, height: 8, backgroundColor: answers[i] >= 0 ? p.indigo : p.line, borderWidth: i === at ? 1.5 : 0, borderColor: p.ink }}
            />
          ))}
        </View>
        <T v="h3" style={{ fontSize: 19, lineHeight: 26 }}>{q.prompt}</T>
        <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
          {q.options.map((o, i) => {
            const chosen = answers[at] === i;
            return (
              <Pressable
                key={o}
                accessibilityRole="radio"
                accessibilityState={{ checked: chosen }}
                onPress={() => {
                  const next = [...answers];
                  next[at] = i;
                  setAnswers(next);
                }}
                style={({ pressed }) => ({
                  minHeight: 52,
                  flexDirection: "row",
                  gap: space.md,
                  alignItems: "center",
                  padding: space.md,
                  borderWidth: chosen ? 2 : 1,
                  borderColor: chosen ? p.ink : p.lineStrong,
                  backgroundColor: chosen ? p.raised : pressed ? p.line : "transparent",
                })}
              >
                <T v="mono" tone={chosen ? "ink" : "faint"} style={{ fontFamily: fonts.mono }}>{"ABCD"[i]}</T>
                <T v="small" style={{ flex: 1 }}>{o}</T>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Button label="Previous" variant="ghost" disabled={at === 0} onPress={() => setAt(at - 1)} />
          </View>
          <View style={{ flex: 1 }}>
            {at < paper.length - 1 ? <Button label="Next" variant="dark" onPress={() => setAt(at + 1)} /> : <Button label="Hand in" onPress={() => finish(answers)} />}
          </View>
        </View>
        <TextButton label={`Hand in now (${answered} of ${paper.length} answered)`} onPress={() => finish(answers)} />
      </Screen>
    );
  }

  const score = paper.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const pct = Math.round((score / paper.length) * 100);
  return (
    <Screen>
      <Stack.Screen options={{ title: exam.name }} />
      <T v="label" tone="indigo">Result</T>
      <T v="title" style={{ fontSize: 44, lineHeight: 48 }}>{score}/{paper.length}</T>
      <T tone="soft">{pct}% in {mmss(elapsed)}. Every answer is below with its reason and source.</T>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <View style={{ flex: 1 }}><Button label="New paper" onPress={() => start(Date.now() % 2147483647)} /></View>
        <View style={{ flex: 1 }}><Button label="Retake this one" variant="ghost" onPress={() => start()} /></View>
      </View>
      {paper.map((q, i) => {
        const mineAns = answers[i];
        const right = mineAns === q.answer;
        return (
          <View key={q.id} style={{ gap: 4, borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md }}>
            <T v="label" tone={right ? "indigo" : "seal"}>{i + 1} · {right ? "Correct" : mineAns >= 0 ? "Wrong" : "Not answered"}</T>
            <T v="small" style={{ fontFamily: fonts.sansSemi }}>{q.prompt}</T>
            {!right && mineAns >= 0 ? <T v="small" tone="soft">Your answer: {q.options[mineAns]}</T> : null}
            <T v="small">Answer: {q.options[q.answer]}</T>
            <T v="small" tone="soft">{q.explanation}</T>
            {q.sourceUrl ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(q.sourceUrl!)} hitSlop={6}>
                <T v="label" tone="indigo" style={{ textDecorationLine: "underline" }}>Source: {q.source}</T>
              </Pressable>
            ) : (
              <T v="label" tone="faint">Source: {q.source}</T>
            )}
          </View>
        );
      })}
    </Screen>
  );
}
