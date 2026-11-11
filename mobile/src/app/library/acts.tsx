import { View } from "react-native";
import { Headline, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { CENTRAL_ACTS, STATE_ACTS } from "@/lib/bareActs";

/**
 * The website's /library/acts: an index of Acts by name and year, Central
 * then state-wise. Not the text of any Act. Same data (lib/bareActs.ts).
 */
export default function BareActs() {
  const p = usePalette();
  return (
    <Screen>
      <T v="label" tone="indigo">Legal Library</T>
      <Headline text="Central Acts, and state Acts *state-wise*." />
      <T tone="soft">
        An index — the name and year of an Act, not its text. The Central list is held to a high accuracy bar. The state list is deliberately not exhaustive: an entry appears only where the name and year are ones we&apos;re actually confident about, so some states show fewer entries than others rather than a padded, uncertain list. Always verify against the current bare act or state gazette before relying on anything here.
      </T>

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>{CENTRAL_ACTS.length} Central Acts</T>
      <View style={{ gap: 6 }}>
        {CENTRAL_ACTS.map((act) => (
          <View key={act.sno} style={{ flexDirection: "row", gap: space.sm }}>
            <T v="mono" tone="faint" style={{ width: 30, fontSize: 12 }}>{act.sno}.</T>
            <T v="small" style={{ flex: 1 }}>{act.name}, {act.year}</T>
          </View>
        ))}
      </View>

      <T v="label" tone="indigo" style={{ marginTop: space.xl }}>{STATE_ACTS.length} states and union territories</T>
      <T v="h2">State-wise index</T>
      {STATE_ACTS.map((group) => (
        <View key={group.state} style={{ gap: 6, marginTop: space.md }}>
          <T v="label" tone="indigo" style={{ borderBottomWidth: 1, borderBottomColor: p.line, paddingBottom: 6 }}>{group.state}</T>
          {group.acts.map((act) => (
            <View key={act.sno} style={{ flexDirection: "row", gap: space.sm }}>
              <T v="mono" tone="faint" style={{ width: 30, fontSize: 12 }}>{act.sno}.</T>
              <T v="small" style={{ flex: 1 }}>{act.name}, {act.year}</T>
            </View>
          ))}
          {group.note ? <T v="small" tone="soft">{group.note}</T> : null}
        </View>
      ))}
    </Screen>
  );
}
