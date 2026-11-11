import { supabase } from "@/lib/supabase";
import type { DayMatter, DayTask, EntryRow, ServiceData } from "@/lib/clerkServices";
import { DONE_STATUSES, REGISTERS, addDays, indiaToday, isTaskStatus, type TaskSlot, type TaskStatus } from "@/lib/clerkRegisters";
import type { Role } from "@/lib/clerkWork";
import { hiddenMatterIds } from "@/lib/clerkStore";

/**
 * Server-only. The office's day for the Daily Clerk Dashboard and the daily
 * sheets: matters listed, tasks, register work outstanding and hearing
 * results awaiting confirmation. Restricted matters a member may not open are
 * left out of everything here.
 */

/** The next working day after `iso` (Sunday skipped; court holidays are not known here). */
export function nextWorkingDay(iso: string): string {
  let d = addDays(iso, 1);
  if (new Date(`${d}T00:00:00Z`).getUTCDay() === 0) d = addDays(d, 1);
  return d;
}

type MatterLite = { id: string; serial_no: number; file_code: string | null; court: string | null; case_label: string | null; cause_title: string | null; client: string | null; advocate: string | null; next_hearing_on: string | null };

async function namesFor(ids: (string | null)[]): Promise<Record<string, string>> {
  const list = [...new Set(ids.filter(Boolean) as string[])];
  if (!list.length) return {};
  const { data } = await supabase().from("profiles").select("id, email").in("id", list);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.email]));
}

async function chosen(matterIds: string[], keys: string[]): Promise<Record<string, Record<string, string>>> {
  if (!matterIds.length) return {};
  const { data } = await supabase().from("clerk_fields").select("matter_id, key, value").in("matter_id", matterIds).in("key", keys).eq("chosen", true);
  const out: Record<string, Record<string, string>> = {};
  for (const r of data ?? []) (out[r.matter_id] ??= {})[r.key] = r.value;
  return out;
}

async function mattersOn(officeId: string, date: string, hidden: string[]): Promise<{ list: DayMatter[]; raw: MatterLite[] }> {
  let q = supabase().from("clerk_matters").select("id, serial_no, file_code, court, case_label, cause_title, client, advocate, next_hearing_on").eq("office_id", officeId).eq("next_hearing_on", date).is("deleted_at", null).order("serial_no");
  if (hidden.length) q = q.not("id", "in", `(${hidden.join(",")})`);
  const { data } = await q;
  const raw = (data ?? []) as MatterLite[];
  const f = await chosen(raw.map((m) => m.id), ["client_capacity", "stage", "next_hearing_purpose"]);
  return {
    raw,
    list: raw.map((m) => ({
      serial: m.serial_no,
      fileCode: m.file_code ?? "",
      court: m.court ?? "",
      caseLabel: m.case_label ?? "Not yet numbered",
      causeTitle: m.cause_title ?? "",
      client: m.client ?? "",
      capacity: f[m.id]?.client_capacity ?? "",
      advocate: m.advocate ?? "",
      purpose: f[m.id]?.next_hearing_purpose ?? "",
      stage: f[m.id]?.stage ?? "",
      source: "Case record",
    })),
  };
}

type TaskRow = { id: string; matter_id: string | null; work_no: number | null; title: string; status: string; slot: string | null; due_on: string | null; assigned_to: string | null; updated_at: string; created_at: string };

async function tasksFor(officeId: string, hidden: string[], opts: { includeDoneOn?: string } = {}): Promise<{ rows: TaskRow[]; serials: Record<string, { serial: number; label: string }>; names: Record<string, string> }> {
  const { data } = await supabase().from("clerk_tasks").select("id, matter_id, work_no, title, status, slot, due_on, assigned_to, updated_at, created_at").eq("office_id", officeId).is("deleted_at", null).order("due_on", { ascending: true, nullsFirst: false }).limit(1000);
  const rows = ((data ?? []) as TaskRow[]).filter((t) => !t.matter_id || !hidden.includes(t.matter_id)).filter((t) => !DONE_STATUSES.includes(t.status as TaskStatus) || (opts.includeDoneOn && t.updated_at.slice(0, 10) >= addDays(opts.includeDoneOn, -1)));
  const mids = [...new Set(rows.map((t) => t.matter_id).filter(Boolean) as string[])];
  const { data: ms } = mids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", mids) : { data: [] };
  return {
    rows,
    serials: Object.fromEntries((ms ?? []).map((m) => [m.id, { serial: m.serial_no, label: m.case_label ?? "" }])),
    names: await namesFor(rows.map((t) => t.assigned_to)),
  };
}

