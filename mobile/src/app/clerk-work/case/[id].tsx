import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Field, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk, pickClerkFile, type CaseSheet, type FieldRow } from "@/api/clerk";
import { CASE_FIELDS, DATED_FIELDS, DRAFT_LABEL, can, serialLabel, type FieldDef, type FieldGroup } from "@/lib/clerkWork";
import { confidenceTag, describeEvent, useLoad, verificationTag, when, workTitle } from "@/features/clerkUi";
import { REGISTERS, TASK_STATUS_LABELS, showDate } from "@/lib/clerkRegisters";

/**
 * The case sheet: everything the office knows about one matter, with the
 * source page and confidence of every particular. Nothing Shisho read is used
 * in a form until someone here confirms or corrects it.
 */
const GROUPS: FieldGroup[] = ["Court", "Case", "Parties", "Client", "Advocate", "Status"];

export default function CaseSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sheet = useLoad(() => clerk.sheet(id!), [id]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (sheet.loading && !sheet.data) return <Screen><ActivityIndicator /></Screen>;
  if (sheet.error || !sheet.data) return <Screen><Notice title="Could not open the case" body={sheet.error ?? ""}><Button label="Try again" variant="ghost" onPress={sheet.reload} /></Notice></Screen>;
  const s = sheet.data;
  const m = s.matter;
  const prepare = can(s.role, "prepare");
  const names = new Map(s.uploads.map((u) => [u.id, u.filename]));

  const upload = async (kind: "case_data" | "blank_form") => {
    setMessage(null);
    const picked = await pickClerkFile(kind);
    if (picked.kind === "cancelled") return;
    if (picked.kind === "error") return setMessage(picked.message);
    setBusy(kind === "case_data" ? "Uploading and reading the papers. A long file can take a minute or two…" : "Uploading the blank form…");
    try {
      const r = await clerk.upload(m.id, kind, picked.file);
      setMessage(r.readError ?? (r.reading ? `Read ${r.reading.fields} particulars${r.reading.documentKind ? ` from the ${r.reading.documentKind.toLowerCase()}` : ""}. Review them below.` : "Blank form saved. Choose it when you generate."));
    } catch (e) {
      setMessage(describeError(e));
    } finally {
      setBusy(null);
      void sheet.reload();
    }
  };

  const pending = s.fields.filter((f) => f.chosen && f.status === "unverified").length;

  return (
    <Screen>
      <Stack.Screen options={{ title: `Case ${serialLabel(m.serial_no)}` }} />
      <T v="label" tone="indigo">Case serial no. {serialLabel(m.serial_no)}{m.file_code ? ` · File ${m.file_code}` : ""}</T>
      <T v="title" style={{ fontSize: 26, lineHeight: 32 }}>{m.cause_title ?? "Papers not read yet"}</T>
      <T tone="soft">{[m.case_label, m.court].filter(Boolean).join(" · ") || "Upload the case papers to fill this in."}</T>
      {s.parent ? <Row title={`Connected to case ${serialLabel(s.parent.serial_no)}`} detail={s.parent.case_label ?? undefined} href={`/clerk-work/case/${s.parent.id}`} /> : null}

      {prepare ? (
        <View style={{ gap: space.sm }}>
          <Button label="Generate a clerk form" onPress={() => router.push({ pathname: "/clerk-work/generate", params: { matter: m.id } })} />
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}><Button label="Upload case papers" variant="ghost" disabled={Boolean(busy)} onPress={() => upload("case_data")} /></View>
            <View style={{ flex: 1 }}><Button label="Upload blank form" variant="ghost" disabled={Boolean(busy)} onPress={() => upload("blank_form")} /></View>
          </View>
        </View>
      ) : null}
      {busy ? <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}><ActivityIndicator /><T v="small" tone="soft" style={{ flex: 1 }}>{busy}</T></View> : null}
      {message ? <T v="small" tone="soft">{message}</T> : null}

      <Uploads sheet={s} prepare={prepare} onChange={sheet.reload} />

      <SectionRule />
      <T v="h2">Case particulars</T>
      <T v="small" tone="soft">
        {s.conflicts.length ? `${s.conflicts.length} with conflicting readings to choose between. ` : ""}
        {pending ? `${pending} read but not yet confirmed. ` : ""}
        Status fields describe the case as of the document they came from, not as verified today.
      </T>
      {GROUPS.map((g) => (
        <View key={g} style={{ gap: space.sm }}>
          <T v="label" tone="indigo" style={{ marginTop: space.md }}>{g}</T>
          {CASE_FIELDS.filter((f) => f.group === g).map((f) => (
            <FieldCard key={f.key} def={f} rows={s.fields.filter((r) => r.key === f.key)} conflict={s.conflicts.includes(f.key)} names={names} matter={m.id} prepare={prepare} onChange={sheet.reload} />
          ))}
        </View>
      ))}

      <SectionRule />
      <T v="h2">Generated documents</T>
      {s.documents.length === 0 ? <T v="small" tone="soft">None yet.</T> : null}
      {s.documents.map((d) => (
        <Row
          key={d.id}
          title={`${workTitle(d.work_no)} · v${d.version}`}
          detail={`${d.status === "draft" ? DRAFT_LABEL : "Ready for Execution"} · ${when(d.created_at)} by ${d.created_by ? (s.people[d.created_by] ?? "a member") : "a former member"}${d.approved_at ? ` · approved by ${s.people[d.approved_by ?? ""] ?? "an advocate"}` : ""}`}
          href={`/clerk-work/document/${d.id}`}
        />
      ))}

      {s.connected.length ? (
        <>
          <SectionRule />
          <T v="h2">Connected proceedings</T>
          {s.connected.map((c) => <Row key={c.id} title={`${serialLabel(c.serial_no)} · ${c.case_label ?? "Not yet numbered"}`} detail={c.cause_title ?? undefined} href={`/clerk-work/case/${c.id}`} />)}
        </>
      ) : null}

      <SectionRule />
      <Hearings sheet={s} prepare={prepare} onChange={sheet.reload} />

      <SectionRule />
      <T v="h2">Work on this case</T>
      {s.tasks.length === 0 ? <T v="small" tone="soft">No open tasks.</T> : null}
      {s.tasks.map((t) => (
        <Row key={t.id} title={`${t.work_no ? `[${t.work_no}] ` : ""}${t.title}`} detail={[TASK_STATUS_LABELS[t.status], t.due_on ? `due ${showDate(t.due_on)}` : null, t.assigned_to ? (s.people[t.assigned_to] ?? "") : "Unassigned"].filter(Boolean).join(" · ")} href={`/clerk-work/task/${t.id}`} />
      ))}
      <Row title="All tasks for this case" detail={prepare ? "Add, assign and move work along" : undefined} onPress={() => router.push({ pathname: "/clerk-work/tasks", params: { office: m.office_id ?? "", matter: m.id } })} />

      <SectionRule />
      <T v="h2">Registers for this case</T>
      {REGISTERS.map((r) => (
        <Row key={r.kind} title={r.title} detail={`${s.entryCounts[r.kind] ?? 0} ${(s.entryCounts[r.kind] ?? 0) === 1 ? "entry" : "entries"}`} onPress={() => router.push({ pathname: "/clerk-work/register/[kind]", params: { kind: r.kind, office: m.office_id ?? "", matter: m.id } })} />
      ))}

      {s.role === "office_admin" || s.role === "senior_advocate" ? (
        <>
          <SectionRule />
          <Access matter={m.id} restricted={m.restricted ?? false} onChange={sheet.reload} />
        </>
      ) : null}

      <SectionRule />
      <History sheet={s} />
      {can(s.role, "delete") ? (
        <TextButton
          label="Delete this case"
          onPress={() =>
            Alert.alert("Delete this case?", "It leaves the register and can be restored from Administration until the office's retention period has run.", [
              { text: "Keep", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: async () => { try { await clerk.deleteMatter(m.id); router.back(); } catch (e) { setMessage(describeError(e)); } } },
            ])
          }
        />
      ) : null}
    </Screen>
  );
}

