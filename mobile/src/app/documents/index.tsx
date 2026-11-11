import { Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Headline, Screen, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { StageTrail, StepMark } from "@/ui/web";
import { DOCUMENTS, documentOfTheWeek, documentsByStage } from "@/lib/documents";
import { MAP_STAGES } from "@/lib/sitemap";

import { FadedPhoto } from "@/ui/FadedPhoto";
/**
 * The website's /documents: the document of the week, the stages it covers,
 * then each stage's documents as cards with their governing provision. Same
 * data (lib/documents.ts), same weekly pick.
 */
export default function Documents() {
  const router = useRouter();
  const p = usePalette();
  const week = documentOfTheWeek();
  const stageTitle = (n: number) => MAP_STAGES.find((s) => s.n === n)?.title ?? "";

  return (
    <Screen>
      <FadedPhoto source={require("../../../assets/screens/documents.jpg")} height={180} />
      <T v="label" tone="indigo">Documents</T>
      <Headline text="What you file, and what it must *carry*." />
      <T tone="soft">
        {DOCUMENTS.length} documents, each with the provision that governs it, what it must contain to be competent, and the ways it actually fails.
      </T>

      <View style={{ borderWidth: 1, borderColor: p.line, backgroundColor: p.raised, padding: space.xl, gap: space.sm }}>
        <T v="label" tone="indigo">Document of the week</T>
        <T v="h2" style={{ fontSize: 21 }}>{week.name}</T>
        <T v="small" tone="soft">{week.lede}</T>
        <T v="label" tone="indigo">{week.provision.cite}</T>
        <TextButton label="Read what it must contain" onPress={() => router.push(`/documents/${week.slug}` as Href)} />
      </View>
      <StageTrail stages={[5, 6, 7]} />

      {documentsByStage().map((group) => (
        <View key={group.stage} style={{ gap: space.md, marginTop: space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <StepMark n={group.stage} />
            <T v="label" tone="indigo">{stageTitle(group.stage)}</T>
          </View>
          {group.documents.map((doc) => (
            <Pressable
              key={doc.slug}
              accessibilityRole="link"
              onPress={() => router.push(`/documents/${doc.slug}` as Href)}
              style={({ pressed }) => ({ borderWidth: 1, borderColor: pressed ? p.ink : p.lineStrong, backgroundColor: p.raised, padding: space.lg, gap: 6 })}
            >
              <T v="h3">{doc.name}</T>
              <T v="small" tone="soft">{doc.lede}</T>
              <T v="label" tone="faint">{doc.provision.cite.split(",")[0]}</T>
            </Pressable>
          ))}
        </View>
      ))}
    </Screen>
  );
}
