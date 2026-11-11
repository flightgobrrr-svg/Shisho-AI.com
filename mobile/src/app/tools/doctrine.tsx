import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Chip, Screen, T, TextButton } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { PageHeader } from "@/ui/web";
import { doctrineThreads, provisionThread, type ThreadCase } from "@/lib/doctrine";
import { ACTS, PROVISIONS } from "@/lib/acts";
import { doctrineNotes } from "@/state/tools";
import { shareText } from "@/ui/share";

/**
 * For scholars: a doctrine traced across decades. Each Library collection, or
 * every judgment on one provision, laid out oldest first with the provisions
 * it turns on. Built only from verified data, so it works with no signal.
 * Notes are the scholar's own and stay on this phone.
 */
const THREADS = doctrineThreads();
const CITED = PROVISIONS.filter((p) => p.citedIn?.length);
const actShort = (id: string) => ACTS.find((a) => a.id === id)?.shortName ?? "";

export default function Doctrine() {
  const p = usePalette();
  const router = useRouter();
  const [mode, setMode] = useState<"subject" | "provision">("subject");
  const [subject, setSubject] = useState(THREADS[0].category);
  const [provIndex, setProvIndex] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const { value: notes } = doctrineNotes.use();

  const cases: ThreadCase[] = useMemo(
    () => (mode === "subject" ? THREADS.find((t) => t.category === subject)!.cases : provisionThread(CITED[provIndex])),
    [mode, subject, provIndex],
  );
  const heading = mode === "subject" ? subject : `${CITED[provIndex].section}, ${actShort(CITED[provIndex].actId)}`;
  const years = cases.map((c) => c.year).filter((y): y is number => y !== null);

  const exportNotes = () => {
    const body = cases
      .map((c) => `${c.year ?? "—"}  ${c.case.title}, ${c.case.citation}\n${c.case.topic}${notes[c.slug] ? `\nMy note: ${notes[c.slug]}` : ""}`)
      .join("\n\n");
    shareText(`${heading}\n\n${body}\n\nTraced with Shisho AI from its verified Library.`);
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="For scholars"
        headline="Trace a doctrine across *decades*."
        intro="Every judgment in Shisho's verified Library, read as one line of thought: by subject, or by the provision it turns on. Oldest first, with later departures marked as the Library records them. Your notes stay on this phone."
      />
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <Chip label="By subject" selected={mode === "subject"} onPress={() => setMode("subject")} />
        <Chip label="By provision" selected={mode === "provision"} onPress={() => setMode("provision")} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {mode === "subject"
          ? THREADS.map((t) => (
              <Chip key={t.category} label={`${t.category} (${t.cases.length})`} selected={subject === t.category} onPress={() => setSubject(t.category)} />
            ))
          : CITED.map((pr, i) => (
              <Chip key={`${pr.actId}${pr.section}`} label={`${pr.section}, ${actShort(pr.actId)}`} selected={provIndex === i} onPress={() => setProvIndex(i)} />
            ))}
      </View>

      <View style={{ gap: 2 }}>
        <T v="h2">{heading}</T>
        <T v="small" tone="soft">
          {cases.length} judgment{cases.length === 1 ? "" : "s"}
          {years.length ? `, ${Math.min(...years)} to ${Math.max(...years)}` : ""}
        </T>
      </View>

      <View>
        {cases.map((c, i) => (
          <View key={c.slug} style={{ flexDirection: "row", gap: space.md }}>
            {/* The timeline rail: year, dot, line. */}
            <View style={{ width: 48, alignItems: "flex-end", paddingTop: 2 }}>
              <T v="mono" tone={c.departed ? "faint" : "indigo"}>{c.year ?? "—"}</T>
            </View>
            <View style={{ alignItems: "center", width: 12 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, marginTop: 6, backgroundColor: c.departed ? p.paper : p.seal, borderWidth: 1.5, borderColor: c.departed ? p.lineStrong : p.seal }} />
              {i < cases.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: p.lineStrong }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: space.xl, gap: 4 }}>
              <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/library/[slug]", params: { slug: c.slug } })}>
                <T v="h3" style={{ textDecorationLine: c.departed ? "line-through" : "none" }}>{c.case.title}</T>
              </Pressable>
              <T v="label" tone="faint">{c.case.citation} · {c.case.court}</T>
              <T v="small" tone="soft">{c.case.topic}</T>
              {c.departed ? <T v="label" tone="seal">No longer good law on this point</T> : null}
              {c.provisions.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                  {c.provisions.map((pv) => (
                    <View key={pv.label} style={{ borderWidth: 1, borderColor: p.line, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <T v="label" tone="indigo" style={{ fontSize: 10 }}>{pv.label}</T>
                    </View>
                  ))}
                </View>
              ) : null}
              {editing === c.slug ? (
                <View style={{ gap: space.sm, marginTop: space.sm }}>
                  <TextInput
                    autoFocus
                    multiline
                    accessibilityLabel={`Your note on ${c.case.title}`}
                    defaultValue={notes[c.slug] ?? ""}
                    onChangeText={(t) => doctrineNotes.set({ ...doctrineNotes.get(), [c.slug]: t })}
                    placeholder="How this judgment moves the doctrine…"
                    placeholderTextColor={p.inkFaint}
                    style={{ minHeight: 80, borderWidth: 1, borderColor: p.lineStrong, padding: space.md, color: p.ink, fontFamily: fonts.sans, fontSize: 15, textAlignVertical: "top" }}
                  />
                  <TextButton label="Done" onPress={() => setEditing(null)} />
                </View>
              ) : notes[c.slug] ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Your note on ${c.case.title}. Tap to edit.`} onPress={() => setEditing(c.slug)} style={{ borderLeftWidth: 2, borderLeftColor: p.indigo, paddingLeft: space.sm, marginTop: 4 }}>
                  <T v="small" style={{ fontStyle: "italic" }}>{notes[c.slug]}</T>
                </Pressable>
              ) : (
                <TextButton label="Add a note" onPress={() => setEditing(c.slug)} />
              )}
            </View>
          </View>
        ))}
      </View>

      <Button label="Share this thread with my notes" variant="ghost" onPress={exportNotes} />
      <T v="small" tone="faint">
        The Library is curated, not complete: a thread shows the judgments Shisho has verified, not every judgment on the point.
      </T>
    </Screen>
  );
}