function Hearings({ sheet, prepare, onChange }: { sheet: CaseSheet; prepare: boolean; onChange: () => void }) {
  const p = usePalette();
  const [adding, setAdding] = useState(false);
  const [v, setV] = useState({ hearingOn: "", result: "", source: "clerk_report" as "clerk_report" | "court_order", nextOn: "", nextPurpose: "", directions: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await clerk.recordHearing(sheet.matter.id, { ...v, nextOn: v.nextOn || undefined, nextPurpose: v.nextPurpose || undefined, directions: v.directions || undefined });
      setAdding(false);
      setV({ hearingOn: "", result: "", source: "clerk_report", nextOn: "", nextPurpose: "", directions: "" });
      onChange();
    } catch (e) {
      setErr(describeError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: space.sm }}>
      <T v="h2">Hearings</T>
      {sheet.hearings.length === 0 ? <T v="small" tone="soft">None recorded.</T> : null}
      {sheet.hearings.map((h) => (
        <Card key={h.id} style={{ gap: 4, borderColor: h.source === "clerk_report" && !h.confirmed_at ? p.seal : p.line }}>
          <T v="h3" style={{ fontSize: 16 }}>{showDate(h.hearing_on)}</T>
          <T v="small">{h.result}</T>
          {h.next_on ? <T v="small" tone="soft">Next: {showDate(h.next_on)}{h.next_purpose ? ` for ${h.next_purpose}` : ""}</T> : null}
          {h.directions ? <T v="small" tone="soft">Directions: {h.directions}</T> : null}
          <T v="small" tone={h.source === "clerk_report" && !h.confirmed_at ? "seal" : "faint"}>
            {h.source === "court_order" ? "From the court's order" : h.confirmed_at ? `Clerk's report, confirmed ${when(h.confirmed_at)}` : "Clerk's report: not yet confirmed against the order"}
          </T>
          {prepare && h.source === "clerk_report" && !h.confirmed_at ? (
            <TextButton
              label="Confirmed against the order"
              onPress={async () => {
                try {
                  await clerk.confirmHearing(h.id);
                  onChange();
                } catch (e) {
                  setErr(describeError(e));
                }
              }}
            />
          ) : null}
        </Card>
      ))}
      {prepare ? (
        adding ? (
          <Card style={{ gap: space.md }}>
            <Field label="Hearing date" value={v.hearingOn} onChangeText={(x) => setV({ ...v, hearingOn: x })} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
            <Field label="What happened" value={v.result} onChangeText={(x) => setV({ ...v, result: x })} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <Chip label="Clerk's report" selected={v.source === "clerk_report"} onPress={() => setV({ ...v, source: "clerk_report" })} />
              <Chip label="Court's order" selected={v.source === "court_order"} onPress={() => setV({ ...v, source: "court_order" })} />
            </View>
            <T v="small" tone="faint">{v.source === "court_order" ? "The next date and directions go onto the case sheet now." : "Kept as unconfirmed until checked against the court's order."}</T>
            <Field label="Next date (optional)" value={v.nextOn} onChangeText={(x) => setV({ ...v, nextOn: x })} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
            <Field label="Next purpose (optional)" value={v.nextPurpose} onChangeText={(x) => setV({ ...v, nextPurpose: x })} />
            <Field label="Directions (optional)" value={v.directions} onChangeText={(x) => setV({ ...v, directions: x })} multiline />
            <Button label={busy ? "Saving…" : "Save the hearing"} variant="dark" disabled={busy || !v.hearingOn || !v.result.trim()} onPress={save} />
            <TextButton label="Cancel" onPress={() => setAdding(false)} />
          </Card>
        ) : (
          <Button label="Record a hearing" variant="ghost" onPress={() => setAdding(true)} />
        )
      ) : null}
      {err ? <T v="small" tone="seal">{err}</T> : null}
    </View>
  );
}

