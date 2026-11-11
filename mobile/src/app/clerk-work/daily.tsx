import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Chip, Field, Row, Screen, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { DRAFT_LABEL, can, type OutputLanguage, type Role } from "@/lib/clerkWork";
import { indiaToday, showDate } from "@/lib/clerkRegisters";
import { selectedOffice, useLoad, when, workTitle } from "@/features/clerkUi";

/**
 * Daily court work and reports: the office-wide sheets, each prepared from the
 * case records, tasks and registers for the chosen day.
 */
const SHEETS = [
  { no: 23, blurb: "Court-wise and case serial number-wise, with the day's work under Before / During / After Court, Evening and Tomorrow." },
  { no: 12, blurb: "Matters listed for the day, item numbers left for the court's own list." },
  { no: 57, blurb: "Next working day: matters, clients and witnesses, work to finish." },
  { no: 24, blurb: "What was done, hearing results entered, what is still open, expenses." },
  { no: 47, blurb: "Every open task, case serial number-wise." },
  { no: 22, blurb: "The day's spend against the advance, receipts flagged." },
];

export default function Daily() {
  const params = useLocalSearchParams<{ office?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const info = useLoad(() => clerk.office(office).then((r) => r.office), [office]);
  const role: Role = info.data?.role ?? "read_only";
  const docs = useLoad(() => clerk.officeDocuments(office).then((r) => r.documents), [office]);
  const [date, setDate] = useState(showDate(indiaToday()));
  const [advance, setAdvance] = useState("");
  const [urgent, setUrgent] = useState("");
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const make = async (no: number) => {
    setBusy(no);
    setError(null);
    try {
      const inputs: Record<string, string> = { date };
      if (no === 22) inputs.advance = advance || "0";
      if (no === 24 && urgent.trim()) inputs.urgent = urgent.trim();
      const r = await clerk.generateOffice(office, { workNo: no, inputs, language, format: "both" });
      router.push(`/clerk-work/document/${r.document.id}`);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Daily court work and reports</T>
      <Field label="For the day" value={date} onChangeText={setDate} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {(["en", "te", "bilingual"] as const).map((l) => <Chip key={l} label={l === "en" ? "English" : l === "te" ? "Telugu" : "English + Telugu"} selected={language === l} onPress={() => setLanguage(l)} />)}
      </View>
      {can(role, "prepare") ? (
        SHEETS.map((s) => (
          <View key={s.no} style={{ gap: space.sm, marginTop: space.sm }}>
            <T v="h3">{workTitle(s.no)}</T>
            <T v="small" tone="soft">{s.blurb}</T>
            {s.no === 22 ? <Field label="Opening advance (₹)" value={advance} onChangeText={setAdvance} keyboardType="decimal-pad" /> : null}
            {s.no === 24 ? <Field label="Urgent follow-up for tomorrow (optional)" value={urgent} onChangeText={setUrgent} multiline /> : null}
            <Button label={busy === s.no ? "Preparing…" : "Prepare this sheet"} variant="ghost" disabled={busy !== null} onPress={() => make(s.no)} />
          </View>
        ))
      ) : (
        <T v="small" tone="soft">Your role can read these sheets; preparing them needs a clerk, junior or advocate role.</T>
      )}
      {busy !== null ? <ActivityIndicator /> : null}
      {error ? <T v="small" tone="seal">{error}</T> : null}

      <SectionRule />
      <T v="h2">Prepared sheets</T>
      {docs.data?.length === 0 ? <T v="small" tone="soft">None yet.</T> : null}
      {(docs.data ?? []).map((d) => <Row key={d.id} title={`${workTitle(d.work_no)} · v${d.version}`} detail={`${d.status === "draft" ? DRAFT_LABEL : "Ready for Execution"} · ${when(d.created_at)}`} href={`/clerk-work/document/${d.id}`} />)}
    </Screen>
  );
}
