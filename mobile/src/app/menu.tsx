import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { BrandMark, CloseButton } from "@/ui/Brand";
import { FOOTER_COLUMNS, PRIMARY_NAV, type NavLink } from "@/lib/nav";
import { apiConfigured } from "@/api/client";
import { useSession } from "@/state/auth";
import { appRoute } from "@/features/audienceRoutes";
import { APP_TOOLS, builtInApp } from "@/features/appFeatures";

/**
 * The side menu, opened by the three-bar button in the top bar. It slides in
 * from the left over a dimmed screen; tapping outside, the ×, or Android's back
 * closes it. Same content and order as the website's phone menu (lib/nav.ts),
 * plus the app's own tools, but folded into sections so it reads at a glance.
 * Choosing an item closes the menu, then opens the screen.
 */
type Item = { label: string; to: Href | null; note?: string };
type Section = { key: string; title: string; blurb?: string; to?: Href | null; items: Item[] };

const sub = (l: NavLink): Item => ({
  label: l.label,
  to: appRoute(l.href),
  note: l.planned && !builtInApp(l.href.replace("/for/", "")) ? "Planned" : appRoute(l.href) ? undefined : "On the website",
});

const SECTIONS: Section[] = [
  {
    key: "tools",
    title: "Shisho tools",
    blurb: "Tests, revision and a tool for every group",
    items: APP_TOOLS.map((t) => ({ label: t.label, to: t.href, note: t.note })),
  },
  ...PRIMARY_NAV.map((item) => ({
    key: item.href,
    title: item.label,
    blurb: item.blurb,
    to: appRoute(item.href) ?? (item.href === "/#audiences" ? ("/for" as Href) : null),
    items: [
      ...(item.children ?? []).map(sub),
      ...(item.groups ?? []).flatMap((g) => g.links.map(sub).map((s, i) => (i === 0 ? { ...s, group: g.heading } : s))),
    ] as (Item & { group?: string })[],
  })),
  ...FOOTER_COLUMNS.filter((c) => ["Tools", "Company", "Legal"].includes(c.heading)).map((col) => ({
    key: col.heading,
    title: col.heading === "Tools" ? "Quick tools" : col.heading,
    items: [
      ...col.links.map(sub),
      ...(col.heading === "Tools" ? [{ label: "Next-date reminders", to: "/next-dates" as Href }] : []),
      ...(col.heading === "Legal" ? [{ label: "Open-source notices", to: "/licences" as Href }] : []),
    ],
  })),
];

