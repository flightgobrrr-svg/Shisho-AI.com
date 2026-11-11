import { View } from "react-native";
import { Button, Card, Headline, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { INTERNSHIP as I } from "@/lib/internship";

import { FadedPhoto } from "@/ui/FadedPhoto";
/** The website's /internship, from the same content (lib/internship.ts). */
export default function Internship() {
  const p = usePalette();
  return (
    <Screen>
      <FadedPhoto source={require("../../assets/screens/internship.jpg")} height={180} />
      <T v="label" tone="soft">{I.backLabel}</T>
      <Headline text={I.headline} />
      <T tone="soft">{I.intro}</T>

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>{I.requirementEyebrow}</T>
      <T v="h2">{I.requirementHeading}</T>
      {I.requirement.map((r) => (
        <View key={r.label} style={{ borderWidth: 1, borderColor: p.lineStrong, padding: space.lg, gap: 6 }}>
          <T v="label" tone="faint">{r.label}</T>
          <T v="title" style={{ fontSize: 30, lineHeight: 34 }}>{r.value}</T>
          <T v="small" tone="soft">{r.note}</T>
        </View>
      ))}
      <View style={{ borderLeftWidth: 2, borderLeftColor: p.seal, paddingLeft: space.md }}>
        <T v="small" tone="soft">{I.ruleNote}</T>
      </View>

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>{I.askedEyebrow}</T>
      <T v="h2">{I.askedHeading}</T>
      {I.askedOfYou.map((a) => (
        <Card key={a.title}>
          <T v="h3">{a.title}</T>
          <T v="small" tone="soft">{a.body}</T>
        </Card>
      ))}

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>{I.firstWeekEyebrow}</T>
      <Headline text={I.firstWeekHeading} v="h2" />
      {I.firstWeek.map((step, i) => (
        <View key={step} style={{ flexDirection: "row", gap: space.md }}>
          <View style={{ width: 24, height: 24, borderWidth: 1, borderColor: p.lineStrong, alignItems: "center", justifyContent: "center" }}>
            <T v="mono" style={{ fontSize: 11, lineHeight: 14 }}>{i + 1}</T>
          </View>
          <T style={{ flex: 1 }}>{step}</T>
        </View>
      ))}

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>{I.leaveEyebrow}</T>
      <Headline text={I.leaveHeading} v="h2" />
      <T tone="soft">{I.leaveBody}</T>
      <Button label="Learn the documents" href="/documents" />
      <Button label="Have a draft marked" href="/shisho?mode=review" variant="ghost" />
    </Screen>
  );
}
