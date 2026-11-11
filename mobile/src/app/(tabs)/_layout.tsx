import { Text, View } from "react-native";
import { Tabs, router } from "expo-router";
import { fonts, space, usePalette } from "@/ui/theme";
import { AccountButton, BrandMark, MenuButton } from "@/ui/Brand";

/**
 * Four tabs, mirroring the website's menu: Home, then Shisho, Legal Library
 * and Courses as on the site. Everything else is in the side menu, opened by
 * the three-bar button beside the logo in the top bar (src/app/menu.tsx). Text-only: the labels carry the meaning, there is no icon set to
 * license, and nothing is left to guess from a glyph. The active tab is shown
 * by colour, weight and an underline, so it is not conveyed by colour alone.
 */
export default function TabsLayout() {
  const p = usePalette();
  const screens = [
    ["index", "Home"],
    ["shisho", "Shisho"],
    ["library", "Library"],
    ["courses", "Courses"],
  ] as const;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: p.paper, borderBottomWidth: 1, borderBottomColor: p.line },
        headerShadowVisible: false,
        // The top bar: menu and logo on the left, account on the right.
        headerTitle: () => null,
        headerLeft: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: space.sm }}>
            <MenuButton />
            <BrandMark onPress={() => router.navigate("/")} />
          </View>
        ),
        headerRight: () => (
          <View style={{ paddingRight: space.md }}>
            <AccountButton />
          </View>
        ),
        tabBarStyle: { backgroundColor: p.raised, borderTopColor: p.line, paddingTop: 4 },
        tabBarItemStyle: { justifyContent: "center", alignItems: "center", paddingVertical: 6 },
        tabBarIconStyle: { display: "none" },
        sceneStyle: { backgroundColor: p.paper },
      }}
    >
      {screens.map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: `${title} tab`,
            tabBarLabel: ({ focused }) => (
              <Text
                maxFontSizeMultiplier={1.2}
                style={{
                  fontFamily: focused ? fonts.sansSemi : fonts.sansMedium,
                  fontSize: 14,
                  color: focused ? p.seal : p.inkSoft,
                  textDecorationLine: focused ? "underline" : "none",
                }}
              >
                {title}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
