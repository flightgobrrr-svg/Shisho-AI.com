import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Field, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { PageHeader } from "@/ui/web";
import { fonts, space, usePalette } from "@/ui/theme";
import { mootStore, type MootRule } from "@/state/stores";

const MEMORIAL: [string, string][] = [
  ["Cover page", "Court, case number, parties, and the side you appear for."],
  ["Table of contents", "Every heading below, with page numbers."],
  ["Index of authorities", "Cases, statutes and books relied on, each with its citation."],
  ["Statement of jurisdiction", "The provision under which the court can hear the matter."],
  ["Statement of facts", "Only the facts in the moot problem, in order, without argument."],
  ["Issues raised", "The questions the court must decide, framed in your side's favour."],
  ["Summary of arguments", "One short paragraph per issue: your answer and why."],
  ["Arguments advanced", "Each issue in full: rule, authority, application to the facts."],
  ["Prayer", "Exactly what you ask the court to hold or order."],
];

const ORAL = [
  "Open with your name, your side and what you ask for.",
  "Say how many issues you will take, and in what order.",
  "For each issue: the rule, the authority, then the facts.",
  "Answer the bench's question when it is asked, then return to your point.",
  "Keep the pinpoint page for every case you cite.",
  "Leave a minute for the prayer, and read it out.",
];

function Timer() {
  const [minutes, setMinutes] = useState(10);
  const [left, setLeft] = useState(600);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) setRunning(false);
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Card>
      <T v="label" tone="indigo">Oral round timer</T>
      <T
        accessibilityRole="timer"
        style={{ fontFamily: fonts.display, fontSize: 56, lineHeight: 60 }}
      >
        {mm}:{ss}
      </T>
      <T v="small" tone="soft">{left === 0 ? "Time. Please conclude." : " "}</T>
      <View style={{ flexDirection: "row", gap: space.md, flexWrap: "wrap" }}>
        {running ? (
          <Button label="Pause" variant="ghost" onPress={() => setRunning(false)} />
        ) : (
          <Button
            label="Start"
            variant="dark"
            disabled={left === 0}
            onPress={() => {
              endRef.current = Date.now() + left * 1000;
              setRunning(true);
            }}
          />
        )}
        <Button label="Reset" variant="ghost" onPress={() => { setRunning(false); setLeft(minutes * 60); }} />
      </View>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap", marginTop: space.sm }}>
        {[5, 10, 15, 20].map((m) => (
          <Chip
            key={m}
            label={`${m} min`}
            selected={minutes === m}
            onPress={() => {
              setMinutes(m);
              if (!running) setLeft(m * 60);
            }}
          />
        ))}
      </View>
    </Card>
  );
}

function Rules() {
  const p = usePalette();
  const { value: rules } = mootStore.use();
  const [text, setText] = useState("");
  const save = (next: MootRule[]) => mootStore.set(next);

  return (
    <View style={{ gap: space.md }}>
      <Field
        label="A rule from your moot"
        value={text}
        onChangeText={setText}
        placeholder="e.g. Memorial not more than 30 pages"
        returnKeyType="done"
        onSubmitEditing={() => {
          const t = text.trim();
          if (!t) return;
          save([...rules, { id: String(Date.now()), text: t, done: false }]);
          setText("");
        }}
      />
      <Button
        label="Add rule"
        variant="ghost"
        disabled={!text.trim()}
        onPress={() => {
          save([...rules, { id: String(Date.now()), text: text.trim(), done: false }]);
          setText("");
        }}
      />
      {rules.length === 0 ? (
        <T v="small" tone="soft">Nothing yet. Copy the formal requirements from your moot rules.</T>
      ) : (
        rules.map((r) => (
          <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, borderBottomWidth: 1, borderBottomColor: p.line, minHeight: 48 }}>
            <Chip label={r.done ? "Done" : "To do"} selected={r.done} onPress={() => save(rules.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)))} />
            <T style={{ flex: 1, textDecorationLine: r.done ? "line-through" : "none" }} tone={r.done ? "soft" : "ink"}>{r.text}</T>
            <T v="small" tone="faint" accessibilityRole="button" accessibilityLabel={`Remove: ${r.text}`} onPress={() => save(rules.filter((x) => x.id !== r.id))}>
              Remove
            </T>
          </View>
        ))
      )}
      <T v="small" tone="faint">Saved on this phone only.</T>
    </View>
  );
}

export default function Moot() {
  return (
    <Screen>
      <FadedPhoto source={require("../../assets/moot.jpg")} height={190} />
      <PageHeader
        eyebrow="For law students"
        headline="Moot *kit*."
        intro="The usual parts of a memorial, a short checklist for the oral round, and a timer. Your moot rules come first: check them for the required order and page limits."
      />

      <T v="label" tone="indigo">The memorial</T>
      {MEMORIAL.map(([name, note], i) => (
        <View key={name} style={{ flexDirection: "row", gap: space.md }}>
          <T v="mono" tone="faint">{String(i + 1).padStart(2, "0")}</T>
          <View style={{ flex: 1 }}>
            <T v="h3">{name}</T>
            <T v="small" tone="soft">{note}</T>
          </View>
        </View>
      ))}

      <T v="label" tone="indigo" style={{ marginTop: 8 }}>The oral round</T>
      {ORAL.map((line) => (
        <T key={line} v="small" tone="soft">• {line}</T>
      ))}

      <Timer />

      <T v="label" tone="indigo" style={{ marginTop: 8 }}>Your moot's own rules</T>
      <Rules />
    </Screen>
  );
}
