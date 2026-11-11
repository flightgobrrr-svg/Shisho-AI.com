import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Field, Headline, Notice, Row, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { apiConfigured, describeError } from "@/api/client";
import { clerk, type Dashboard, type DayTask, type Office } from "@/api/clerk";
import { useSession } from "@/state/auth";
import { ROLE_LABELS, can, serialLabel } from "@/lib/clerkWork";
import { TASK_STATUS_LABELS, showDate } from "@/lib/clerkRegisters";
import { selectedOffice, useLoad } from "@/features/clerkUi";

/**
 * Advocate Clerk Work: the Daily Clerk Dashboard. Today's and tomorrow's
 * matters, work outstanding and what needs confirming, then the way into every
 * part of the module. Records live on the server, shared by the office; this
 * phone only remembers which office you last opened.
 */
export default function ClerkWork() {
  const { session } = useSession();
  if (!apiConfigured) return <Screen><Notice title="Not connected" body="Clerk Work needs Shisho's online service." /></Screen>;
  if (!session) {
    return (
      <Screen>
        <T v="label" tone="indigo">Advocate Clerk Work</T>
        <Headline text="The office's cases, forms and *dockets*." />
        <T tone="soft">Upload the case papers, pick one of 63 clerk services, review what Shisho read, and get the paper prepared as Word and PDF, saved under the case. Daily dashboard, registers and tasks for the whole office.</T>
        <Button label="Sign in to start" href="/account" />
      </Screen>
    );
  }
  return <Home />;
}

const longDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const caseRef = (serial: number | null, label: string) => (serial ? `${serialLabel(serial)} · ${label || "Not yet numbered"}` : "Office");

function Home() {
  const offices = useLoad(() => clerk.offices().then((r) => r.offices), []);
  const { value: chosenId } = selectedOffice.use();
  const list = offices.data ?? [];
  const office: Office | undefined = list.find((o) => o.id === chosenId) ?? list[0];

  if (offices.loading && !offices.data) return <Screen><ActivityIndicator /></Screen>;
  if (offices.error) return <Screen><Notice title="Could not load your offices" body={offices.error}><Button label="Try again" variant="ghost" onPress={offices.reload} /></Notice></Screen>;
  if (!office) return <CreateOffice onDone={(o) => { selectedOffice.set(o.id); void offices.reload(); }} />;

  return (
    <Screen>
      <T v="label" tone="indigo">Advocate Clerk Work</T>
      <T v="title" style={{ fontSize: 30, lineHeight: 36 }}>{office.name}</T>
      <T v="small" tone="soft">{ROLE_LABELS[office.role]}{office.district ? ` · ${office.district}` : ""}{office.state ? `, ${office.state}` : ""}</T>
      {list.length > 1 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          {list.map((o) => <Chip key={o.id} label={o.name} selected={o.id === office.id} onPress={() => selectedOffice.set(o.id)} />)}
        </View>
      ) : null}
      {can(office.role, "prepare") ? <Button label="Quick Generate a clerk form" onPress={() => router.push({ pathname: "/clerk-work/generate", params: { office: office.id } })} /> : null}
      <Today office={office} />
      <Sections office={office} />
    </Screen>
  );
}

