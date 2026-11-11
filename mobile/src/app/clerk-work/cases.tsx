import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Field, Row, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { can, serialLabel, type Role } from "@/lib/clerkWork";
import { showDate } from "@/lib/clerkRegisters";
import { selectedOffice, useLoad } from "@/features/clerkUi";

/** The case register: searchable, serial number-wise, with a way to open a new case. */
export default function Cases() {
  const params = useLocalSearchParams<{ office?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const info = useLoad(() => clerk.office(office).then((r) => r.office), [office]);
  const role: Role = info.data?.role ?? "read_only";
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);
  const matters = useLoad(() => clerk.matters(office, query).then((r) => r.matters), [office, query]);
  const [creating, setCreating] = useState(false);
  const [fileCode, setFileCode] = useState("");
  const [parent, setParent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const { matter } = await clerk.createMatter(office, { fileCode: fileCode.trim() || undefined, parentSerial: parent.trim() || undefined });
      setCreating(false);
      setFileCode("");
      setParent("");
      router.push(`/clerk-work/case/${matter.id}`);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Case register</T>
      <Field label="Search" value={q} onChangeText={setQ} placeholder="Serial no., case no., CNR, party, advocate, court, date" autoCapitalize="none" returnKeyType="search" />
      {can(role, "prepare") ? (
        creating ? (
          <View style={{ gap: space.md }}>
            <Field label="Office file code (optional)" value={fileCode} onChangeText={setFileCode} placeholder="e.g. CIV/2025/031" autoCapitalize="characters" />
            <Field label="Connected to case serial no. (optional)" value={parent} onChangeText={setParent} placeholder="For an IA, EA, appeal or revision" keyboardType="number-pad" />
            <T v="small" tone="soft">The new case gets the next case serial number in this office. It never changes, and it is not the court's case number.</T>
            {error ? <T v="small" tone="seal">{error}</T> : null}
            <Button label={busy ? "Opening…" : "Open the case"} variant="dark" disabled={busy} onPress={create} />
            <TextButton label="Cancel" onPress={() => setCreating(false)} />
          </View>
        ) : (
          <Button label="Open a new case" variant="ghost" onPress={() => setCreating(true)} />
        )
      ) : null}
      {matters.loading && !matters.data ? <ActivityIndicator /> : null}
      {matters.error ? <T v="small" tone="seal">{matters.error}</T> : null}
      {matters.data?.length === 0 ? <T v="small" tone="soft">{query ? `No case matches "${query}".` : "No cases yet. Open one and upload its papers."}</T> : null}
      <View>
        {(matters.data ?? []).map((m) => (
          <Row
            key={m.id}
            title={`${serialLabel(m.serial_no)} · ${m.case_label ?? "Not yet numbered"}${m.restricted ? " · restricted" : ""}`}
            detail={[m.cause_title ?? "Papers not read yet", m.court, m.next_hearing_on ? `Next: ${showDate(m.next_hearing_on)}` : m.next_hearing ? `Next: ${m.next_hearing}` : null, m.file_code].filter(Boolean).join(" · ")}
            href={`/clerk-work/case/${m.id}`}
          />
        ))}
      </View>
    </Screen>
  );
}
