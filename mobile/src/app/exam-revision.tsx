import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { PageHeader, StepMark } from "@/ui/web";
import { ApiError, apiConfigured, describeError } from "@/api/client";
import { runTool } from "@/api/endpoints";
import { ToolOutputView, toolText } from "@/features/ToolResults";
import { createPersistedStore } from "@/state/persisted";
import { shareText } from "@/ui/share";
import { COURSES } from "@/lib/courses";
import { FREE_MONTHLY_TOOL_RUNS, type ToolResult } from "@/lib/toolTypes";

/**
 * Exam revision for students: for each module of their course, key points,
 * the provisions it turns on and self-test questions. Prepared once with a
 * connection, then kept on this phone, so revision works with no signal.
 */
const notesStore = createPersistedStore<Record<string, ToolResult<"exam-revision">>>("shisho-exam-revision", {});

export default function ExamRevision() {
  const [courseId, setCourseId] = useState<"starter" | "proficient">("starter");
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfRuns, setOutOfRuns] = useState(false);
  const { value: notes } = notesStore.use();
  const course = COURSES.find((c) => c.id === courseId)!;
  const key = (m: number) => `${courseId}:${m}`;

  const prepare = async (module: number) => {
    setError(null);
    setOutOfRuns(false);
    setBusy(true);
    try {
      const r = await runTool("exam-revision", { courseId, module });
      // A demo answer is not worth keeping as revision notes.
      if (r.mode === "live") notesStore.set({ ...notesStore.get(), [key(module)]: r });
      else setError("This build has no AI model connected, so notes cannot be prepared yet.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) setOutOfRuns(true);
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  if (open !== null) {
    const m = course.syllabus[open];
    const saved = notes[key(open)];
    return (
      <Screen>
        <TextButton label={`‹ ${course.name} modules`} onPress={() => setOpen(null)} />
        <T v="label" tone="indigo">{course.name} · Module {open + 1}</T>
        <T v="h2">{m.title}</T>
        <T v="small" tone="soft">{m.detail}</T>
        {saved ? (
          <>
            <ToolOutputView result={saved} />
            <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
              <Button label="Share" variant="ghost" onPress={() => shareText(toolText(saved))} />
              <Button label={busy ? "Preparing…" : "Prepare fresh notes"} variant="ghost" disabled={busy || !apiConfigured} onPress={() => prepare(open)} />
            </View>
          </>
        ) : (
          <>
            {!apiConfigured ? <Notice title="Needs Shisho's online service" body="This build is not connected to it, so notes cannot be prepared here." /> : null}
            <Button label={busy ? "Preparing… this can take a minute" : "Prepare revision notes"} disabled={busy || !apiConfigured} onPress={() => prepare(open)} />
            <T v="small" tone="faint">Prepared once, then kept on this phone. Uses one of the {FREE_MONTHLY_TOOL_RUNS} free tool runs a month on the Free and Basic plans.</T>
          </>
        )}
        {error ? <T tone="seal">{error}</T> : null}
        {outOfRuns ? <Button label="See plans" href="/pricing" variant="ghost" /> : null}
        <T v="small" tone="faint">Check every provision against its source before you rely on it in an exam answer.</T>
      </Screen>
    );
  }

  return (
    <Screen gap={4}>
      <PageHeader
        eyebrow="Exam revision"
        headline="Revise the course, module by *module*."
        intro="Key points, the provisions each module turns on, and questions to test yourself, prepared from your course syllabus. Once prepared, a module's notes open here with no signal."
      />
      <View style={{ flexDirection: "row", gap: space.sm, marginVertical: space.md }}>
        {COURSES.map((c) => (
          <Chip key={c.id} label={c.name} selected={courseId === c.id} onPress={() => setCourseId(c.id)} />
        ))}
      </View>
      {course.syllabus.map((m, i) => (
        <View key={m.title} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <StepMark n={i + 1} />
          <View style={{ flex: 1 }}>
            <Row title={m.title} detail={notes[key(i)] ? "Notes saved on this phone" : "Not prepared yet"} onPress={() => setOpen(i)} />
          </View>
        </View>
      ))}
    </Screen>
  );
}