function Access({ matter, restricted, onChange }: { matter: string; restricted: boolean; onChange: () => void }) {
  const a = useLoad(() => clerk.access(matter), [matter, restricted]);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const run = async (b: Parameters<typeof clerk.setAccess>[1]) => {
    setErr(null);
    try {
      await clerk.setAccess(matter, b);
      setEmail("");
      await a.reload();
      onChange();
    } catch (e) {
      setErr(describeError(e));
    }
  };
  return (
    <View style={{ gap: space.sm }}>
      <T v="h2">Who can see this case</T>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        <Chip label="Everyone in the office" selected={!restricted} onPress={restricted ? () => run({ restricted: false }) : undefined} />
        <Chip label="Only listed members" selected={restricted} onPress={!restricted ? () => run({ restricted: true }) : undefined} />
      </View>
      {restricted ? (
        <>
          <T v="small" tone="soft">The administrator and senior advocates always see it. Add anyone else who works on it:</T>
          {(a.data?.members ?? []).map((x) => (
            <View key={x.userId} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              <T v="small" style={{ flex: 1 }}>{x.email}</T>
              <TextButton label="Remove" onPress={() => run({ remove: x.userId })} />
            </View>
          ))}
          <Field label="Member's account email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Button label="Add" variant="ghost" disabled={!email.includes("@")} onPress={() => run({ add: email.trim() })} />
        </>
      ) : null}
      {err ? <T v="small" tone="seal">{err}</T> : null}
    </View>
  );
}

