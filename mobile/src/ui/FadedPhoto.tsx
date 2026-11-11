import { Image, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePalette } from "@/ui/theme";

/**
 * A photograph that fades into the page on every side, the app's version of
 * the website's soft oval mask (PhotoBackdrop / SidePhoto). React Native has
 * no CSS mask, so four paper-coloured gradients feather the edges instead.
 * Decorative: the surrounding copy says what the section is about, as on the
 * website, so it is hidden from screen readers.
 */
export function FadedPhoto({
  source,
  height = 260,
  opacity = 0.85,
}: {
  source: ImageSourcePropType;
  height?: number;
  opacity?: number;
}) {
  const p = usePalette();
  const fade = [p.paper, `${p.paper}00`] as const;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height, marginHorizontal: -8, overflow: "hidden" }}
    >
      <Image
        accessible={false}
        source={source}
        resizeMode="cover"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
      />
      <LinearGradient colors={fade} style={{ position: "absolute", left: 0, right: 0, top: 0, height: height * 0.28 }} />
      <LinearGradient colors={[fade[1], fade[0]]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height * 0.34 }} />
      <LinearGradient colors={fade} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "22%" }} />
      <LinearGradient colors={[fade[1], fade[0]]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "22%" }} />
    </View>
  );
}
