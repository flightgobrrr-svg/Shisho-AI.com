import { useState } from "react";
import { View } from "react-native";
import { Field, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { CLERK_WORK, OFFICE_WIDE_WORK, fieldLabel } from "@/lib/clerkWork";

/** The 63 clerk services in their fixed order, with what each captures and its safeguard. */
export default function Services() {
  const p = usePalette();
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const list = CLERK_WORK.filter((w) => !t || String(w.no) === t || `${w.name} ${w.area} ${w.rule}`.toLowerCase().includes(t));
  return (
    <Screen>
      <T v="label" tone="indigo">Clerical work serial numbers</T>
      <T v="title" style={{ fontSize: 28, lineHeight: 34 }}>The 63 services</T>
      <T tone="soft">Each asks for what it needs, applies its safeguard, and prepares its paper as Word and PDF. 60 (Vakalatnama) and the dockets (26, 27) fill the court's own blank form; the six daily sheets cover the whole office.</T>
      <Field label="Search" value={q} onChangeText={setQ} placeholder="number, name, or what it covers" autoCapitalize="none" />
      {list.map((w) => (
        <View key={w.no} style={{ gap: 4, borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md }}>
          <T v="h3">{w.no}. {w.name}</T>
          <T v="label" tone="indigo">{w.area}{w.generator !== "typed" ? " · fills the court's blank form" : OFFICE_WIDE_WORK.includes(w.no) ? " · office sheet" : ""}</T>
          <T v="small" tone="soft">{w.rule}</T>
          {w.needs.length ? <T v="small" tone="faint">Needs: {w.needs.map(fieldLabel).join(", ")}</T> : null}
        </View>
      ))}
    </Screen>
  );
}
