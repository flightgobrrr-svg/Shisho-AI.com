import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Notice, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { serialLabel } from "@/lib/clerkWork";
import { selectedOffice, useLoad, when } from "@/features/clerkUi";

/** Administration: deleted cases (restore, or remove for good after the retention period) and record keeping. */
const PERIODS: { label: string; days: number | null }[] = [
  { label: "Until removed by hand", days: null },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
  { label: "3 years", days: 1095 },
  { label: "7 years", days: 2555 },
];

export default function Admin() {
  const params = useLocalSearchParams<{ office?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const info = useLoad(() => clerk.office(office).then((r) => r.office), [office]);
  const deleted = useLoad(() => clerk.deleted(office), [office]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if ((info.loading && !info.data) || (deleted.loading && !deleted.data)) return <Screen><ActivityIndicator /></Screen>;
  if (deleted.error) return <Screen><Notice title="Administration" body={deleted.error} /></Screen>;
  const admin = info.data?.role === "office_admin";
  const days = deleted.data?.retentionDays ?? null;

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      await Promise.all([deleted.reload(), info.reload()]);
    } catch (e) {
      setMsg(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Administration</T>
      <T v="h2">Record keeping</T>
      <T v="small" tone="soft">How long a deleted case is kept before the administrator may remove it for good. Until then it can be restored with everything in it.</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {PERIODS.map((pd) => <Chip key={pd.label} label={pd.label} selected={days === pd.days} onPress={admin && !busy ? () => run(() => clerk.setRetention(office, pd.days), "Saved.") : undefined} />)}
      </View>
      {!admin ? <T v="small" tone="faint">Only the administrator changes this.</T> : null}

      <SectionRule />
      <T v="h2">Deleted cases</T>
      {deleted.data?.matters.length === 0 ? <T v="small" tone="soft">None.</T> : null}
      {(deleted.data?.matters ?? []).map((m) => {
        const purgeable = days === null || Date.now() - new Date(m.deleted_at).getTime() >= days * 86_400_000;
        return (
          <Card key={m.id} style={{ gap: 4 }}>
            <T v="h3" style={{ fontSize: 16 }}>{serialLabel(m.serial_no)} · {m.case_label ?? "Not yet numbered"}</T>
            <T v="small" tone="soft">{m.cause_title ?? ""}</T>
            <T v="small" tone="faint">Deleted {when(m.deleted_at)}</T>
            <View style={{ flexDirection: "row", gap: space.lg, flexWrap: "wrap" }}>
              <TextButton label="Restore" onPress={() => run(() => clerk.restore(m.id), "Restored.")} />
              {admin && purgeable ? (
                <TextButton
                  label="Remove for good"
                  onPress={() =>
                    Alert.alert("Remove this case for good?", "Its papers, generated documents, registers and tasks are deleted permanently. This cannot be undone.", [
                      { text: "Keep it", style: "cancel" },
                      { text: "Remove", style: "destructive", onPress: () => run(() => clerk.restore(m.id, "purge"), "Removed.") },
                    ])
                  }
                />
              ) : null}
            </View>
          </Card>
        );
      })}
      {msg ? <T v="small" tone="soft">{msg}</T> : null}
      {busy ? <ActivityIndicator /> : null}
      <Button label="Members and roles" variant="ghost" href={`/clerk-work/members?office=${office}`} />
    </Screen>
  );
}
