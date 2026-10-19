import { useMemo, useState } from "react";
import { View } from "react-native";
import { Card, Chip, Field, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import {
  CLERK_DAILY_ROUTINE,
  CLERK_MANUAL,
  CLERK_PRACTICAL_FORMATS,
} from "@/lib/clerkManual";

type Tab = "routine" | "manual" | "formats";

export default function Clerks() {
  const p = usePalette();
  const [tab, setTab] = useState<Tab>("routine");
  const [query, setQuery] = useState("");

  const manual = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? CLERK_MANUAL.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      : CLERK_MANUAL;
  }, [query]);

  return (
    <Screen>
      <T tone="soft">The practice manual for advocate clerks: registration, filing, scrutiny and the daily routine.</T>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
        <Chip label="Daily routine" selected={tab === "routine"} onPress={() => setTab("routine")} />
        <Chip label={`The manual (${CLERK_MANUAL.length})`} selected={tab === "manual"} onPress={() => setTab("manual")} />
        <Chip label="Working formats" selected={tab === "formats"} onPress={() => setTab("formats")} />
      </View>

      {tab === "routine" &&
        CLERK_DAILY_ROUTINE.map((block) => (
          <Card key={block.heading}>
            <T v="h3">{block.heading}</T>
            {block.items.map((item, i) => (
              <View key={item} style={{ flexDirection: "row", gap: space.md }}>
                <T v="mono" tone="faint">{i + 1}.</T>
                <T v="small" style={{ flex: 1 }}>{item}</T>
              </View>
            ))}
          </Card>
        ))}

      {tab === "manual" && (
        <>
          <Field label="Search the manual" value={query} onChangeText={setQuery} placeholder="vakalatnama, court fee, scrutiny" autoCapitalize="none" />
          {manual.length === 0 ? <T tone="soft">No entry matches. Try a shorter word.</T> : null}
          {manual.map((e) => (
            <View key={e.sno} style={{ borderBottomWidth: 1, borderBottomColor: p.line, paddingVertical: space.md, gap: 4 }}>
              <T v="h3">
                {e.sno}. {e.name}
              </T>
              <T v="small" tone="soft">{e.description}</T>
            </View>
          ))}
        </>
      )}

      {tab === "formats" &&
        CLERK_PRACTICAL_FORMATS.map((f) => (
          <Card key={f.title}>
            <T v="h3">{f.title}</T>
            {f.fields.map((field, i) => (
              <T key={`${field}-${i}`} v="small" tone="soft">
                {field}
              </T>
            ))}
            {f.note ? <T v="small" tone="faint">{f.note}</T> : null}
          </Card>
        ))}
    </Screen>
  );
}
