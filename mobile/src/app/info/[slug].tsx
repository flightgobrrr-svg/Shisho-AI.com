import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Notice, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { LEGAL } from "@/lib/legalPages";
import { LOG } from "@/lib/corrections";
import { formatDate } from "@/ui/dates";

/**
 * Terms, privacy, refund, about, how it works and the corrections log, all
 * read from the same files as the website so the two can never disagree.
 *
 * NOTE for the owner: the privacy and terms text describes the WEBSITE. The
 * app stores less (only what is saved on the phone), but it has not been
 * reviewed by an advocate, and the store listings will need their own privacy
 * answers. See mobile/docs/STORE-CHECKLIST.md.
 */
export default function Info() {
  const p = usePalette();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  if (slug === "corrections") {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Corrections" }} />
        <T v="title">Corrections and known gaps</T>
        <T tone="soft">What we leave out on purpose, and a record of anything we have had to correct.</T>
        {LOG.map((e) => (
          <View key={e.title} style={{ borderBottomWidth: 1, borderBottomColor: p.line, paddingVertical: space.md, gap: 4 }}>
            <T v="label" tone="faint">{formatDate(new Date(e.date))}</T>
            <T v="h3">{e.title}</T>
            <T v="small" tone="soft">{e.body}</T>
          </View>
        ))}
      </Screen>
    );
  }

  const doc = (LEGAL as Record<string, (typeof LEGAL)[keyof typeof LEGAL]>)[slug ?? ""];
  if (!doc) {
    return (
      <Screen>
        <Notice title="Page not found" body="That page is not in the app." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: doc.title }} />
      {doc.updated ? <T v="label" tone="faint">Updated {doc.updated}</T> : null}
      <T v="title">{doc.title}</T>
      <T tone="soft">{doc.lede}</T>
      {doc.sections.map((s) => (
        <View key={s.heading} style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg, gap: space.sm }}>
          <T v="h2">{s.heading}</T>
          {s.body.map((para) => (
            <T key={para} tone="soft">{para}</T>
          ))}
        </View>
      ))}
    </Screen>
  );
}
