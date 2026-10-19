import { Text } from "react-native";
import { Tabs } from "expo-router";
import { fonts, usePalette } from "@/ui/theme";

/**
 * Five tabs, text-only: the labels carry the meaning, there is no icon set to
 * license, and nothing is left to guess from a glyph. The active tab is shown
 * by colour, weight and an underline, so it is not conveyed by colour alone.
 */
export default function TabsLayout() {
  const p = usePalette();
  const screens = [
    ["index", "Home"],
    ["tools", "Tools"],
    ["shisho", "Shisho"],
    ["learn", "Learn"],
    ["me", "Me"],
  ] as const;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: p.paper },
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 20, color: p.ink },
        headerShadowVisible: false,
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
