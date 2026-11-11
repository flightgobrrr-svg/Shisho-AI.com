import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Chip, Field, Row, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { describeError } from "@/api/client";
import { clerk, type TaskRow } from "@/api/clerk";
import { can, serialLabel, type Role } from "@/lib/clerkWork";
import { TASK_SLOTS, TASK_SLOT_LABELS, TASK_STATUS_LABELS, showDate, type TaskSlot } from "@/lib/clerkRegisters";
import { selectedOffice, useLoad } from "@/features/clerkUi";

/**
 * Clerk tasks, grouped under the five parts of the day. Each carries one of
 * the eleven statuses; every change is kept with who made it and when.
 */
export default function Tasks() {
  const params = useLocalSearchParams<{ office?: string; matter?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const [filter, setFilter] = useState<"open" | "mine" | "all">("open");
  const info = useLoad(() => clerk.office(office).then((r) => r.office), [office]);
  const role: Role = info.data?.role ?? "read_only";
  const list = useLoad(() => clerk.tasks(office, { matter: params.matter, open: filter !== "all", mine: filter === "mine" }), [office, params.matter, filter]);

  const groups: { key: TaskSlot | "none"; title: string; tasks: TaskRow[] }[] = [
    ...TASK_SLOTS.map((s) => ({ key: s, title: TASK_SLOT_LABELS[s], tasks: (list.data?.tasks ?? []).filter((t) => t.slot === s) })),
    { key: "none", title: "Any time", tasks: (list.data?.tasks ?? []).filter((t) => !t.slot) },
  ];
  const caseOf = (t: TaskRow) => (t.matter_id && list.data?.matters[t.matter_id] ? `${serialLabel(list.data.matters[t.matter_id].serial)} ${list.data.matters[t.matter_id].caseLabel ?? ""}` : "Office");

  return (
    <Screen>
      <T v="label" tone="indigo">Tasks</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        <Chip label="Open" selected={filter === "open"} onPress={() => setFilter("open")} />
        <Chip label="Mine" selected={filter === "mine"} onPress={() => setFilter("mine")} />
        <Chip label="All, with finished" selected={filter === "all"} onPress={() => setFilter("all")} />
      </View>
      {can(role, "prepare") ? <NewTask office={office} matter={params.matter} onDone={list.reload} /> : null}
      {list.loading && !list.data ? <ActivityIndicator /> : null}
      {list.error ? <T v="small" tone="seal">{list.error}</T> : null}
      {list.data && list.data.tasks.length === 0 ? <T v="small" tone="soft">Nothing here.</T> : null}
      {groups.filter((g) => g.tasks.length).map((g) => (
        <View key={g.key} style={{ gap: space.xs, marginTop: space.md }}>
          <T v="h3">{g.title}</T>
          {g.tasks.map((t) => (
            <Row
              key={t.id}
              title={`${t.work_no ? `[${t.work_no}] ` : ""}${t.title}`}
              detail={[caseOf(t), TASK_STATUS_LABELS[t.status], t.due_on ? `due ${showDate(t.due_on)}` : null, t.assigned_to ? (list.data!.people[t.assigned_to] ?? "") : "Unassigned"].filter(Boolean).join(" · ")}
              onPress={() => router.push(`/clerk-work/task/${t.id}`)}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}

function NewTask({ office, matter, onDone }: { office: string; matter?: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [slot, setSlot] = useState<TaskSlot | null>(null);
  const [workNo, setWorkNo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return <Button label="Add a task" variant="ghost" onPress={() => setOpen(true)} />;
  return (
    <View style={{ gap: space.md }}>
      <Field label="What needs doing" value={title} onChangeText={setTitle} placeholder="e.g. File process memo and batta" />
      <Field label="Clerk work number (optional)" value={workNo} onChangeText={setWorkNo} keyboardType="number-pad" placeholder="1–63" />
      <Field label="Due (optional)" value={due} onChangeText={setDue} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {TASK_SLOTS.map((s) => <Chip key={s} label={TASK_SLOT_LABELS[s]} selected={slot === s} onPress={() => setSlot(slot === s ? null : s)} />)}
      </View>
      {error ? <T v="small" tone="seal">{error}</T> : null}
      <Button
        label={busy ? "Adding…" : "Add"}
        variant="dark"
        disabled={busy || title.trim().length < 2}
        onPress={async () => {
          setBusy(true);
          setError(null);
          try {
            await clerk.createTask(office, { title: title.trim(), matterId: matter, due: due.trim() || undefined, slot: slot ?? undefined, workNo: workNo.trim() ? Number(workNo) : undefined });
            setTitle("");
            setDue("");
            setWorkNo("");
            setSlot(null);
            setOpen(false);
            onDone();
          } catch (e) {
            setError(describeError(e));
          } finally {
            setBusy(false);
          }
        }}
      />
      <TextButton label="Cancel" onPress={() => setOpen(false)} />
    </View>
  );
}
