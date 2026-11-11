import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Chip, Field, Notice, Screen, T, TextButton } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space, usePalette } from "@/ui/theme";
import { PROVISIONS, getAct, searchProvisions, type Provision } from "@/lib/acts";
import { DOCUMENTS } from "@/lib/documents";
import { COLLECTIONS, PREVIEW_CASES } from "@/lib/library";

/**
 * The Library's "Bare Acts" and "Commentary" collections, as on the website:
 * the same 39 provisions (lib/acts.ts), grouped by Act and searchable, showing
 * either the operative rule or the practical note. "Find a provision" on Home
 * opens this with the search filled in.
 */
const documentName = new Map(DOCUMENTS.map((d) => [d.slug, d.name]));
const caseTitle = new Map(PREVIEW_CASES.map((c) => [c.citation, c.title]));

export default function Provisions() {
  const router = useRouter();
  const p = usePalette();
  const params = useLocalSearchParams<{ q?: string; mode?: string }>();
  const [mode, setMode] = useState<"acts" | "commentary">(params.mode === "commentary" ? "commentary" : "acts");
  const [query, setQuery] = useState(params.q ?? "");
  const results = useMemo(() => searchProvisions(PROVISIONS, query), [query]);
  const groups = useMemo(() => {
    const ids: Provision["actId"][] = [];
    for (const r of results) if (!ids.includes(r.actId)) ids.push(r.actId);
    return ids.map((id) => ({ act: getAct(id), items: results.filter((r) => r.actId === id) }));
  }, [results]);

  return (
    <Screen>
      <Stack.Screen options={{ title: mode === "acts" ? "Bare Acts" : "Commentary" }} />
      {mode === "acts" ? <FadedPhoto source={require("../../../assets/bare-acts.jpg")} height={170} /> : null}
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <Chip label="Bare Acts" selected={mode === "acts"} onPress={() => setMode("acts")} />
        <Chip label="Commentary" selected={mode === "commentary"} onPress={() => setMode("commentary")} />
      </View>
      <T tone="soft">{COLLECTIONS.find((c) => c.id === mode)?.description}</T>
      <Field label="Act, section, or subject" value={query} onChangeText={setQuery} placeholder="Order VII Rule 11, Article 21…" returnKeyType="search" autoCapitalize="none" />
      <T v="label" tone="faint" accessibilityLiveRegion="polite">Showing {results.length} of {PROVISIONS.length}</T>
      <TextButton label="Index of all Acts, Central and state-wise" onPress={() => router.push("/library/acts")} />

      {results.length === 0 ? (
        <Notice title="Nothing here yet." body={`No provision matches “${query}”.`}>
          <TextButton label="Show everything" onPress={() => setQuery("")} />
        </Notice>
      ) : (
        groups.map(({ act, items }) => (
          <View key={act.id} style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, alignItems: "baseline" }}>
              <T v="h3">{act.name}</T>
              {!act.inForce ? <T v="label" tone="seal">Repealed</T> : null}
            </View>
            {items.map((prov) => (
              <View key={`${prov.actId}-${prov.section}`} style={{ paddingVertical: space.lg, borderTopWidth: 1, borderTopColor: p.line, gap: space.sm }}>
                <T v="h3" style={{ fontSize: 16 }}>
                  {prov.section}
                  <Text maxFontSizeMultiplier={1.35} style={{ color: p.inkSoft }}> — {prov.title}</Text>
                </T>
                {!prov.verbatim ? <T v="label" tone="faint" style={{ fontSize: 10 }}>Plain-language summary</T> : null}
                <T v="small">{mode === "acts" ? prov.text : prov.commentary}</T>
                {prov.successor?.kind === "none" ? (
                  <T v="small" tone="seal">No successor provision — {prov.successor.note}</T>
                ) : null}
                {prov.usedIn?.length ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, alignItems: "center" }}>
                    <T v="small" tone="faint">Used by</T>
                    {prov.usedIn.map((slug) => (
                      <TextButton key={slug} label={documentName.get(slug) ?? slug} onPress={() => router.push(`/documents/${slug}` as Href)} />
                    ))}
                  </View>
                ) : null}
                {prov.citedIn?.length ? (
                  <T v="small" tone="faint">Cited in {prov.citedIn.map((c) => caseTitle.get(c) ?? c).join(", ")}</T>
                ) : null}
              </View>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}
