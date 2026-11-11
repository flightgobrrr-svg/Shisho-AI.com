import { Pressable, Share, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Button, Headline, Notice, Screen, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { StepMark } from "@/ui/web";
import { getDocument } from "@/lib/documents";
import { MAP_STAGES } from "@/lib/sitemap";

/**
 * The website's /documents/[slug], in the same order: where it sits, the
 * governing provision, what it must contain, where it fails, the actions,
 * and what to read beside it. The website's "Print this guide" becomes Share,
 * which a phone can print from or send on.
 */
export default function DocumentPage() {
  const router = useRouter();
  const p = usePalette();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doc = slug ? getDocument(slug) : undefined;

  if (!doc) {
    return (
      <Screen>
        <Notice title="Document not found" body="That document is not in the list." />
      </Screen>
    );
  }
  const stage = MAP_STAGES.find((s) => s.n === doc.stage);
  const related = doc.related.map((r) => getDocument(r)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  const shareText = [
    doc.name,
    doc.provision.cite,
    doc.provision.gist,
    "It must contain:",
    ...doc.mustContain.map((m, i) => `${i + 1}. ${m}`),
    "Where it fails:",
    ...doc.defects.map((d) => `- ${d}`),
    "General information, not legal advice.",
  ].join("\n");

  return (
    <Screen>
      <Stack.Screen options={{ title: doc.name }} />
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center", flexWrap: "wrap" }}>
        <Pressable onPress={() => router.push("/documents")} accessibilityRole="link"><T v="label" tone="soft" style={{ textDecorationLine: "underline" }}>Documents</T></Pressable>
        {stage ? (
          <>
            <T v="label" tone="faint">/</T>
            <Pressable onPress={() => router.push("/map")} accessibilityRole="link"><T v="label" tone="soft" style={{ textDecorationLine: "underline" }}>{stage.title}</T></Pressable>
          </>
        ) : null}
      </View>
      <TextButton label="Share this guide" onPress={() => void Share.share({ message: shareText })} />
      <Headline text={doc.name} />
      <T tone="soft">{doc.lede}</T>
      <View style={{ borderLeftWidth: 2, borderLeftColor: p.seal, paddingLeft: space.md, gap: 6 }}>
        <T v="label" tone="indigo">{doc.provision.cite}</T>
        <T>{doc.provision.gist}</T>
      </View>

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>It must contain</T>
      {doc.mustContain.map((item, i) => (
        <View key={item} style={{ flexDirection: "row", gap: space.md }}>
          <T v="mono" tone="faint" style={{ width: 24 }}>{String(i + 1).padStart(2, "0")}</T>
          <T style={{ flex: 1 }}>{item}</T>
        </View>
      ))}

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>Where it fails</T>
      {doc.defects.map((item) => (
        <View key={item} style={{ borderLeftWidth: 1, borderLeftColor: p.seal, paddingLeft: space.md }}>
          <T tone="soft">{item}</T>
        </View>
      ))}

      <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg, gap: space.sm, marginTop: space.md }}>
        {doc.draftsAs ? (
          <>
            <Button label="Draft this with Shisho" href={`/shisho?doc=${doc.slug}` as Href} />
            <Button label="Find the authority" href="/library" variant="ghost" />
          </>
        ) : (
          <Button label="Find the authority" href="/library" />
        )}
      </View>

      {related.length > 0 ? (
        <>
          <T v="label" tone="indigo" style={{ marginTop: space.lg }}>Read beside it</T>
          {related.map((r) => (
            <Pressable
              key={r.slug}
              accessibilityRole="link"
              onPress={() => router.push(`/documents/${r.slug}` as Href)}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: space.md, borderWidth: 1, borderColor: pressed ? p.ink : p.lineStrong, backgroundColor: p.raised, padding: space.lg })}
            >
              <StepMark n={r.stage} />
              <T>{r.name}</T>
            </Pressable>
          ))}
        </>
      ) : null}
      <T v="small" tone="faint">General information, not legal advice. Check every provision against its source before you rely on it.</T>
    </Screen>
  );
}
