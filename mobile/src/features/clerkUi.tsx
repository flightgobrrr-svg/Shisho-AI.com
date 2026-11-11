import { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { createPersistedStore } from "@/state/persisted";
import { describeError } from "@/api/client";
import { DRAFT_LABEL, fieldLabel, getWork, isFieldKey, type Confidence, type Verification } from "@/lib/clerkWork";
import { TASK_STATUS_LABELS, getRegister, isRegisterKind, isTaskStatus, showDate } from "@/lib/clerkRegisters";

/** Shared pieces for the Advocate Clerk Work screens. */

/** The office last worked in, remembered on this phone (only its id; the records stay on the server). */
export const selectedOffice = createPersistedStore<string | null>("clerk.office", null);

/** Loads on focus, so a screen is fresh when you come back to it. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const run = useCallback(async () => {
    setLoading(true);
    try {
      setData(await load());
      setError(null);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useFocusEffect(
    useCallback(() => {
      void run();
    }, [run]),
  );
  return { data, error, loading, reload: run };
}

export function Tag({ text, tone }: { text: string; tone: "ok" | "warn" | "plain" }) {
  const p = usePalette();
  const color = tone === "ok" ? p.indigo : tone === "warn" ? p.seal : p.inkSoft;
  return (
    <View style={{ borderWidth: 1, borderColor: color, paddingHorizontal: 6, paddingVertical: 1, alignSelf: "flex-start" }}>
      <T v="label" style={{ color, fontSize: 11, letterSpacing: 0.6 }}>{text}</T>
    </View>
  );
}

export const confidenceTag = (c: Confidence | null) =>
  c ? <Tag text={`${c} confidence`} tone={c === "high" ? "ok" : c === "low" ? "warn" : "plain"} /> : null;

export const verificationTag = (s: Verification) =>
  <Tag text={s === "unverified" ? "Unverified" : s === "confirmed" ? "User confirmed" : "Corrected"} tone={s === "unverified" ? "warn" : "ok"} />;

export const documentStatusTag = (s: "draft" | "ready_for_execution") =>
  <Tag text={s === "draft" ? DRAFT_LABEL : "Ready for Execution"} tone={s === "draft" ? "warn" : "ok"} />;

export const workTitle = (no: number) => `${no}. ${getWork(no)?.name ?? "Unknown work"}`;

/** A history entry in plain words. */
export function describeEvent(action: string, d: Record<string, unknown>): string {
  const key = typeof d.key === "string" && isFieldKey(d.key) ? fieldLabel(d.key) : "";
  switch (action) {
    case "matter.created": return "Opened the case";
    case "matter.updated": return "Changed the office file code";
    case "matter.deleted": return "Deleted the case";
    case "upload.stored": return `Uploaded ${d.kind === "blank_form" ? "a blank form" : "case papers"}: ${String(d.filename ?? "")}`;
    case "upload.extracted": return `Read ${String(d.filename ?? "a file")}: ${String(d.fields ?? 0)} particulars`;
    case "field.confirmed": return `Confirmed ${key}`;
    case "field.corrected": return `Corrected ${key}`;
    case "document.generated": return `Generated ${typeof d.work === "number" ? workTitle(d.work) : "a document"}, version ${String(d.version ?? "")}`;
    case "document.approved": return `Approved ${typeof d.work === "number" ? workTitle(d.work) : "a document"}, version ${String(d.version ?? "")}, as ready for execution`;
    case "document.downloaded": return `Downloaded the ${String(d.kind ?? "").toUpperCase()}, version ${String(d.version ?? "")}`;
    case "matter.restricted": return "Limited the case to listed members";
    case "matter.unrestricted": return "Opened the case to everyone in the office";
    case "matter.restored": return "Restored the case";
    case "access.added": return "Gave a member access to the case";
    case "access.removed": return "Removed a member's access to the case";
    case "hearing.recorded": return `Recorded the hearing of ${typeof d.on === "string" ? showDate(d.on) : ""}${d.source === "clerk_report" ? " (clerk's report)" : " (court's order)"}`;
    case "hearing.confirmed": return `Confirmed a hearing result against the order${d.corrected ? ", with corrections" : ""}`;
    case "task.created": return `Added a task: ${String(d.title ?? "")}`;
    case "task.status": return `Moved "${String(d.title ?? "")}" to ${isTaskStatus(d.to) ? TASK_STATUS_LABELS[d.to] : String(d.to ?? "")}`;
    case "task.updated": return `Updated the task "${String(d.title ?? "")}"`;
    case "task.deleted": return `Removed the task "${String(d.title ?? "")}"`;
    case "entry.created": return `Added a row to the ${typeof d.kind === "string" && isRegisterKind(d.kind) ? getRegister(d.kind).title.toLowerCase() : "register"}`;
    case "entry.updated": return `Updated a row in the ${typeof d.kind === "string" && isRegisterKind(d.kind) ? getRegister(d.kind).title.toLowerCase() : "register"}${d.to ? ` (${String(d.to)})` : ""}`;
    case "entry.deleted": return `Removed a row from the ${typeof d.kind === "string" && isRegisterKind(d.kind) ? getRegister(d.kind).title.toLowerCase() : "register"}`;
    default: return action.replace(/[._]/g, " ");
  }
}

export const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function Gap() {
  return <View style={{ height: space.sm }} />;
}