function Today({ office }: { office: Office }) {
  const p = usePalette();
  const d = useLoad(() => clerk.dashboard(office.id).then((r) => r.dashboard), [office.id]);
  if (d.loading && !d.data) return <ActivityIndicator />;
  if (d.error || !d.data) return <T v="small" tone="seal">{d.error}</T>;
  const x: Dashboard = d.data;
  const task = (t: DayTask) => `${caseRef(t.serial, t.caseLabel)} · ${TASK_STATUS_LABELS[t.status]}${t.due ? ` · due ${showDate(t.due)}` : ""}${t.assignee ? ` · ${t.assignee}` : ""}`;
  const stat = (n: number, label: string, warn = false) => (
    <View style={{ flex: 1, minWidth: 90, borderWidth: 1, borderColor: warn && n ? p.seal : p.line, padding: space.md, gap: 2 }}>
      <T v="title" style={{ fontSize: 28, lineHeight: 32, color: warn && n ? p.seal : p.ink }}>{n}</T>
      <T v="small" tone="soft">{label}</T>
    </View>
  );
  return (
    <View style={{ gap: space.md }}>
      <SectionRule />
      <T v="label" tone="indigo">{longDate(x.date)}</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {stat(x.today.length, "matters today")}
        {stat(x.tomorrowMatters.length, `on ${showDate(x.tomorrow)}`)}
        {stat(x.tasks.open, "open tasks")}
        {stat(x.tasks.overdue.length, "overdue", true)}
        {stat(x.unconfirmed.length, "results to confirm", true)}
      </View>

      <Group title="Today's court matters" empty="No matters listed for today in the case records.">
        {x.today.map((m) => <Row key={`t${m.serial}`} title={`${serialLabel(m.serial)} · ${m.caseLabel}`} detail={[m.court, m.purpose || m.stage, m.advocate].filter(Boolean).join(" · ")} onPress={() => openSerial(office.id, m.serial)} />)}
      </Group>
      <Group title={`Tomorrow (${showDate(x.tomorrow)})`} empty="Nothing listed yet.">
        {x.tomorrowMatters.map((m) => <Row key={`n${m.serial}`} title={`${serialLabel(m.serial)} · ${m.caseLabel}`} detail={[m.court, m.purpose || m.stage, m.advocate].filter(Boolean).join(" · ")} onPress={() => openSerial(office.id, m.serial)} />)}
      </Group>
      {x.unconfirmed.length ? (
        <Group title="Hearing results to confirm" note="These are clerks' reports. Confirm each against the court's order before relying on it.">
          {x.unconfirmed.map((h) => <Row key={h.id} title={`${serialLabel(h.serial)} · ${h.caseLabel}`} detail={`${showDate(h.hearingOn)}: ${h.result}${h.nextOn ? ` · next ${showDate(h.nextOn)}` : ""}`} onPress={() => openSerial(office.id, h.serial)} />)}
        </Group>
      ) : null}
      {x.tasks.overdue.length ? (
        <Group title="Overdue">
          {x.tasks.overdue.map((t, i) => <Row key={`o${i}`} title={t.title} detail={task(t)} onPress={() => router.push({ pathname: "/clerk-work/tasks", params: { office: office.id } })} />)}
        </Group>
      ) : null}
      {x.tasks.deadlines.length ? (
        <Group title="Due in the next three days" note="Deadlines and limitation dates are for the advocate to verify.">
          {x.tasks.deadlines.map((t, i) => <Row key={`d${i}`} title={t.title} detail={task(t)} onPress={() => router.push({ pathname: "/clerk-work/tasks", params: { office: office.id } })} />)}
        </Group>
      ) : null}
      {x.tasks.prepare.length ? (
        <Group title="Files to prepare">
          {x.tasks.prepare.map((t, i) => <Row key={`p${i}`} title={t.title} detail={task(t)} onPress={() => router.push({ pathname: "/clerk-work/tasks", params: { office: office.id } })} />)}
        </Group>
      ) : null}
      {x.overlaps.length ? (
        <Group title="Overlapping matters" note="The same advocate is listed in more than one court today.">
          {x.overlaps.map((o) => <T key={o.advocate} v="small">{o.advocate}: {o.matters.map((m) => `${serialLabel(m.serial)} (${m.court})`).join(", ")}</T>)}
        </Group>
      ) : null}
      {x.registers.some((r) => r.open) ? (
        <Group title="Register work outstanding">
          {x.registers.filter((r) => r.open).map((r) => <Row key={r.kind} title={r.title} detail={`${r.open} open`} onPress={() => router.push({ pathname: "/clerk-work/register/[kind]", params: { kind: r.kind, office: office.id } })} />)}
        </Group>
      ) : null}
      {x.attendance.length ? (
        <Group title="Clients and witnesses to attend">
          {x.attendance.map((a, i) => <T key={i} v="small">{caseRef(a.serial ?? null, a.case_label ?? "")}: {a.data.person} ({a.data.role}) · {showDate(a.entry_date)} · {a.data.status}</T>)}
        </Group>
      ) : null}
      {x.missingReceipts.length ? (
        <Group title="Expenses without a receipt">
          {x.missingReceipts.slice(0, 8).map((e, i) => <T key={i} v="small">{showDate(e.entry_date)} · {e.data.purpose} · ₹{e.amount ?? 0}{e.serial ? ` · ${serialLabel(e.serial)}` : ""}</T>)}
        </Group>
      ) : null}
      {x.tasks.byPerson.length ? (
        <Group title="Work by person">
          {x.tasks.byPerson.map((w) => <T key={w.name} v="small">{w.name}: {w.open} open{w.overdue ? `, ${w.overdue} overdue` : ""}</T>)}
          <T v="small" tone="faint">{x.tasks.completedToday} completed today.</T>
        </Group>
      ) : null}
    </View>
  );
}

