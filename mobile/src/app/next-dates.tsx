import { useRef, useState } from "react";
import { Linking, View } from "react-native";
import { Button, Card, Field, Notice, Screen, T, TextButton, type InputRef } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { formatDate, parseDate } from "@/ui/dates";
import {
  addNextDate,
  ensurePermission,
  nextDateStore,
  removeNextDate,
  remindersUnavailableReason,
} from "@/state/reminders";

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const fromIso = (s: string) => new Date(`${s}T00:00:00Z`);

/**
 * Next dates for a clerk's office: the case, the date and a note, with a phone
 * notification around 9 am the day before. Everything stays on the phone.
 */
export default function NextDates() {
  const p = usePalette();
  const { value: entries, ready } = nextDateStore.use();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const monthRef = useRef<InputRef>(null);
  const yearRef = useRef<InputRef>(null);

  const date = parseDate(day, month, year);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const past = date ? date.getTime() < todayUtc.getTime() : false;

  // Dates can still be saved where alerts cannot be scheduled; the screen says which.
  const unavailable = remindersUnavailableReason();

  async function add() {
    if (!date || past || !title.trim()) return;
    setBusy(true);
    setMessage(null);
    setDenied(false);
    const permission = unavailable ? "unavailable" : await ensurePermission();
    const entry = await addNextDate({ title: title.trim(), date: isoOf(date), note: note.trim() });
    if (permission === "unavailable") {
      setMessage("Saved. No alert, because alerts cannot be scheduled here.");
    } else if (permission !== "granted") {
      setDenied(true);
      setMessage("Saved, but notifications are off for this app, so there will be no alert.");
    } else if (entry.alertAt === null) {
      setMessage("Saved. It is too late for an alert before that date.");
    } else {
      setMessage(`Saved. You will be reminded around ${new Date(entry.alertAt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}.`);
    }
    setTitle("");
    setNote("");
    setDay("");
    setMonth("");
    setYear("");
    setBusy(false);
  }

  return (
    <Screen>
      <T tone="soft">Put a next date on your phone, with an alert around 9 am the day before. Nothing is sent to Shisho.</T>
      {unavailable ? <Notice title="Alerts are off here" body={`${unavailable} Dates you save are still listed below.`} /> : null}

      <Field label="Case and purpose" value={title} onChangeText={setTitle} placeholder="O.S. 123/2025 — evidence" />
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Field label="Day" keyboardType="number-pad" maxLength={2} value={day} placeholder="DD"
            onChangeText={(t) => { const v = t.replace(/\D/g, ""); setDay(v); if (v.length === 2) monthRef.current?.focus(); }} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Month" inputRef={monthRef} keyboardType="number-pad" maxLength={2} value={month} placeholder="MM"
            onChangeText={(t) => { const v = t.replace(/\D/g, ""); setMonth(v); if (v.length === 2 || (v.length === 1 && Number(v) >= 2)) yearRef.current?.focus(); }} />
        </View>
        <View style={{ flex: 1.4 }}>
          <Field label="Year" inputRef={yearRef} keyboardType="number-pad" maxLength={4} value={year} placeholder="YYYY"
            onChangeText={(t) => setYear(t.replace(/\D/g, ""))} />
        </View>
      </View>
      <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Court, item number, what to bring" />

      {(day || month || year) && !date ? <T v="small" tone="seal">Enter a real date: day, month and a four-digit year.</T> : null}
      {date && past ? <T v="small" tone="seal">That date has already passed.</T> : null}
      <Button label={busy ? "Saving…" : unavailable ? "Save the date" : "Save and remind me"} variant="dark" disabled={busy || !date || past || !title.trim()} onPress={() => void add()} />
      {message ? <T v="small" tone={denied ? "seal" : "soft"} accessibilityLiveRegion="polite">{message}</T> : null}
      {denied ? <TextButton label="Open settings" onPress={() => void Linking.openSettings()} /> : null}

      <T v="label" tone="indigo" style={{ marginTop: 12 }}>Coming up</T>
      {!ready ? <T tone="soft">Loading…</T> : null}
      {ready && entries.length === 0 ? <T tone="soft">No next dates saved.</T> : null}
      {entries.map((e) => {
        const isPast = fromIso(e.date).getTime() < todayUtc.getTime();
        return (
          <Card key={e.id}>
            <T v="label" tone={isPast ? "faint" : "indigo"}>{formatDate(fromIso(e.date))}{isPast ? " · passed" : ""}</T>
            <T v="h3">{e.title}</T>
            {e.note ? <T v="small" tone="soft">{e.note}</T> : null}
            <T v="small" tone="faint">{e.alertAt ? "Alert set for the day before." : "No alert set."}</T>
            <View style={{ borderTopWidth: 1, borderTopColor: p.line, marginTop: space.sm }}>
              <TextButton label="Remove" onPress={() => void removeNextDate(e.id)} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