export default function MenuDrawer() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const panelWidth = Math.min(width * 0.86, 380);
  const slide = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState<string | null>("tools");
  const closing = useRef(false);

  useEffect(() => {
    Animated.timing(slide, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [slide]);

  /** Slide out, leave the menu, then (optionally) open the chosen screen. */
  const close = (then?: Href) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(slide, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      router.back();
      if (then) requestAnimationFrame(() => router.push(then));
    });
  };

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [-panelWidth, 0] });

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(20,22,26,0.45)", opacity: slide }}>
        <Pressable style={{ flex: 1 }} onPress={() => close()} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: panelWidth,
          backgroundColor: p.paper,
          transform: [{ translateX }],
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 4, height: 0 },
          elevation: 16,
        }}
      >
        {/* Header: the logo and the close button. */}
        <View
          style={{
            paddingTop: insets.top + space.sm,
            paddingBottom: space.md,
            paddingLeft: space.xl,
            paddingRight: space.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: p.line,
          }}
        >
          <BrandMark size={40} onPress={() => close("/")} />
          <CloseButton onPress={() => close()} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
          {/* Account */}
          {apiConfigured ? (
            <Pressable
              onPress={() => close("/account")}
              accessibilityRole="link"
              accessibilityLabel={session ? `Account, ${session.user.email}` : "Sign in or create an account"}
              style={({ pressed }) => ({
                margin: space.lg,
                padding: space.lg,
                flexDirection: "row",
                alignItems: "center",
                gap: space.md,
                backgroundColor: pressed ? p.line : p.raised,
                borderWidth: 1,
                borderColor: p.line,
              })}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: p.ink, alignItems: "center", justifyContent: "center" }}>
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.sansSemi, fontSize: 16, color: p.onInk }}>
                  {session ? session.user.email[0]?.toUpperCase() : "→"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <T v="h3" style={{ fontSize: 16 }} numberOfLines={1}>{session ? session.user.email : "Sign in or create an account"}</T>
                <T v="small" tone="soft">{session ? "Your account and plan" : "Optional. Offline tools work without one"}</T>
              </View>
            </Pressable>
          ) : null}

          {/* Sections, folded */}
          {SECTIONS.map((s) => {
            const expanded = open === s.key;
            return (
              <View key={s.key} style={{ borderBottomWidth: 1, borderBottomColor: p.line }}>
                <Pressable
                  onPress={() => setOpen(expanded ? null : s.key)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={`${s.title}${s.blurb ? `. ${s.blurb}` : ""}`}
                  style={({ pressed }) => ({
                    minHeight: 56,
                    paddingHorizontal: space.xl,
                    paddingVertical: space.md,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: space.md,
                    backgroundColor: pressed ? p.line : "transparent",
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.display, fontSize: 19, color: p.ink }}>{s.title}</Text>
                    {s.blurb ? <T v="small" tone="soft" numberOfLines={1}>{s.blurb}</T> : null}
                  </View>
                  <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} accessibilityElementsHidden importantForAccessibility="no">
                    <View style={{ width: 9, height: 9, borderRightWidth: 1.8, borderBottomWidth: 1.8, borderColor: p.inkSoft, transform: [{ rotate: "45deg" }], marginTop: -4 }} />
                  </View>
                </Pressable>

                {expanded ? (
                  <View style={{ paddingBottom: space.md }}>
                    {s.to ? (
                      <MenuLink label={`Open ${s.title}`} strong onPress={() => close(s.to!)} />
                    ) : null}
                    {s.items.map((it, i) => (
                      <View key={`${it.label}-${i}`}>
                        {"group" in it && it.group ? (
                          <T v="label" tone="indigo" style={{ paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: 2 }}>{String(it.group)}</T>
                        ) : null}
                        <MenuLink label={it.label} note={it.note} onPress={it.to ? () => close(it.to!) : undefined} />
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}

          <Pressable
            onPress={() => close("/shisho")}
            accessibilityRole="button"
            style={({ pressed }) => ({ margin: space.xl, marginBottom: space.lg, minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: p.seal, opacity: pressed ? 0.85 : 1 })}
          >
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: "#FFFFFF" }}>Try Shisho free</Text>
          </Pressable>

          <T v="small" tone="faint" style={{ paddingHorizontal: space.xl }}>
            An educational and drafting tool, not legal advice. No advocate–client relationship arises from its use.
          </T>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function MenuLink({ label, note, onPress, strong }: { label: string; note?: string; onPress?: () => void; strong?: boolean }) {
  const p = usePalette();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "link" : undefined}
      accessibilityLabel={note ? `${label}, ${note}` : label}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingLeft: space.xl + space.md,
        paddingRight: space.xl,
        paddingVertical: 10,
        justifyContent: "center",
        gap: 2,
        backgroundColor: pressed ? p.line : "transparent",
      })}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={{ fontFamily: strong ? fonts.sansSemi : fonts.sans, fontSize: 15.5, color: onPress ? (strong ? p.seal : p.ink) : p.inkFaint }}
      >
        {label}
      </Text>
      {/* The note sits under the name, so a long one never squeezes it. */}
      {note ? <T v="label" tone="faint" style={{ fontSize: 10 }}>{note}</T> : null}
    </Pressable>
  );
}

