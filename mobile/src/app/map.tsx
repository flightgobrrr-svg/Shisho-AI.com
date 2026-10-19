import { View } from "react-native";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { Card, Disclaimer, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { MAP_STAGES } from "@/lib/sitemap";

/**
 * The nine stages of a civil matter. A box that leads to a document opens that
 * document offline; a box that points at the website's courses or Library is
 * shown as plain text, because those need the online service.
 */
export default function MapScreen() {
  const p = usePalette();
  return (
    <Screen>
      <T tone="soft">From the first meeting to written arguments, and the documents filed at each stage.</T>
      {MAP_STAGES.map((s) => (
        <Card key={s.n}>
          <T v="label" tone="indigo">Stage {s.n}</T>
          <T v="h2">{s.title}</T>
          <T v="small" tone="soft">{s.summary}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm }}>
            {s.boxes.map((b) => {
              const m = b.href?.match(/^\/documents\/([a-z-]+)$/);
              const chip = (
                <View
                  style={{
                    minHeight: 40,
                    justifyContent: "center",
                    paddingHorizontal: space.md,
                    borderWidth: 1,
                    borderColor: m ? p.lineStrong : p.line,
                  }}
                >
                  <T v="small" tone={m ? "ink" : "faint"}>{m ? `${b.label} ›` : b.label}</T>
                </View>
              );
              return m ? (
                <Link key={b.label} href={{ pathname: "/documents/[slug]", params: { slug: m[1] } }} asChild>
                  <Pressable accessibilityRole="link" accessibilityLabel={`${b.label}, opens the document`}>{chip}</Pressable>
                </Link>
              ) : (
                <View key={b.label}>{chip}</View>
              );
            })}
          </View>
        </Card>
      ))}
      <Disclaimer />
    </Screen>
  );
}
