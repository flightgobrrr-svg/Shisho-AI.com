import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { HIGH_COURT_BY_STATE, STATES, UNION_TERRITORIES, type StateName } from "@/lib/states";

/**
 * The website's StateSelect: pick a state or union territory and see which
 * High Court has writ jurisdiction over it. Phones have no <select> like the
 * website's, so the field opens a list in place (States, then Union
 * territories) and closes on a choice. Same data (lib/states.ts).
 */
export function StateSelect({ label = "Where is the matter" }: { label?: string }) {
  const p = usePalette();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StateName | "">("");
  const court = selected ? HIGH_COURT_BY_STATE[selected] : null;

  const Option = ({ name }: { name: StateName }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: name === selected }}
      onPress={() => { setSelected(name); setOpen(false); }}
      style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: space.md, backgroundColor: name === selected ? p.paper : pressed ? p.line : "transparent" })}
    >
      <T v="small">{name}</T>
    </Pressable>
  );

  return (
    <View style={{ gap: space.sm }}>
      <T v="label" tone="soft">{label}</T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected || "not chosen"}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={{ minHeight: 48, borderWidth: 1, borderColor: p.lineStrong, backgroundColor: p.raised, paddingHorizontal: space.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sans, fontSize: 15, color: selected ? p.ink : p.inkSoft }}>
          {selected || "Select a state or union territory…"}
        </Text>
        <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sans, fontSize: 14, color: p.inkSoft }}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open ? (
        <View style={{ borderWidth: 1, borderColor: p.line, backgroundColor: p.raised }}>
          <T v="label" tone="faint" style={{ paddingHorizontal: space.md, paddingTop: space.sm }}>States</T>
          {STATES.map((s) => <Option key={s} name={s} />)}
          <T v="label" tone="faint" style={{ paddingHorizontal: space.md, paddingTop: space.sm }}>Union territories</T>
          {UNION_TERRITORIES.map((u) => <Option key={u} name={u} />)}
        </View>
      ) : null}
      <View accessibilityLiveRegion="polite">
        {court ? (
          <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: p.inkSoft }}>
            Writ jurisdiction lies with the <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.display, fontSize: 16, color: p.ink }}>{court}</Text>.
          </Text>
        ) : (
          <T v="small" tone="soft">28 states and 8 union territories, and the High Court over each.</T>
        )}
      </View>
    </View>
  );
}