const toDayTask = (t: TaskRow, serials: Record<string, { serial: number; label: string }>, names: Record<string, string>): DayTask => ({
  serial: t.matter_id ? (serials[t.matter_id]?.serial ?? null) : null,
  caseLabel: t.matter_id ? (serials[t.matter_id]?.label ?? "") : "",
  title: t.title,
  status: (isTaskStatus(t.status) ? t.status : "not_started") as TaskStatus,
  slot: (t.slot as TaskSlot | null) ?? null,
  due: t.due_on,
  assignee: t.assigned_to ? (names[t.assigned_to] ?? "") : "",
  workNo: t.work_no,
  updatedOn: new Date(new Date(t.updated_at).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10),
});

async function entriesFor(officeId: string, filter: { matterId?: string; date?: string }, hidden: string[]): Promise<EntryRow[]> {
  let q = supabase().from("clerk_entries").select("kind, data, entry_date, status, amount, matter_id").eq("office_id", officeId).is("deleted_at", null).order("entry_date", { ascending: true }).limit(2000);
  if (filter.matterId) q = q.eq("matter_id", filter.matterId);
  if (filter.date) q = q.eq("entry_date", filter.date);
  const { data } = await q;
  const rows = (data ?? []).filter((e) => !e.matter_id || !hidden.includes(e.matter_id));
  const mids = [...new Set(rows.map((e) => e.matter_id).filter(Boolean) as string[])];
  const { data: ms } = mids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", mids) : { data: [] };
  const by = Object.fromEntries((ms ?? []).map((m) => [m.id, m]));
  return rows.map((e) => ({ kind: e.kind, data: e.data as Record<string, string>, entry_date: e.entry_date, status: e.status, amount: e.amount === null ? null : Number(e.amount), serial: e.matter_id ? (by[e.matter_id]?.serial_no ?? null) : null, case_label: e.matter_id ? (by[e.matter_id]?.case_label ?? null) : null }));
}

/** What a typed service reads: the matter's registers, or the office's day. */
export async function serviceData(o: { officeId: string; matterId: string | null; date: string | null; userId: string; role: Role; kind: "matter" | "day" | undefined }): Promise<ServiceData> {
  const hidden = await hiddenMatterIds(o.userId, o.role, o.officeId);
  const entries = o.matterId ? await entriesFor(o.officeId, { matterId: o.matterId }, hidden) : [];
  if (o.kind !== "day") return { entries };
  const date = o.date ?? indiaToday();
  const { list } = await mattersOn(o.officeId, date, hidden);
  const t = await tasksFor(o.officeId, hidden, { includeDoneOn: date });
  const dayEntries = await entriesFor(o.officeId, { date }, hidden);
  const { data: hs } = await supabase().from("clerk_hearings").select("matter_id, hearing_on, result, source, next_on, next_purpose").eq("office_id", o.officeId).eq("hearing_on", date).is("deleted_at", null);
  const hmids = [...new Set((hs ?? []).map((h) => h.matter_id).filter((id) => !hidden.includes(id)))];
  const { data: hms } = hmids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label, court").in("id", hmids) : { data: [] };
  const hm = Object.fromEntries((hms ?? []).map((m) => [m.id, m]));
  return {
    entries,
    day: {
      date,
      matters: list,
      tasks: t.rows.map((r) => toDayTask(r, t.serials, t.names)),
      entries: dayEntries,
      hearingsEntered: (hs ?? []).filter((h) => hm[h.matter_id]).map((h) => ({ serial: hm[h.matter_id].serial_no, fileCode: "", court: hm[h.matter_id].court ?? "", caseLabel: hm[h.matter_id].case_label ?? "", causeTitle: "", client: "", capacity: "", advocate: "", purpose: h.next_on ? `${h.next_on.split("-").reverse().join("-")}${h.next_purpose ? ` for ${h.next_purpose}` : ""}` : "", stage: h.result, source: h.source })),
    },
  };
}

/* ----------------------------------------------------------- dashboard */

export type Dashboard = {
  date: string;
  tomorrow: string;
  today: DayMatter[];
  tomorrowMatters: DayMatter[];
  tasks: { open: number; overdue: DayTask[]; byStatus: Record<string, number>; byPerson: { name: string; open: number; overdue: number }[]; prepare: DayTask[]; deadlines: DayTask[]; completedToday: number };
  registers: { kind: string; title: string; open: number }[];
  attendance: EntryRow[];
  missingReceipts: EntryRow[];
  unconfirmed: { id: string; serial: number; caseLabel: string; hearingOn: string; result: string; nextOn: string | null }[];
  overlaps: { advocate: string; matters: { serial: number; court: string; caseLabel: string }[] }[];
};

