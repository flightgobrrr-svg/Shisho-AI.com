import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fonts, space, usePalette } from "@/ui/theme";
import { useSession } from "@/state/auth";
import { apiConfigured } from "@/api/client";

/**
 * The app's top-bar pieces: the Shisho logo with its wordmark, the three-bar
 * menu button that opens the side menu (src/app/menu.tsx), a matching close
 * button, and the account button. Drawn with plain views, so there is no icon
 * set to license and each glyph is exactly the app's ink colour.
 */

/* The S and face cut out of the logo (no tile, no lettering): the name is
   written beside it, and the logo's own lettering is unreadable this small. */
const LOGO = require("../../assets/shisho-mark-cutout.png");
const LOGO_RATIO = 352 / 269;

/** The cut-out mark and "Shisho AI". `size` is the mark's height in points. */
export function BrandMark({ size = 34, onPress }: { size?: number; onPress?: () => void }) {
  const p = usePalette();
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
      <Image source={LOGO} style={{ width: Math.round(size * LOGO_RATIO), height: size }} resizeMode="contain" accessible={false} />
      <Text
        maxFontSizeMultiplier={1.2}
        style={{ fontFamily: fonts.display, fontSize: size * 0.62, color: p.ink, letterSpacing: 0.2 }}
      >
        Shisho <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.displayItalic, color: p.seal }}>AI</Text>
      </Text>
    </View>
  );
  if (!onPress) return <View accessible accessibilityLabel="Shisho AI">{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel="Shisho AI, home" hitSlop={6}>
      {body}
    </Pressable>
  );
}

/** Three bars: opens the side menu. */
export function MenuButton() {
  const router = useRouter();
  const p = usePalette();
  return (
    <Pressable
      onPress={() => router.push("/menu")}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: pressed ? p.line : "transparent" })}
    >
      <View style={{ gap: 5 }}>
        {[20, 20, 14].map((w, i) => (
          <View key={i} style={{ width: w, height: 2, borderRadius: 1, backgroundColor: p.ink }} />
        ))}
      </View>
    </Pressable>
  );
}

/** An × in the same weight as the menu bars. */
export function CloseButton({ onPress, label = "Close menu" }: { onPress: () => void; label?: string }) {
  const p = usePalette();
  const bar = { position: "absolute" as const, width: 20, height: 2, borderRadius: 1, backgroundColor: p.ink };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: pressed ? p.line : "transparent" })}
    >
      <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
        <View style={[bar, { transform: [{ rotate: "45deg" }] }]} />
        <View style={[bar, { transform: [{ rotate: "-45deg" }] }]} />
      </View>
    </Pressable>
  );
}

/** The signed-in person's initial in a ring, or "Sign in". Opens Account. */
export function AccountButton() {
  const router = useRouter();
  const p = usePalette();
  const { session } = useSession();
  if (!apiConfigured) return null;
  const initial = session?.user.email?.[0]?.toUpperCase();
  return (
    <Pressable
      onPress={() => router.push("/account")}
      accessibilityRole="button"
      accessibilityLabel={session ? `Account, signed in as ${session.user.email}` : "Sign in"}
      hitSlop={4}
      style={({ pressed }) => ({ minWidth: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
    >
      {initial ? (
        <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: p.ink, alignItems: "center", justifyContent: "center" }}>
          <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.sansSemi, fontSize: 14, color: p.ink }}>{initial}</Text>
        </View>
      ) : (
        <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: p.ink, textDecorationLine: "underline" }}>
          Sign in
        </Text>
      )}
    </Pressable>
  );
}