function Uploads({ sheet, prepare, onChange }: { sheet: CaseSheet; prepare: boolean; onChange: () => void }) {
  const [retrying, setRetrying] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!sheet.uploads.length) return null;
  return (
    <View style={{ gap: space.sm }}>
      <T v="label" tone="indigo">Files on this case</T>
      {sheet.uploads.map((u) => (
        <View key={u.id} style={{ gap: 2 }}>
          <T v="small">{u.kind === "blank_form" ? "Blank form" : "Case papers"}: {u.filename}{u.pages ? ` · ${u.pages} page${u.pages === 1 ? "" : "s"}` : ""}</T>
          <T v="small" tone={u.status === "failed" ? "seal" : "faint"}>
            {u.kind === "blank_form" ? "Stored unchanged" : u.status === "extracted" ? "Read" : u.status === "processing" ? "Being read…" : u.status === "failed" ? (u.error ?? "Could not be read") : "Stored, not read yet"}
          </T>
          {prepare && u.kind === "case_data" && (u.status === "failed" || u.status === "stored") ? (
            <TextButton
              label={retrying === u.id ? "Reading…" : "Read it again"}
              onPress={async () => {
                setRetrying(u.id);
                setErr(null);
                try {
                  await clerk.retry(u.id);
                } catch (e) {
                  setErr(describeError(e));
                } finally {
                  setRetrying(null);
                  onChange();
                }
              }}
            />
          ) : null}
        </View>
      ))}
      {err ? <T v="small" tone="seal">{err}</T> : null}
    </View>
  );
}