export async function dashboard(officeId: string, userId: string, role: Role, date = indiaToday()): Promise<Dashboard> {
  const hidden = await hiddenMatterIds(userId, role, officeId);
  const tomorrow = nextWorkingDay(date);
  const [today, tom, t] = await Promise.all([mattersOn(officeId, date, hidden), mattersOn(officeId, tomorrow, hidden), tasksFor(officeId, hidden, { includeDoneOn: date })]);
  const tasks = t.rows.map((r) => toDayTask(r, t.serials, t.names));
  const open = tasks.filter((x) => !DONE_STATUSES.includes(x.status));
  const overdue = open.filter((x) => x.due && x.due < date);
  const byStatus: Record<string, number> = {};
  for (const x of open) byStatus[x.status] = (byStatus[x.status] ?? 0) + 1;
  const people = new Map<string, { open: number; overdue: number }>();
  for (const x of open) {
    const k = x.assignee || "Unassigned";
    const p = people.get(k) ?? { open: 0, overdue: 0 };
    p.open += 1;
    if (x.due && x.due < date) p.overdue += 1;
    people.set(k, p);
  }

  const { data: ents } = await supabase().from("clerk_entries").select("kind, status, data, entry_date, amount, matter_id").eq("office_id", officeId).is("deleted_at", null).limit(5000);
  const visible = (ents ?? []).filter((e) => !e.matter_id || !hidden.includes(e.matter_id));
  const registers = REGISTERS.filter((r) => r.statusField).map((r) => ({ kind: r.kind, title: r.title, open: visible.filter((e) => e.kind === r.kind && r.openStatuses?.includes(e.status ?? "")).length }));
  const mids = [...new Set(visible.map((e) => e.matter_id).filter(Boolean) as string[])];
  const { data: ms } = mids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", mids) : { data: [] };
  const by = Object.fromEntries((ms ?? []).map((m) => [m.id, m]));
  const asRow = (e: (typeof visible)[number]): EntryRow => ({ kind: e.kind, data: e.data as Record<string, string>, entry_date: e.entry_date, status: e.status, amount: e.amount === null ? null : Number(e.amount), serial: e.matter_id ? (by[e.matter_id]?.serial_no ?? null) : null, case_label: e.matter_id ? (by[e.matter_id]?.case_label ?? null) : null });

  const { data: hs } = await supabase().from("clerk_hearings").select("id, matter_id, hearing_on, result, next_on").eq("office_id", officeId).eq("source", "clerk_report").is("confirmed_at", null).is("deleted_at", null).order("hearing_on", { ascending: false }).limit(100);
  const hmids = [...new Set((hs ?? []).map((h) => h.matter_id).filter((id) => !hidden.includes(id)))];
  const { data: hms } = hmids.length ? await supabase().from("clerk_matters").select("id, serial_no, case_label").in("id", hmids) : { data: [] };
  const hm = Object.fromEntries((hms ?? []).map((m) => [m.id, m]));

  const overlaps: Dashboard["overlaps"] = [];
  const byAdv = new Map<string, DayMatter[]>();
  for (const m of today.list) if (m.advocate) byAdv.set(m.advocate, [...(byAdv.get(m.advocate) ?? []), m]);
  for (const [advocate, ms2] of byAdv) if (new Set(ms2.map((m) => m.court)).size > 1) overlaps.push({ advocate, matters: ms2.map((m) => ({ serial: m.serial, court: m.court, caseLabel: m.caseLabel })) });

  return {
    date,
    tomorrow,
    today: today.list,
    tomorrowMatters: tom.list,
    tasks: {
      open: open.length,
      overdue,
      byStatus,
      byPerson: [...people].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.open - a.open),
      prepare: open.filter((x) => x.slot === "tomorrow" || x.slot === "before_court"),
      deadlines: open.filter((x) => x.due && x.due >= date && x.due <= addDays(date, 3)),
      completedToday: tasks.filter((x) => DONE_STATUSES.includes(x.status) && x.updatedOn === date).length,
    },
    registers,
    attendance: visible.filter((e) => e.kind === "attendance" && (e.entry_date === date || e.entry_date === tomorrow)).map(asRow),
    missingReceipts: visible.filter((e) => e.kind === "expense" && (e.data as Record<string, string>).receipt !== "Yes" && (e.data as Record<string, string>).nature !== "Cost claimed" && (e.data as Record<string, string>).head !== "Advance received").map(asRow).slice(0, 50),
    unconfirmed: (hs ?? []).filter((h) => hm[h.matter_id]).map((h) => ({ id: h.id, serial: hm[h.matter_id].serial_no, caseLabel: hm[h.matter_id].case_label ?? "", hearingOn: h.hearing_on, result: h.result, nextOn: h.next_on })),
    overlaps,
  };
}
