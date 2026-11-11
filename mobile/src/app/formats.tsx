import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Chip, Field, Headline, Screen, T, TextButton } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { DRAFT_FORMATS, STANDARD_FILING_STRUCTURE, formatsByCategory, type DraftFormat } from "@/lib/draftFormats";
import { setDraftSeed } from "@/state/draftSeed";

/**
 * The website's /draft-bot/formats: the 99 formats in civil and criminal tabs,
 * the 18-point filing structure, and "start drafting" with a chosen format and
 * the facts. Same data (lib/draftFormats.ts). The facts go to Shisho in memory,
 * never in the route, and open the chat with the message already written.
 */
type Tab = "civil" | "criminal";

export default function Formats() {
  const router = useRouter();
  const p = usePalette();
  const [tab, setTab] = useState<Tab>("civil");
  const [selected, setSelected] = useState<DraftFormat | null>(null);
  const [facts, setFacts] = useState("");
  const [showStructure, setShowStructure] = useState(false);
  const list = formatsByCategory(tab);

  const start = () => {
    if (!selected || !facts.trim()) return;
    setDraftSeed({ formatName: selected.name, description: selected.description, facts: facts.trim() });
    router.push("/shisho?mode=format");
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Shisho</T>
      <Headline text={`${DRAFT_FORMATS.length} formats, civil and *criminal*.`} />
      <T tone="soft">
        Pick the format that matches your matter, then describe the facts. Shisho drafts it from there, in the same conversation you&apos;d use for anything else.
      </T>

      <View style={{ flexDirection: "row", gap: space.sm }} accessibilityRole="tablist">
        {(["civil", "criminal"] as const).map((t) => (
          <Chip
            key={t}
            label={`${t === "civil" ? "Civil" : "Criminal"}  ${formatsByCategory(t).length}`}
            selected={tab === t}
            onPress={() => { setTab(t); setSelected(null); setFacts(""); }}
          />
        ))}
      </View>
      <T v="small" tone="soft">
        {DRAFT_FORMATS.length} formats total, sorted alphabetically within each tab. A format marked for both categories appears in both.
      </T>
      <TextButton
        label={`${showStructure ? "Hide" : "Show"} the standard 18-point filing structure`}
        onPress={() => setShowStructure((s) => !s)}
      />
      {showStructure ? (
        <Card>
          {STANDARD_FILING_STRUCTURE.map((item, i) => (
            <T key={item} v="small" tone="soft">{i + 1}. {item}</T>
          ))}
        </Card>
      ) : null}

      {!selected ? <T v="small" tone="soft">Select a format to see what it must contain, then describe your facts.</T> : null}

      <View style={{ borderWidth: 1, borderColor: p.line }}>
        {list.map((f) => (
          <View key={f.sno}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected?.sno === f.sno }}
            onPress={() => { setSelected(selected?.sno === f.sno ? null : f); setFacts(""); }}
            style={({ pressed }) => ({
              flexDirection: "row",
              gap: space.md,
              paddingVertical: 12,
              paddingHorizontal: space.md,
              borderBottomWidth: 1,
              borderBottomColor: p.line,
              backgroundColor: selected?.sno === f.sno ? p.raised : pressed ? p.line : "transparent",
            })}
          >
            <Text maxFontSizeMultiplier={1.35} style={{ width: 26, textAlign: "right", fontFamily: fonts.mono, fontSize: 12, color: p.inkFaint, paddingTop: 2 }}>{f.sno}</Text>
            <Text maxFontSizeMultiplier={1.35} style={{ flex: 1, fontFamily: fonts.sans, fontSize: 15, color: p.ink }}>{f.name}</Text>
          </Pressable>
          {selected?.sno === f.sno ? (
            <View style={{ padding: space.md, borderBottomWidth: 1, borderBottomColor: p.line, backgroundColor: p.raised, gap: space.md }}>
              <T v="small" tone="soft">{f.description}</T>
              <Field
                label="Facts of the matter"
                value={facts}
                onChangeText={setFacts}
                placeholder="Parties, dates, what happened, what you want done about it…"
                multiline
                numberOfLines={6}
                style={{ minHeight: 140, textAlignVertical: "top" }}
              />
              <Button label="Start drafting →" disabled={!facts.trim()} onPress={start} />
              <T v="small" tone="soft">Opens Shisho with this format and your facts already in the message.</T>
            </View>
          ) : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}
