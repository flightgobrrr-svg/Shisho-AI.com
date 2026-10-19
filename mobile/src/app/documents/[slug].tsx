import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Card, Disclaimer, Notice, Row, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { DOCUMENTS } from "@/lib/documents";

export default function DocumentPage() {
  const p = usePalette();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doc = DOCUMENTS.find((d) => d.slug === slug);

  if (!doc) {
    return (
      <Screen>
        <Notice title="Document not found" body="That document is not in the list." />
      </Screen>
    );
  }

  const related = doc.related
    .map((r) => DOCUMENTS.find((d) => d.slug === r))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <Screen>
      <Stack.Screen options={{ title: doc.name }} />
      <T v="title">{doc.name}</T>
      <T tone="soft">{doc.lede}</T>

      <View style={{ borderLeftWidth: 2, borderLeftColor: p.seal, paddingLeft: space.md, gap: 4 }}>
        <T v="label" tone="indigo">{doc.provision.cite}</T>
        <T>{doc.provision.gist}</T>
      </View>

      <T v="label" tone="indigo" style={{ marginTop: 8 }}>It must contain</T>
      {doc.mustContain.map((item, i) => (
        <View key={item} style={{ flexDirection: "row", gap: space.md }}>
          <T v="mono" tone="faint">{String(i + 1).padStart(2, "0")}</T>
          <T style={{ flex: 1 }}>{item}</T>
        </View>
      ))}

      <T v="label" tone="indigo" style={{ marginTop: 8 }}>Where it fails</T>
      {doc.defects.map((item) => (
        <Card key={item}>
          <T tone="soft">{item}</T>
        </Card>
      ))}

      {related.length > 0 ? (
        <>
          <T v="label" tone="indigo" style={{ marginTop: 8 }}>Read beside it</T>
          {related.map((d) => (
            <Row key={d.slug} title={d.name} detail={d.provision.cite} href={{ pathname: "/documents/[slug]", params: { slug: d.slug } }} />
          ))}
        </>
      ) : null}
      <Disclaimer />
    </Screen>
  );
}
