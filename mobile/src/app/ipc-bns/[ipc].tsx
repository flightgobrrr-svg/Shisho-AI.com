import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button, Disclaimer, Headline, Notice, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { VERIFIED_ON, findIpcRow, ipcHeadline } from "@/lib/ipcBns";

/** The website's /ipc-bns/[ipc]: one section's own page, from the same rows. */
export default function IpcSection() {
  const p = usePalette();
  const { ipc } = useLocalSearchParams<{ ipc: string }>();
  const row = ipc ? findIpcRow(ipc) : undefined;
  if (!row) {
    return (
      <Screen>
        <Notice title="Not in this list" body="It holds only mappings two published tables agree on." />
      </Screen>
    );
  }
  return (
    <Screen>
      <Stack.Screen options={{ title: `IPC ${row.ipc}` }} />
      <T v="label" tone="indigo">Indian Penal Code, 1860</T>
      <Headline text={`${ipcHeadline(row.ipc, row.bns)}.`} v="h2" />
      <T tone="soft">{row.offence}.</T>
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg }}>
        <View style={{ flex: 1 }}>
          <T v="label" tone="indigo">IPC</T>
          <T v="title">{row.ipc}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T v="label" tone="indigo">BNS</T>
          <T v="title">{row.bns || "—"}</T>
        </View>
      </View>
      {row.note ? (
        <View style={{ borderLeftWidth: 1, borderLeftColor: p.lineStrong, paddingLeft: space.md }}>
          <T v="small" tone="soft">{row.note}</T>
        </View>
      ) : null}
      <T v="small" tone="soft">
        The BNS applies to offences committed on or after 1 July 2024; earlier offences stay under the IPC even if the trial is later. Confirm the section against the Sanhita before you cite it.
      </T>
      <T v="small" tone="faint">Two published tables agree on this row, checked {VERIFIED_ON}.</T>
      <Button label="Look up another section" href="/ipc-bns" variant="ghost" />
      <Disclaimer />
    </Screen>
  );
}
