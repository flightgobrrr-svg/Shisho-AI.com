import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Button, Headline, Screen, T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { SectionRule, StepMark } from "@/ui/web";
import { StateSelect } from "@/ui/StateSelect";
import { MAP_STAGES, PRODUCT_META, type MapBox } from "@/lib/sitemap";
import { appRoute } from "@/features/audienceRoutes";

import { FadedPhoto } from "@/ui/FadedPhoto";
/**
 * The website's /map, in the same order: the stage index, then the nine
 * stages down a spine, each with its products, summary and boxes, the state
 * picker on stage 3, and "Start at the stage you are on". Same data
 * (lib/sitemap.ts). A box opens its screen where the app has one; a box with
 * options (Trial's Arguments) opens its list in place, like the website's menu.
 */
const PRODUCT_ROUTE: Record<string, Href> = { "draft-bot": "/shisho", library: "/library", courses: "/courses" };

export default function MapScreen() {
  const router = useRouter();
  const p = usePalette();
  const [openBox, setOpenBox] = useState<string | null>(null);

  const Box = ({ box, stage }: { box: MapBox; stage: string }) => {
    const to = box.href ? appRoute(box.href) : null;
    const key = `${stage}-${box.label}`;
    const body = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {box.ref ? <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.mono, fontSize: 11, color: p.inkFaint }}>{box.ref}</Text> : null}
        <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sans, fontSize: 14.5, color: box.unread ? p.inkSoft : p.ink }}>{box.label}</Text>
        {box.options ? <Text maxFontSizeMultiplier={1.35} style={{ color: p.inkSoft, fontSize: 12 }}>{openBox === key ? "▲" : "▼"}</Text> : null}
      </View>
    );
    const shell = {
      minHeight: 48,
      justifyContent: "center" as const,
      paddingHorizontal: space.md,
      paddingVertical: 10,
      borderWidth: 1,
      borderStyle: box.unread ? ("dashed" as const) : ("solid" as const),
      borderColor: box.unread ? p.line : p.lineStrong,
      backgroundColor: p.raised,
    };
    if (box.options) {
      return (
        <View>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: openBox === key }} onPress={() => setOpenBox(openBox === key ? null : key)} style={shell}>
            {body}
          </Pressable>
          {openBox === key ? (
            <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: p.lineStrong, backgroundColor: p.raised }}>
              {box.options.map((o) => {
                const oto = appRoute(o.href);
                return (
                  <Pressable key={o.label} disabled={!oto} accessibilityRole={oto ? "link" : undefined} onPress={oto ? () => router.push(oto) : undefined} style={{ minHeight: 44, justifyContent: "center", paddingVertical: 10, paddingHorizontal: space.md }}>
                    <T v="small" tone={oto ? "ink" : "faint"}>{o.label}</T>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      );
    }
    return to ? (
      <Pressable accessibilityRole="link" accessibilityLabel={`${box.label} — ${stage}`} onPress={() => router.push(to)} style={({ pressed }) => [shell, pressed && { borderColor: p.ink }]}>
        {body}
      </Pressable>
    ) : (
      <View style={shell}>{body}</View>
    );
  };

  return (
    <Screen>
      <FadedPhoto source={require("../../assets/screens/map.jpg")} height={180} />
      <T v="label" tone="indigo">The map</T>
      <Headline text="Where Shisho meets a *matter*." />
      <T tone="soft">
        A matter in sequence — from the first client meeting through pleadings and trial to the citations it rests on — and what this site does at each point. The first and last stages are the site&apos;s own, not the court&apos;s.
      </T>

      {/* The stage index, scrolling sideways on a phone as on the website. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {MAP_STAGES.map((s) => (
          <View key={s.n} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingRight: space.sm }}>
            <StepMark n={s.n} size={18} />
            <T v="small" tone="soft">{s.title}</T>
          </View>
        ))}
      </ScrollView>

      <SectionRule />
      {MAP_STAGES.map((stage, i) => (
        <View key={stage.n} style={{ flexDirection: "row", gap: space.md }}>
          <View style={{ alignItems: "center" }}>
            <StepMark n={stage.n} />
            {i < MAP_STAGES.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: p.lineStrong, marginTop: 4 }} /> : null}
          </View>
          <View style={{ flex: 1, gap: space.sm, paddingBottom: space.xxl }}>
            <T v="h3" style={{ fontSize: 19 }}>{stage.title}</T>
            {stage.serves.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {stage.serves.map((product) => (
                  <Pressable key={product} accessibilityRole="link" accessibilityLabel={`${PRODUCT_META[product].label} — ${stage.title}`} onPress={() => router.push(PRODUCT_ROUTE[product])} hitSlop={{ top: 6, bottom: 6 }}
                    style={{ borderWidth: 1, borderColor: p.line, paddingHorizontal: 10, minHeight: 36, justifyContent: "center" }}>
                    <T v="label" tone="soft" style={{ fontSize: 10 }}>{PRODUCT_META[product].label}</T>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <T v="small" tone="soft">{stage.summary}</T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
              {stage.boxes.map((box) => <Box key={box.label} box={box} stage={stage.title} />)}
            </View>
            {stage.statePicker ? <StateSelect /> : null}
          </View>
        </View>
      ))}

      <SectionRule />
      <Headline text="Start at the stage you are *on*." v="h2" />
      <T tone="soft">
        Every document above has a page of its own — what it must contain, and how it fails. Each provision on them was checked against its source before it was written down.
      </T>
      <Button label="Read the documents" href="/documents" />
      <Button label="Have a draft marked" href="/shisho?mode=review" variant="ghost" />
    </Screen>
  );
}
