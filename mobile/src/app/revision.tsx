import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Notice, Screen, T } from "@/ui/components";
import { PageHeader } from "@/ui/web";
import { space, usePalette } from "@/ui/theme";
import { formatDate } from "@/ui/dates";
import { INTERVAL_DAYS, isDue, isFinished } from "@/lib/revisionCore";
import { markReviewed, removeBrief, revisionStore } from "@/state/stores";
import { RevisionReminderToggle } from "@/features/RevisionReminderToggle";

import { FadedPhoto } from "@/ui/FadedPhoto";
export default function Revision() {
  const p = usePalette();
  const { value: cards, ready } = revisionStore.use();
  const [open, setOpen] = useState<string | null>(null);
  // "Due" is judged against when the screen opened.
  const [now] = useState(() => Date.now());

  if (!ready) return <Screen><T tone="soft">Loading…</T></Screen>;

  if (cards.length === 0) {
    return (
      <Screen>
      <FadedPhoto source={require("../../assets/screens/next-dates.jpg")} height={180} />
      <PageHeader
        eyebrow="For law students"
        headline="Brief it once. *Remember* it."
        intro="Each brief you save returns after a day, a week and a month. The cards live on this phone only; nothing is sent to Shisho."
      />
        <Notice
          title="No briefs saved yet"
          body="Write a brief in case-brief practice and choose “Save for revision”. It comes back here after a day, a week and a month."
        >
          <Button label="Write a brief" variant="dark" href="/case-brief" />
        </Notice>
      </Screen>
    );
  }

  const due = cards.filter((c) => isDue(c, now));
  const waiting = cards.filter((c) => !isFinished(c) && !isDue(c, now));
  const done = cards.filter(isFinished);
  const reviews = cards.reduce((n, c) => n + Math.min(c.stage, INTERVAL_DAYS.length), 0);

  return (
    <Screen>
      <FadedPhoto source={require("../../assets/screens/next-dates.jpg")} height={180} />
      <PageHeader
        eyebrow="For law students"
        headline="Brief it once. *Remember* it."
        intro="Each brief you save returns after a day, a week and a month. The cards live on this phone only; nothing is sent to Shisho."
      />
      <T v="small" tone="soft">Briefs saved: {cards.length}. Reviews completed: {reviews}.</T>
      <RevisionReminderToggle />

      <T v="label" tone="indigo">Due now ({due.length})</T>
      {due.length === 0 ? <T tone="soft">Nothing is due. Come back later.</T> : null}
      {due.map((c) => (
        <Card key={c.id}>
          <T v="h3">{c.title}</T>
          <T v="small" tone="soft">Review {c.stage + 1} of {INTERVAL_DAYS.length}. Recall the facts, issue, held and ratio before you open your brief.</T>
          {open === c.id
            ? (["facts", "issue", "held", "ratio"] as const).map((f) => (
                <View key={f} style={{ marginTop: space.sm }}>
                  <T v="label" tone="indigo">{f}</T>
                  <T>{c[f] || "—"}</T>
                </View>
              ))
            : null}
          <View style={{ flexDirection: "row", gap: space.md, flexWrap: "wrap", marginTop: space.sm }}>
            <Button label={open === c.id ? "Hide my brief" : "Show my brief"} variant="ghost" onPress={() => setOpen(open === c.id ? null : c.id)} />
            <Button label="I reviewed it" variant="dark" onPress={() => markReviewed(c.id)} />
          </View>
        </Card>
      ))}

      {waiting.length > 0 ? (
        <>
          <T v="label" tone="indigo">Coming up ({waiting.length})</T>
          {waiting.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: p.line }}>
              <T style={{ flex: 1 }}>{c.title}</T>
              <T v="small" tone="soft">{formatDate(new Date(c.dueAt))}</T>
            </View>
          ))}
        </>
      ) : null}

      {done.length > 0 ? (
        <>
          <T v="label" tone="indigo">Finished ({done.length})</T>
          {done.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: p.line }}>
              <T style={{ flex: 1 }}>{c.title}</T>
              <T v="small" tone="soft" accessibilityRole="button" onPress={() => removeBrief(c.id)}>Remove</T>
            </View>
          ))}
        </>
      ) : null}
      <T v="small" tone="faint">Briefs are stored on this phone only.</T>
    </Screen>
  );
}
