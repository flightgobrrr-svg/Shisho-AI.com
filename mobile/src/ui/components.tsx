import { type ComponentRef, type ReactNode, type Ref } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { fonts, space, TOUCH, usePalette } from "@/ui/theme";

type Variant = "title" | "h2" | "h3" | "body" | "small" | "label" | "mono";

const SIZES: Record<Variant, TextStyle> = {
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  h3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 23 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase" },
  mono: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 19 },
};

/** Text with the app's type scale. Respects the user's font-size setting. */
export function T({
  v = "body",
  tone = "ink",
  style,
  ...props
}: TextProps & { v?: Variant; tone?: "ink" | "soft" | "faint" | "seal" | "indigo" }) {
  const p = usePalette();
  const color = { ink: p.ink, soft: p.inkSoft, faint: p.inkFaint, seal: p.seal, indigo: p.indigo }[tone];
  const isHeading = v === "title" || v === "h2" || v === "h3";
  return (
    <Text
      accessibilityRole={isHeading ? "header" : undefined}
      maxFontSizeMultiplier={1.35}
      style={[SIZES[v], { color }, style]}
      {...props}
    />
  );
}

/** A heading with one word in italics, the brand's way of marking the key word. */
export function Headline({ text, v = "title" }: { text: string; v?: "title" | "h2" }) {
  const [before, key, after] = text.split("*");
  const p = usePalette();
  return (
    <T v={v}>
      {before}
      <Text style={{ fontFamily: fonts.displayItalic, textDecorationLine: "underline", textDecorationColor: p.seal }}>
        {key}
      </Text>
      {after}
    </T>
  );
}

/** The standard scrolling screen: safe areas, padding, keyboard-friendly. */
export function Screen({ children, gap = space.lg }: { children: ReactNode; gap?: number }) {
  const p = usePalette();
  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: p.paper }} role="main">
      <ScrollView
        // On the web build a scrolling area must be reachable by keyboard; on
        // phones the OS scrolls it, and an extra focus stop would only add noise.
        tabIndex={Platform.OS === "web" ? 0 : undefined}
        contentContainerStyle={{ padding: space.xl, paddingTop: space.md, gap, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = usePalette();
  return (
    <View
      style={[
        { backgroundColor: p.raised, borderColor: p.line, borderWidth: 1, padding: space.lg, gap: space.sm },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Badge({ status }: { status: "live" | "planned" | "offline" }) {
  const label = status === "live" ? "Live" : status === "offline" ? "Offline" : "Planned";
  return <T v="label" tone={status === "planned" ? "faint" : "indigo"}>{label}</T>;
}

/** A tappable row: title, one line of detail, optional status. A chevron marks rows that open something. */
export function Row({
  title,
  detail,
  status,
  href,
  onPress,
}: {
  title: string;
  detail?: string;
  status?: "live" | "planned" | "offline";
  href?: Href;
  onPress?: () => void;
}) {
  const p = usePalette();
  const router = useRouter();
  const tappable = Boolean(href || onPress);
  return (
    <Pressable
      disabled={!tappable}
      onPress={href ? () => router.push(href) : onPress}
      accessibilityRole={href ? "link" : onPress ? "button" : undefined}
      accessibilityLabel={detail ? `${title}. ${detail}` : title}
      style={({ pressed }) => ({
        minHeight: TOUCH,
        paddingVertical: space.md,
        paddingHorizontal: space.xs,
        marginHorizontal: -space.xs,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        borderBottomWidth: 1,
        borderBottomColor: p.line,
        backgroundColor: pressed ? p.line : "transparent",
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T v="h3">{title}</T>
        {detail ? <T v="small" tone="soft">{detail}</T> : null}
      </View>
      {status ? <Badge status={status} /> : null}
      {tappable ? (
        <T style={{ fontFamily: fonts.sans, fontSize: 22, lineHeight: 24 }} tone="faint" accessibilityElementsHidden importantForAccessibility="no">
          ›
        </T>
      ) : null}
    </Pressable>
  );
}

export function Chip({ label, onPress, selected }: { label: string; onPress?: () => void; selected?: boolean }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: 40,
        paddingHorizontal: space.lg,
        justifyContent: "center",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? p.ink : p.lineStrong,
        backgroundColor: selected ? p.ink : pressed ? p.line : "transparent",
      })}
    >
      <T v="small" style={{ color: selected ? p.onInk : p.ink }}>{label}</T>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  href,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress?: () => void;
  href?: Href;
  variant?: "primary" | "ghost" | "dark";
  disabled?: boolean;
}) {
  const p = usePalette();
  const router = useRouter();
  const bg = variant === "primary" ? p.seal : variant === "dark" ? p.ink : "transparent";
  const fg = variant === "ghost" ? p.ink : variant === "dark" ? p.onInk : "#FFFFFF";
  // A link-button navigates with the router rather than wrapping a Link: a
  // wrapped Pressable loses its function style, which dropped the background
  // and left dark text on a dark card.
  const handle = href ? () => router.push(href) : onPress;
  return (
    <Pressable
      onPress={handle}
      disabled={disabled}
      accessibilityRole={href ? "link" : "button"}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        minHeight: TOUCH,
        paddingHorizontal: space.xl,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: p.lineStrong,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: fg }}>{label}</Text>
    </Pressable>
  );
}

/** The instance type of a text input, for focusing it from code. */
export type InputRef = ComponentRef<typeof TextInput>;

/** A labelled text field. `label` is always visible, never replaced by the placeholder. */
export function Field({
  label,
  style,
  inputRef,
  ...props
}: TextInputProps & { label: string; inputRef?: Ref<InputRef> }) {
  const p = usePalette();
  return (
    <View style={{ gap: space.xs }}>
      <T v="label" tone="indigo">{label}</T>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        placeholderTextColor={p.inkFaint}
        style={[
          {
            minHeight: TOUCH,
            paddingHorizontal: space.md,
            paddingVertical: space.sm,
            borderWidth: 1,
            borderColor: p.lineStrong,
            backgroundColor: p.paper,
            color: p.ink,
            fontFamily: fonts.sans,
            fontSize: 16,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

/** An honest status message: loading, empty, offline or error. */
export function Notice({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <Card>
      <T v="h3">{title}</T>
      {body ? <T v="small" tone="soft">{body}</T> : null}
      {children}
    </Card>
  );
}

export const Disclaimer = () => (
  <T v="small" tone="faint">
    General information, not legal advice. Check every provision against its source before you rely on it.
  </T>
);

/** A card that is itself the tap target, with a chevron. Used for choices. */
export function ChoiceCard({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail?: string;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}. ${detail}` : title}
      style={({ pressed }) => ({
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: space.lg,
        borderWidth: 1,
        borderColor: p.line,
        backgroundColor: pressed ? p.line : p.raised,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T v="h3">{title}</T>
        {detail ? <T v="small" tone="soft">{detail}</T> : null}
      </View>
      <T style={{ fontFamily: fonts.sans, fontSize: 22, lineHeight: 24 }} tone="faint" accessibilityElementsHidden importantForAccessibility="no">
        ›
      </T>
    </Pressable>
  );
}

/** A quiet text button for secondary actions like Skip. */
export function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => ({ minHeight: TOUCH, minWidth: TOUCH, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: p.inkSoft, textDecorationLine: "underline" }}>{label}</Text>
    </Pressable>
  );
}