async function openSerial(office: string, serial: number) {
  try {
    const m = (await clerk.matters(office, String(serial))).matters.find((x) => x.serial_no === serial);
    if (m) router.push(`/clerk-work/case/${m.id}`);
  } catch {
    /* the register is a tap away */
  }
}

function Group({ title, note, empty, children }: { title: string; note?: string; empty?: string; children: React.ReactNode }) {
  const kids = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  if (!kids.length && !empty) return null;
  return (
    <View style={{ gap: space.xs, marginTop: space.sm }}>
      <T v="h3">{title}</T>
      {note ? <T v="small" tone="faint">{note}</T> : null}
      {kids.length ? <View>{children}</View> : <T v="small" tone="soft">{empty}</T>}
    </View>
  );
}

function Sections({ office }: { office: Office }) {
  const go = (pathname: string, extra: Record<string, string> = {}) => () => router.push({ pathname: pathname as never, params: { office: office.id, ...extra } });
  return (
    <View style={{ gap: space.xs, marginTop: space.lg }}>
      <SectionRule />
      <T v="label" tone="indigo">The office</T>
      <Row title="Cases" detail="The case register, serial number-wise" onPress={go("/clerk-work/cases")} />
      <Row title="Tasks" detail="Clerk work with its eleven statuses" onPress={go("/clerk-work/tasks")} />
      <Row title="Daily court work and reports" detail="Cause list, work sheet, closing report, tomorrow's preparation" onPress={go("/clerk-work/daily")} />
      <Row title="Filings and defects" detail="Filing register and scrutiny objections" onPress={go("/clerk-work/register/[kind]", { kind: "filing" })} />
      <Row title="Process and service" detail="Dispatch, delivery, return and endorsement" onPress={go("/clerk-work/register/[kind]", { kind: "service" })} />
      <Row title="Certified copies" detail="Applications, follow-up and collection" onPress={go("/clerk-work/register/[kind]", { kind: "copy" })} />
      <Row title="Documents and originals" detail="Custody, production and return" onPress={go("/clerk-work/register/[kind]", { kind: "custody" })} />
      <Row title="Expenses" detail="Spend, receipts, costs claimed" onPress={go("/clerk-work/register/[kind]", { kind: "expense" })} />
      <Row title="Client and witness attendance" onPress={go("/clerk-work/register/[kind]", { kind: "attendance" })} />
      <Row title="Templates" detail="Saved form mappings and their versions" onPress={go("/clerk-work/templates")} />
      <Row title="Members and roles" detail={can(office.role, "manage_members") ? "Add advocates and clerks" : "Who is in this office"} onPress={go("/clerk-work/members")} />
      {can(office.role, "delete") ? <Row title="Administration" detail="Deleted cases, record keeping" onPress={go("/clerk-work/admin")} /> : null}
      <Row title="The 63 clerk services" detail="What each captures and its safeguard" href="/clerk-work/services" />
      <T v="small" tone="faint" style={{ marginTop: space.md }}>
        Every paper Shisho prepares stays a Draft for Advocate Review until an advocate approves it. Signatures, seals, attestation and court-use spaces are always left blank.
      </T>
    </View>
  );
}

function CreateOffice({ onDone }: { onDone: (o: Office) => void }) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Screen>
      <T v="label" tone="indigo">Advocate Clerk Work</T>
      <Headline text="Set up your *office*." />
      <T tone="soft">One office holds the case register, the papers, the registers and the history for everyone who works on its matters. You become its administrator and can add advocates and clerks next.</T>
      <Field label="Office name" value={name} onChangeText={setName} placeholder="e.g. Chambers of M. Lakshmi" />
      <Field label="District (optional)" value={district} onChangeText={setDistrict} />
      <Field label="State (optional)" value={state} onChangeText={setState} />
      {error ? <T v="small" tone="seal">{error}</T> : null}
      <Button
        label={busy ? "Creating…" : "Create the office"}
        disabled={busy || name.trim().length < 2}
        onPress={async () => {
          setBusy(true);
          setError(null);
          try {
            onDone((await clerk.createOffice({ name: name.trim(), district: district.trim() || undefined, state: state.trim() || undefined })).office);
          } catch (e) {
            setError(describeError(e));
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
