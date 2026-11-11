import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Button, Card, Notice, Row, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk, shareDocument } from "@/api/clerk";
import { DRAFT_LABEL, can, fieldLabel, getWork, isFieldKey, serialLabel } from "@/lib/clerkWork";
import { getService } from "@/lib/clerkServices";
import { showDate } from "@/lib/clerkRegisters";
import { confidenceTag, documentStatusTag, useLoad, when, workTitle } from "@/features/clerkUi";

/**
 * One generated document: share the PDF or Word file, see exactly what went in
 * and from where, what was left blank and why, the service's own warnings, and
 * (for an advocate) approve it as ready for execution. Approval does not sign,
 * file or serve anything.
 */
const label = (t: string) => (isFieldKey(t) ? fieldLabel(t) : t === "filing_date" ? "Filing date" : t === "document_name" ? "Document name" : t);
const LANG: Record<string, string> = { en: "English", te: "Telugu", bilingual: "English and Telugu" };

export default function DocumentScreen() {
  const p = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doc = useLoad(() => clerk.document(id!), [id]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (doc.loading && !doc.data) return <Screen><ActivityIndicator /></Screen>;
  if (doc.error || !doc.data) return <Screen><Notice title="Could not open the document" body={doc.error ?? ""} /></Screen>;
  const { document: d, matter, versions, role } = doc.data;
  const r = d.report;
  const spec = getService(d.workNo);

  const share = async (kind: "pdf" | "docx", name: string) => {
    setBusy(kind);
    setError(null);
    try {
      await shareDocument(d.id, kind, name);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
      void doc.reload();
    }
  };

  const approve = () =>
    Alert.alert(
      "Approve as ready for execution?",
      "You confirm you have checked every particular against the source papers. The document stays unsigned; it is not filed or executed by this.",
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setBusy("approve");
            setError(null);
            try {
              await clerk.approve(d.id);
              await doc.reload();
            } catch (e) {
              setError(describeError(e));
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );

  const answers = spec ? spec.inputs.filter((f) => d.inputs[f.key] !== undefined && d.inputs[f.key] !== "") : [];

  return (
    <Screen>
      <Stack.Screen options={{ title: `${getWork(d.workNo)?.name ?? "Document"} v${d.version}` }} />
      <T v="label" tone="indigo">{matter ? `Case ${serialLabel(matter.serial_no)} · ${matter.case_label ?? "Not yet numbered"}` : "Office sheet"}</T>
      <T v="title" style={{ fontSize: 26, lineHeight: 32 }}>{workTitle(d.workNo)}</T>
      {documentStatusTag(d.status)}
      <T v="small" tone="soft">
        Version {d.version} · {LANG[d.options.language ?? "en"] ?? "English"}{d.options.redact ? " · ID numbers masked" : ""} · generated {when(d.createdAt)} by {d.createdBy || "a member"}
        {d.approvedAt ? ` · approved ${when(d.approvedAt)} by ${d.approvedBy || "an advocate"}` : ""}
      </T>

      <View style={{ gap: space.sm }}>
        {d.pdfName ? <Button label={busy === "pdf" ? "Preparing…" : "Open or share the PDF"} disabled={Boolean(busy)} onPress={() => share("pdf", d.pdfName!)} /> : null}
        {d.docxName ? <Button label={busy === "docx" ? "Preparing…" : "Open or share the Word file"} variant="ghost" disabled={Boolean(busy)} onPress={() => share("docx", d.docxName!)} /> : null}
        <T v="small" tone="faint">{[d.pdfName, d.docxName].filter(Boolean).join("  ·  ")}</T>
      </View>

      {d.status === "draft" ? (
        can(role, "approve") ? (
          <Button label={busy === "approve" ? "Approving…" : "Approve as ready for execution"} variant="dark" disabled={Boolean(busy)} onPress={approve} />
        ) : (
          <T v="small" tone="soft">This is a {DRAFT_LABEL}. An advocate or the office administrator approves it.</T>
        )
      ) : (
        <T v="small" tone="soft">Ready for execution. Any signature, identification, acceptance or attestation it needs is still to be done by hand.</T>
      )}
      {error ? <T v="small" tone="seal">{error}</T> : null}

      {r.warnings?.length ? (
        <Card style={{ gap: 4, borderColor: p.seal }}>
          <T v="h3" style={{ fontSize: 16 }}>Check before use</T>
          {r.warnings.map((w) => <T key={w} v="small">{w}</T>)}
        </Card>
      ) : null}
      {r.unprintable.length ? (
        <Card><T v="small" tone="seal">Some characters could not be printed in the PDF ({r.unprintable.join(" ")}). The Word file has them; check before printing.</T></Card>
      ) : null}

      {answers.length ? (
        <>
          <SectionRule />
          <T v="h2">Answers it was prepared from</T>
          {answers.map((f) => {
            const v = d.inputs[f.key];
            return (
              <View key={f.key} style={{ gap: 2 }}>
                <T v="label" tone="faint">{f.label}</T>
                {Array.isArray(v) ? v.map((row, k) => <T key={k} v="small">{k + 1}. {row.filter(Boolean).join(" · ")}</T>) : <T v="small">{f.type === "date" ? showDate(v) : v}</T>}
              </View>
            );
          })}
        </>
      ) : null}

      {r.sources.length ? (
        <>
          <SectionRule />
          <T v="h2">Case particulars used</T>
          <T v="small" tone="soft">{r.pageCount} page{r.pageCount === 1 ? "" : "s"}{r.docketAdded ? ", including the backside docket" : ""}{r.continued.length ? `, with a continuation sheet for ${r.continued.length} long entr${r.continued.length === 1 ? "y" : "ies"}` : ""}.</T>
          {r.sources.map((s) => (
            <View key={s.field} style={{ gap: 2 }}>
              <T v="label" tone="faint">{label(s.field)}</T>
              <T v="small">{s.value || "(blank)"}</T>
              <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap", alignItems: "center" }}>
                <T v="small" tone="faint">{s.source}{s.page ? `, page ${s.page}` : ""} · {s.status === "corrected" ? "corrected" : s.status === "confirmed" ? "confirmed" : "unverified"}</T>
                {confidenceTag(s.confidence as never)}
              </View>
            </View>
          ))}
        </>
      ) : null}

      {r.leftBlank.length ? (
        <>
          <SectionRule />
          <T v="h2">Left blank on the form</T>
          {r.leftBlank.map((b) => <T key={b.id} v="small" tone="soft">Page {b.page} · &ldquo;{b.label || "…"}&rdquo;: {b.why}</T>)}
        </>
      ) : null}

      {versions.length > 1 ? (
        <>
          <SectionRule />
          <T v="h2">Versions</T>
          {versions.map((v) => (
            <Row key={v.id} title={`Version ${v.version}`} detail={`${v.status === "draft" ? DRAFT_LABEL : "Ready for Execution"} · ${when(v.created_at)}`} onPress={v.id === d.id ? undefined : () => router.replace(`/clerk-work/document/${v.id}`)} />
          ))}
        </>
      ) : null}
      {matter ? <Row title="Back to the case sheet" href={`/clerk-work/case/${matter.id}`} /> : <Row title="Daily court work and reports" onPress={() => router.push({ pathname: "/clerk-work/daily", params: { office: doc.data!.officeId } })} />}
    </Screen>
  );
}
