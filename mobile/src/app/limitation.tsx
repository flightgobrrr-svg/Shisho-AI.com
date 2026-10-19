import { useRef, useState } from "react";
import { Pressable, Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button, Card, Chip, Disclaimer, Field, Screen, T, type InputRef } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { formatDate, parseDate } from "@/ui/dates";
import { LIMITATION_ENTRIES, VERIFIED_ON, lastDay, periodLabel } from "@/lib/limitation";

const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Suits", ids: ["art-19", "art-54", "art-55", "art-58", "art-65", "art-113"] },
  { title: "Appeals", ids: ["art-116a", "art-116b", "art-117"] },
  { title: "Applications", ids: ["art-122", "art-123", "art-137"] },
  { title: "Procedure", ids: ["o8r1"] },
];

export default function Limitation() {
  const p = usePalette();
  const [entryId, setEntryId] = useState(LIMITATION_ENTRIES[0].id);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [copied, setCopied] = useState(false);
  const monthRef = useRef<InputRef>(null);
  const yearRef = useRef<InputRef>(null);

  const entry = LIMITATION_ENTRIES.find((e) => e.id === entryId)!;
  const start = parseDate(day, month, year);
  const typed = day !== "" || month !== "" || year !== "";
  const end = start ? lastDay(start, entry.period) : null;
  const outer = start && entry.outer ? lastDay(start, entry.outer.period) : null;

  const summary = end
    ? `${entry.article} (${entry.label}): ${periodLabel(entry.period)} from ${formatDate(start!)}. Last day: ${formatDate(end)}.${
        outer ? ` Outer limit: ${formatDate(outer)}.` : ""
      } Checked ${VERIFIED_ON}. General information, not legal advice.`
    : "";

  return (
    <Screen>
      <T v="label" tone="indigo">Limitation Act, 1963</T>
      <T tone="soft">Pick the claim, enter the date the period starts from, and see the last day to file.</T>

      <T v="label" tone="indigo">What is the claim for?</T>
      {GROUPS.map((g) => (
        <View key={g.title} style={{ gap: space.sm }}>
          <T v="small" tone="faint">{g.title}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {g.ids.map((id) => {
              const e = LIMITATION_ENTRIES.find((x) => x.id === id)!;
              return (
                <Chip key={e.id} label={e.label} selected={e.id === entryId} onPress={() => { setEntryId(e.id); setCopied(false); }} />
              );
            })}
          </View>
        </View>
      ))}

      <Card>
        <T v="label" tone="indigo">{entry.article}</T>
        <T v="small">{entry.description}</T>
        <T v="small" tone="soft">Period: {periodLabel(entry.period)}.</T>
        <T v="small" tone="soft">Runs from: {entry.runsFrom}</T>
      </Card>

      <T v="label" tone="indigo">{entry.dateLabel}</T>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Day"
            keyboardType="number-pad"
            maxLength={2}
            value={day}
            returnKeyType="next"
            onChangeText={(t) => {
              const v = t.replace(/\D/g, "");
              setDay(v);
              setCopied(false);
              if (v.length === 2) monthRef.current?.focus();
            }}
            placeholder="DD"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Month"
            inputRef={monthRef}
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            returnKeyType="next"
            onChangeText={(t) => {
              const v = t.replace(/\D/g, "");
              setMonth(v);
              setCopied(false);
              // "1" could still become 10-12, so only a clear month moves on.
              if (v.length === 2 || (v.length === 1 && Number(v) >= 2)) yearRef.current?.focus();
            }}
            placeholder="MM"
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <Field
            label="Year"
            inputRef={yearRef}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            returnKeyType="done"
            onChangeText={(t) => {
              setYear(t.replace(/\D/g, ""));
              setCopied(false);
            }}
            placeholder="YYYY"
          />
        </View>
      </View>

      <View accessibilityLiveRegion="polite" style={{ gap: space.sm }}>
        {end ? (
          <>
            <T v="label" tone="indigo">Last day</T>
            <T v="title" accessibilityLabel={`Last day: ${formatDate(end)}`}>{formatDate(end)}</T>
            <T v="small" tone="soft">
              {periodLabel(entry.period)} from {formatDate(start!)}, with the day the time begins from left out. If the court is closed on that day, section 4 lets you file when it reopens.
            </T>
            {outer ? (
              <View style={{ borderLeftWidth: 1, borderLeftColor: p.lineStrong, paddingLeft: space.md }}>
                <T v="small">Outer limit: {formatDate(outer)}.</T>
                <T v="small" tone="soft">{entry.outer!.note}</T>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", gap: space.md, flexWrap: "wrap" }}>
              <Button
                label={copied ? "Copied" : "Copy result"}
                variant="ghost"
                onPress={async () => {
                  await Clipboard.setStringAsync(summary);
                  setCopied(true);
                }}
              />
              <Button label="Share" variant="ghost" onPress={() => void Share.share({ message: summary })} />
            </View>
          </>
        ) : typed ? (
          <T v="small" tone="seal">Enter a real date: day, month and a four-digit year.</T>
        ) : (
          <T v="small" tone="soft">Enter the date to see the last day.</T>
        )}
      </View>

      <T v="small" tone="faint">
        This is the plain period only. It does not apply the sections that extend or exclude time (for example sections 5, 12, 14 and 18), or any special statute with its own period, such as the rules for commercial suits.
      </T>
      <Pressable accessibilityRole="text">
        <T v="small" tone="faint">
          Source: {entry.source.name}. Checked {VERIFIED_ON}.
        </T>
      </Pressable>
      <Disclaimer />
    </Screen>
  );
}
