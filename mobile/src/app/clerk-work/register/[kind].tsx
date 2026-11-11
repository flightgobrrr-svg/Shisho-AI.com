import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Notice, Screen, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { describeError } from "@/api/client";
import { clerk, type EntryRowApi } from "@/api/clerk";
import { serialLabel, type Role } from "@/lib/clerkWork";
import { getRegister, isRegisterKind, showDate, type RegisterKind } from "@/lib/clerkRegisters";
import { ClerkForm, missingIn, type FormValues } from "@/features/clerkForm";
import { selectedOffice, useLoad } from "@/features/clerkUi";

/**
 * One register (filings, objections, process and service, certified copies,
 * documents and originals, expenses, attendance), office-wide or for one case.
 * Rows filed automatically by the services appear here too.
 */
const PAIRS: Partial<Record<RegisterKind, RegisterKind>> = { filing: "objection", objection: "filing" };

export default function Register() {
  const params = useLocalSearchParams<{ kind: string; office?: string; matter?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const [kind, setKind] = useState<RegisterKind>(isRegisterKind(params.kind) ? params.kind : "filing");
  const [show, setShow] = useState<"open" | "all">("open");
  const def = getRegister(kind);
  const info = useLoad(() => clerk.office(office).then((r) => r.office), [office]);
  const role: Role = info.data?.role ?? "read_only";
  const canWrite = kind === "expense" ? role !== "read_only" : !["read_only", "accounts"].includes(role);
  const list = useLoad(() => clerk.entries(office, kind, params.matter), [office, kind, params.matter]);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const rows = (list.data?.entries ?? []).filter((e) => show === "all" || !def.statusField || def.openStatuses?.includes(e.status ?? ""));
  const total = def.kind === "expense" ? rows.reduce((n, e) => n + (e.data.nature === "Cost claimed" ? 0 : (e.amount ?? 0)), 0) : null;

  return (
    <Screen>
      <Stack.Screen options={{ title: def.title }} />
      <T v="label" tone="indigo">{params.matter ? "Register for this case" : "Office register"}</T>
      <T v="title" style={{ fontSize: 28, lineHeight: 34 }}>{def.title}</T>
      <T v="small" tone="soft">{def.blurb}</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {PAIRS[kind] ? <Chip label={getRegister(PAIRS[kind]!).title} onPress={() => setKind(PAIRS[kind]!)} /> : null}
        {def.statusField ? (
          <>
            <Chip label="Needs work" selected={show === "open"} onPress={() => setShow("open")} />
            <Chip label="All" selected={show === "all"} onPress={() => setShow("all")} />
          </>
        ) : null}
      </View>
      {kind === "service" ? <T v="small" tone="faint">Dispatch is not service. A row shows delivered only on an acknowledgment; a returned cover keeps its endorsement word for word.</T> : null}
      {canWrite ? (
        adding ? (
          <EntryForm office={office} kind={kind} matter={params.matter} onDone={() => { setAdding(false); void list.reload(); }} onCancel={() => setAdding(false)} />
        ) : (
          <Button label={`Add a ${def.noun}`} variant="ghost" onPress={() => setAdding(true)} />
        )
      ) : null}
      {list.loading && !list.data ? <ActivityIndicator /> : null}
      {list.error ? <Notice title="Could not load the register" body={list.error} /> : null}
      {list.data && rows.length === 0 ? <T v="small" tone="soft">{show === "open" && def.statusField ? "Nothing needs work." : "No entries yet."}</T> : null}
      {total !== null && rows.length ? <T v="h3">Actual spend shown: ₹{total.toLocaleString("en-IN")}</T> : null}
      {rows.map((e) => (
        <EntryCard
          key={e.id}
          e={e}
          kind={kind}
          matter={e.matter_id && list.data?.matters[e.matter_id] ? `${serialLabel(list.data.matters[e.matter_id].serial)} ${list.data.matters[e.matter_id].caseLabel ?? ""}` : ""}
          open={open === e.id}
          canWrite={canWrite}
          onToggle={() => setOpen(open === e.id ? null : e.id)}
          onChange={list.reload}
        />
      ))}
    </Screen>
  );
}

function EntryCard({ e, kind, matter, open, canWrite, onToggle, onChange }: { e: EntryRowApi; kind: RegisterKind; matter: string; open: boolean; canWrite: boolean; onToggle: () => void; onChange: () => void }) {
  const p = usePalette();
  const def = getRegister(kind);
  const [values, setValues] = useState<FormValues>({ ...e.data, ...Object.fromEntries(def.fields.filter((f) => f.type === "date" && e.data[f.key]).map((f) => [f.key, showDate(e.data[f.key])])) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openStatus = def.openStatuses?.includes(e.status ?? "");
  return (
    <Card style={{ gap: 6, borderColor: openStatus ? p.seal : p.line }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={`${e.data[def.titleField]}, ${e.status ?? ""}`} style={{ gap: 2 }}>
        <T v="h3" style={{ fontSize: 16 }}>{e.data[def.titleField]}</T>
        <T v="small" tone="soft">{[matter || null, e.entry_date ? showDate(e.entry_date) : null, e.status, e.amount !== null && kind === "expense" ? `₹${e.amount}` : null].filter(Boolean).join(" · ")}</T>
      </Pressable>
      {open ? (
        canWrite ? (
          <View style={{ gap: space.md }}>
            <ClerkForm defs={def.fields} values={values} onChange={setValues} />
            {error ? <T v="small" tone="seal">{error}</T> : null}
            <Button
              label={busy ? "Saving…" : "Save"}
              variant="dark"
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                setError(null);
                try {
                  await clerk.updateEntry(e.id, values as Record<string, string>);
                  onChange();
                } catch (err) {
                  setError(describeError(err));
                } finally {
                  setBusy(false);
                }
              }}
            />
            <TextButton
              label="Remove this entry"
              onPress={() =>
                Alert.alert("Remove this entry?", "It leaves the register; the case history keeps a record.", [
                  { text: "Keep", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: async () => { try { await clerk.deleteEntry(e.id); onChange(); } catch (err) { setError(describeError(err)); } } },
                ])
              }
            />
          </View>
        ) : (
          def.fields.filter((f) => e.data[f.key]).map((f) => <T key={f.key} v="small"><T v="small" tone="faint">{f.label}: </T>{f.type === "date" ? showDate(e.data[f.key]) : e.data[f.key]}</T>)
        )
      ) : null}
    </Card>
  );
}

function EntryForm({ office, kind, matter, onDone, onCancel }: { office: string; kind: RegisterKind; matter?: string; onDone: () => void; onCancel: () => void }) {
  const def = getRegister(kind);
  const [values, setValues] = useState<FormValues>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missing = missingIn(def.fields, values);
  return (
    <Card style={{ gap: space.md }}>
      <T v="h3">New {def.noun}</T>
      {!matter ? <T v="small" tone="faint">Not tied to a case. To file it under a case, add it from the case sheet.</T> : null}
      <ClerkForm defs={def.fields} values={values} onChange={setValues} />
      {missing.length ? <T v="small" tone="faint">Still needed: {missing.join(", ")}</T> : null}
      {error ? <T v="small" tone="seal">{error}</T> : null}
      <Button
        label={busy ? "Saving…" : "Save"}
        variant="dark"
        disabled={busy || missing.length > 0}
        onPress={async () => {
          setBusy(true);
          setError(null);
          try {
            await clerk.createEntry(office, { kind, matterId: matter, data: values as Record<string, string> });
            onDone();
          } catch (e) {
            setError(describeError(e));
          } finally {
            setBusy(false);
          }
        }}
      />
      <TextButton label="Cancel" onPress={onCancel} />
    </Card>
  );
}

