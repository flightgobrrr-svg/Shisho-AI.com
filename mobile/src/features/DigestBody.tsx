import { Linking, View } from "react-native";
import { Button, Card, Disclaimer, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { formatDate } from "@/ui/dates";
import type { DigestResult } from "@/api/endpoints";

/** The same sections, in the same order, as the website's digest page. */
const HEADER_FIELDS: [string, string][] = [
  ["Case number", "caseNumber"],
  ["Bench", "bench"],
  ["Date of judgment", "dateOfJudgment"],
  ["Nature of proceedings", "natureOfProceedings"],
  ["Result", "result"],
];

const SECTIONS: [string, string][] = [
  ["Headnote", "headnote"],
  ["Synopsis", "synopsis"],
  ["Important observations of the court", "importantObservations"],
  ["Ratio decidendi", "ratioDecidendi"],
  ["Judicial analysis", "judicialAnalysis"],
  ["Analogy", "analogy"],
  ["Result of the case", "resultOfCase"],
  ["Practical litigation application", "practicalLitigationApplication"],
  ["Practical test laid down", "practicalTestLaidDown"],
  ["Key takeaway", "keyTakeaway"],
  ["Final court principle", "finalCourtPrinciple"],
  ["Strongest citable point", "strongestCitablePoint"],
  ["One-line legal principle", "oneLineLegalPrinciple"],
  ["Ready reference note", "readyReferenceNote"],
];

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export function DigestBody({ result, savedAt }: { result: DigestResult; savedAt?: number }) {
  const p = usePalette();
  const d = result.digest;
  const demo = d.mode === "demo";
  const prepared =
    typeof d.generatedAt === "string" && !Number.isNaN(new Date(d.generatedAt).getTime())
      ? formatDate(new Date(d.generatedAt))
      : null;

  return (
    <View style={{ gap: space.md }}>
      <T v="title">{result.title}</T>
      {result.citation ? <T tone="soft">{result.citation}{result.court ? ` · ${result.court}` : ""}</T> : null}

      {demo ? (
        <Card>
          <T v="h3">Demo digest</T>
          <T v="small" tone="soft">
            No model was available to prepare this digest from the judgment's text, so there is no digest to show yet. Try again later, or read the judgment itself.
          </T>
        </Card>
      ) : null}
      {savedAt ? (
        <T v="small" tone="faint">Saved copy from {formatDate(new Date(savedAt))}. It refreshes when you are online.</T>
      ) : null}

      {demo ? null : HEADER_FIELDS.map(([label, key]) => {
        const v = text(d[key]);
        return v ? (
          <View key={key} style={{ gap: 2 }}>
            <T v="label" tone="indigo">{label}</T>
            <T>{v}</T>
          </View>
        ) : null;
      })}

      {demo ? null : SECTIONS.map(([heading, key]) => {
        const v = text(d[key]);
        return v ? (
          <View key={key} style={{ gap: 4, borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md }}>
            <T v="h3">{heading}</T>
            <T tone="soft" selectable>{v}</T>
          </View>
        ) : null;
      })}

      {demo ? null : (
        <T v="small" tone="faint">
          This digest is prepared by Shisho from the judgment's text{prepared ? ` on ${prepared}` : ""}: original analysis, not a published headnote. Read the judgment before you rely on it.
        </T>
      )}
      <Button label="Read the judgment on Indian Kanoon" variant="ghost" onPress={() => void Linking.openURL(result.sourceUrl)} />
      <Disclaimer />
    </View>
  );
}
