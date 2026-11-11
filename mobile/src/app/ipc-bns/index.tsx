import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Disclaimer, Field, Notice, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space, usePalette } from "@/ui/theme";
import { IPC_BNS, VERIFIED_ON, searchIpcBns } from "@/lib/ipcBns";

export default function IpcBns() {
  const p = usePalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => searchIpcBns(IPC_BNS, query), [query]);

  return (
    <Screen>
      <FadedPhoto source={require("../../../assets/ipc-bns.jpg")} height={190} />
      <T v="label" tone="indigo">Bharatiya Nyaya Sanhita, 2023</T>
      <T tone="soft">
        The BNS replaced the IPC for offences committed on or after 1 July 2024; earlier offences stay under the IPC. Numbers did not carry over, so citing "302" can now point to the wrong offence.
      </T>

      <Field label="Section number or offence" value={query} onChangeText={setQuery} placeholder="420, 498A, theft" autoCapitalize="none" returnKeyType="search" />

      <View accessibilityLiveRegion="polite" style={{ gap: 0 }}>
        {rows.length === 0 ? (
          <Notice title="Not in this list" body="It holds only mappings two published tables agree on. Check the BNS directly for anything else." />
        ) : (
          rows.map((r) => (
            <Pressable
              key={r.ipc}
              accessibilityRole="link"
              accessibilityLabel={`IPC ${r.ipc}, BNS ${r.bns || "none"}. ${r.offence}`}
              onPress={() => router.push(`/ipc-bns/${r.ipc.toLowerCase()}` as Href)}
              style={({ pressed }) => ({ paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: p.line, gap: 4, backgroundColor: pressed ? p.line : "transparent" })}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: 112 }}>
                  <T v="label" tone="faint">IPC</T>
                  <T v="h2">{r.ipc}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T v="label" tone="faint">BNS</T>
                  <T v="h2">{r.bns || "—"}</T>
                </View>
              </View>
              <T v="small" tone="soft">{r.offence}</T>
              {r.note ? <T v="small" tone="faint">{r.note}</T> : null}
            </Pressable>
          ))
        )}
      </View>

      <T v="small" tone="faint">
        Short on purpose: some offences are left out because the tables disagree, for example rape (IPC 376). Confirm any entry against the Bureau of Police Research and Development's correspondence table or the Sanhita itself before you cite it. Checked {VERIFIED_ON}.
      </T>
      <Disclaimer />
    </Screen>
  );
}