function FieldCard({ def, rows, conflict, names, matter, prepare, onChange }: { def: FieldDef; rows: FieldRow[]; conflict: boolean; names: Map<string, string>; matter: string; prepare: boolean; onChange: () => void }) {
  const p = usePalette();
  const chosen = rows.find((r) => r.chosen);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chosen?.value ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const others = rows.filter((r) => !r.chosen && r.upload_id);
  const warn = conflict || (chosen && chosen.status === "unverified" && chosen.confidence !== "high");

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      setEditing(false);
      onChange();
    } catch (e) {
      setErr(describeError(e));
    } finally {
      setBusy(false);
    }
  };
  const source = (r: FieldRow) => (r.upload_id ? `${names.get(r.upload_id) ?? "Uploaded file"}${r.page ? `, page ${r.page}` : ""}` : "Entered by hand");

  return (
    <Card style={{ gap: 6, borderColor: warn ? p.seal : p.line, borderWidth: warn ? 1.5 : 1 }}>
      <T v="label" tone="faint">{def.label}</T>
      {conflict ? (
        <>
          <T v="small" tone="seal">The documents disagree. Choose the right value.</T>
          {rows.filter((r) => r.upload_id).map((r) => (
            <View key={r.id} style={{ gap: 4, borderTopWidth: 1, borderTopColor: p.line, paddingTop: 6 }}>
              <T>{r.value}</T>
              <T v="small" tone="soft">{source(r)}{r.as_of ? ` · as of ${r.as_of}` : ""}</T>
              {confidenceTag(r.confidence)}
              {prepare ? <TextButton label="Use this one" onPress={() => act(() => clerk.confirm(matter, r.id))} /> : null}
            </View>
          ))}
        </>
      ) : chosen ? (
        <>
          <T>{chosen.value || "Not available (left blank)"}</T>
          <T v="small" tone="soft">{source(chosen)}{chosen.as_of && DATED_FIELDS.includes(def.key) ? ` · as of ${chosen.as_of}` : ""}</T>
          {chosen.quote ? <T v="small" tone="faint">&ldquo;{chosen.quote}&rdquo;</T> : null}
          <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
            {chosen.upload_id ? confidenceTag(chosen.confidence) : null}
            {verificationTag(chosen.status)}
          </View>
          {others.length ? <T v="small" tone="faint">Also read: {others.map((o) => `${o.value} (${source(o)})`).join("; ")}</T> : null}
        </>
      ) : (
        <T v="small" tone="faint">Not found in the papers.</T>
      )}

      {prepare && editing ? (
        <View style={{ gap: space.sm }}>
          <Field label={`Correct ${def.label.toLowerCase()}`} value={value} onChangeText={setValue} multiline={def.long} placeholder={def.hint} style={def.long ? { minHeight: 90, textAlignVertical: "top" } : undefined} />
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}><Button label={busy ? "Saving…" : "Save"} variant="dark" disabled={busy} onPress={() => act(() => clerk.correct(matter, def.key, value))} /></View>
            <View style={{ flex: 1 }}><Button label="Cancel" variant="ghost" onPress={() => setEditing(false)} /></View>
          </View>
          <T v="small" tone="faint">Save it empty to record that this particular is not available.</T>
        </View>
      ) : prepare && !conflict ? (
        <View style={{ flexDirection: "row", gap: space.lg }}>
          {chosen && chosen.status === "unverified" ? <TextButton label={busy ? "Confirming…" : "Confirm"} onPress={() => act(() => clerk.confirm(matter, chosen.id))} /> : null}
          <TextButton label={chosen ? "Correct" : "Add"} onPress={() => { setValue(chosen?.value ?? ""); setEditing(true); }} />
        </View>
      ) : null}
      {err ? <T v="small" tone="seal">{err}</T> : null}
    </Card>
  );
}

function History({ sheet }: { sheet: CaseSheet }) {
  const [all, setAll] = useState(false);
  const items = all ? sheet.history : sheet.history.slice(0, 8);
  return (
    <View style={{ gap: space.sm }}>
      <T v="h2">Activity</T>
      {items.map((h, i) => (
        <View key={`${h.at}-${i}`} style={{ gap: 1 }}>
          <T v="small">{describeEvent(h.action, h.detail)}</T>
          <T v="small" tone="faint">{h.actor ? (sheet.people[h.actor] ?? "A member") : "A former member"} · {when(h.at)}</T>
        </View>
      ))}
      {sheet.history.length > 8 && !all ? <TextButton label={`Show all ${sheet.history.length}`} onPress={() => setAll(true)} /> : null}
    </View>
  );
}
