import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Chip, Field, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { can, getWork, type Role } from "@/lib/clerkWork";
import { ADVOCATE_STATUSES, TASK_SLOTS, TASK_SLOT_LABELS, TASK_STATUSES, TASK_STATUS_LABELS, showDate, type TaskStatus } from "@/lib/clerkRegisters";
import { useLoad, when } from "@/features/clerkUi";

/** One task: its status (with the reason for a change), who has it, when it is due, and its full history. */
export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useLoad(() => clerk.task(id!), [id]);
  const info = useLoad(() => (t.data ? clerk.office(t.data.task.office_id).then((r) => r.office) : Promise.resolve(null)), [t.data?.task.office_id]);
  const members = useLoad(() => (t.data ? clerk.members(t.data.task.office_id).then((r) => r.members.filter((m) => m.active)) : Promise.resolve([])), [t.data?.task.office_id]);
  const role: Role = info.data?.role ?? "read_only";
  const [note, setNote] = useState("");
  const [due, setDue] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (t.loading && !t.data) return <Screen><ActivityIndicator /></Screen>;
  if (t.error || !t.data) return <Screen><Notice title="Could not open the task" body={t.error ?? ""} /></Screen>;
  const task = t.data.task;
  const work = task.work_no ? getWork(task.work_no) : undefined;
  const prepare = can(role, "prepare");

  const act = async (b: Parameters<typeof clerk.updateTask>[1]) => {
    setBusy(true);
    setError(null);
    try {
      await clerk.updateTask(task.id, { ...b, note: note.trim() || undefined });
      setNote("");
      await t.reload();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Task</T>
      <T v="title" style={{ fontSize: 26, lineHeight: 32 }}>{task.title}</T>
      <T v="small" tone="soft">{TASK_STATUS_LABELS[task.status]}{task.due_on ? ` · due ${showDate(task.due_on)}` : ""}{task.slot ? ` · ${TASK_SLOT_LABELS[task.slot]}` : ""}</T>
      {task.notes ? <T v="small">{task.notes}</T> : null}
      {task.matter_id ? <Row title="Open the case" href={`/clerk-work/case/${task.matter_id}`} /> : null}
      {work && task.matter_id && prepare ? <Button label={`Prepare ${work.no}. ${work.name}`} variant="ghost" onPress={() => router.push({ pathname: "/clerk-work/generate", params: { matter: task.matter_id!, work: String(work.no) } })} /> : null}

      {prepare ? (
        <>
          <SectionRule />
          <T v="h3">Status</T>
          <Field label="Note for this change (optional)" value={note} onChangeText={setNote} placeholder="e.g. Registry asked for the index again" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {TASK_STATUSES.filter((s) => can(role, "approve") || !ADVOCATE_STATUSES.includes(s)).map((s: TaskStatus) => (
              <Chip key={s} label={TASK_STATUS_LABELS[s]} selected={task.status === s} onPress={busy || task.status === s ? undefined : () => act({ status: s })} />
            ))}
          </View>
          {!can(role, "approve") ? <T v="small" tone="faint">Approved and Corrections Required are set by an advocate.</T> : null}

          <T v="h3" style={{ marginTop: space.md }}>Who has it</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Chip label="Nobody" selected={!task.assigned_to} onPress={busy ? undefined : () => act({ assignTo: null })} />
            {(members.data ?? []).map((m) => <Chip key={m.user_id} label={m.email || "Member"} selected={task.assigned_to === m.user_id} onPress={busy ? undefined : () => act({ assignTo: m.user_id })} />)}
          </View>

          <T v="h3" style={{ marginTop: space.md }}>When</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {TASK_SLOTS.map((s) => <Chip key={s} label={TASK_SLOT_LABELS[s]} selected={task.slot === s} onPress={busy ? undefined : () => act({ slot: task.slot === s ? null : s })} />)}
          </View>
          <Field label="Due date" value={due ?? (task.due_on ? showDate(task.due_on) : "")} onChangeText={setDue} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
          {due !== null ? <Button label="Save the due date" variant="dark" disabled={busy} onPress={() => act({ due: due.trim() || null }).then(() => setDue(null))} /> : null}
          {error ? <T v="small" tone="seal">{error}</T> : null}
        </>
      ) : null}

      <SectionRule />
      <T v="h3">History</T>
      {t.data.events.map((e, i) => (
        <View key={i} style={{ gap: 1 }}>
          <T v="small">{TASK_STATUS_LABELS[e.status] ?? e.status}{e.note ? `: ${e.note}` : ""}</T>
          <T v="small" tone="faint">{e.actor ? (t.data!.people[e.actor] ?? "A member") : "A former member"} · {when(e.at)}</T>
        </View>
      ))}
      {prepare ? (
        <TextButton
          label="Remove this task"
          onPress={() =>
            Alert.alert("Remove this task?", "It leaves the lists; the history stays in the case record.", [
              { text: "Keep", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                  try {
                    await clerk.deleteTask(task.id);
                    router.back();
                  } catch (e) {
                    setError(describeError(e));
                  }
                },
              },
            ])
          }
        />
      ) : null}
    </Screen>
  );
}
