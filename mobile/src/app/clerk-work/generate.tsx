import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Field, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { SectionRule, StepMark } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk, pickClerkFile, type FormMap, type MatterSummary } from "@/api/clerk";
import { CASE_FIELDS, CLERK_WORK, OFFICE_WIDE_WORK, fieldLabel, getWork, serialLabel, type OutputFormat, type OutputLanguage } from "@/lib/clerkWork";
import { getService } from "@/lib/clerkServices";
import { indiaToday, parseIndianDate, showDate } from "@/lib/clerkRegisters";
import { ClerkForm, missingIn, type FormValues } from "@/features/clerkForm";
import { selectedOffice, useLoad } from "@/features/clerkUi";

/**
 * Quick Generate. Two inputs do the work: the clerical work serial number
 * (1–63) and the case. Then the blank form if the service fills one, the
 * service's own questions, a review of the particulars that go in, the
 * mapping of each blank, and the draft. The case serial number and the work
 * serial number are never mixed.
 */
const TARGETS = [...CASE_FIELDS.map((f) => ({ key: f.key as string, label: f.label })), { key: "filing_date", label: "Filing date" }, { key: "document_name", label: "Document name" }, { key: "blank", label: "Leave blank" }];

export default function QuickGenerate() {
  const params = useLocalSearchParams<{ matter?: string; office?: string; work?: string }>();
  const { value: savedOffice } = selectedOffice.use();
  const officeId = params.office ?? savedOffice ?? null;

  const [workNo, setWorkNo] = useState<number | null>(params.work && getWork(Number(params.work)) ? Number(params.work) : null);
  const [matterId, setMatterId] = useState<string | null>(params.matter ?? null);
  const [blankId, setBlankId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<FormValues>({});
  const [filingDate, setFilingDate] = useState(showDate(indiaToday()));
  const [documentName, setDocumentName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [format, setFormat] = useState<OutputFormat>("both");
  const [redact, setRedact] = useState(false);
  const [map, setMap] = useState<FormMap | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const work = workNo ? getWork(workNo) : undefined;
  const spec = workNo ? getService(workNo) : undefined;
  const officeWide = workNo ? OFFICE_WIDE_WORK.includes(workNo) : false;
  const fillsBlank = work && work.generator !== "typed";
  const sheet = useLoad(() => (matterId && !officeWide ? clerk.sheet(matterId) : Promise.resolve(null)), [matterId, officeWide]);
  const s = sheet.data;
  const blanks = (s?.uploads ?? []).filter((u) => u.kind === "blank_form");

  // A different service or form needs its blanks mapped again.
  useEffect(() => {
    setMap(null);
    setMapping({});
  }, [workNo, blankId, matterId]);

  // Pre-fill the service's questions from confirmed particulars.
  useEffect(() => {
    if (!spec) return setAnswers({});
    const next: FormValues = {};
    for (const f of spec.inputs) {
      if (f.key === "date" && officeWide) next.date = showDate(indiaToday());
      if (!f.from || !s) continue;
      const v = s.fields.find((x) => x.key === f.from && x.chosen)?.value;
      if (v) next[f.key] = f.type === "date" ? (parseIndianDate(v) ? showDate(parseIndianDate(v)!) : "") : v;
    }
    setAnswers(next);
    if (fillsBlank) setLanguage("en");
  }, [spec, s, officeWide, fillsBlank]);

  const needs = useMemo(() => {
    if (!work || !s) return [];
    return work.needs.map((k) => {
      const chosen = s.fields.find((f) => f.key === k && f.chosen);
      const state = s.conflicts.includes(k) ? "conflict" : !chosen ? "missing" : chosen.status === "unverified" ? "unverified" : "ok";
      return { key: k, value: chosen?.value ?? "", state };
    });
  }, [work, s]);
  const reviewed = officeWide || (needs.length > 0 ? needs.every((n) => n.state === "ok") : Boolean(work && s));
  const missingAnswers = spec ? missingIn(spec.inputs, answers) : [];
  const ready = Boolean(work) && (officeWide ? Boolean(officeId) : Boolean(s));

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
    }
  };

  const generate = () =>
    run("Preparing the draft…", async () => {
      const body = { workNo: work!.no, inputs: spec ? answers : undefined, uploadId: blankId ?? undefined, mapping: map ? mapping : undefined, filingDate, language, format, documentName: documentName || undefined, instructions: instructions || undefined, saveTemplate: Boolean(map && remember), redact };
      const r = officeWide ? await clerk.generateOffice(officeId!, body) : await clerk.generate(s!.matter.id, body);
      router.replace(`/clerk-work/document/${r.document.id}`);
    });

  return (
    <Screen>
      <T v="label" tone="indigo">Quick Generate</T>
      <T v="title" style={{ fontSize: 28, lineHeight: 34 }}>Two inputs, one paper.</T>

      <Step n={1} title="Clerical work serial number">
        <WorkPicker value={workNo} onChange={setWorkNo} />
      </Step>

      <Step n={2} title={officeWide ? "Office sheet" : "Case serial number, or a new case from its PDF"}>
        {officeWide ? (
          <T v="small" tone="soft">This sheet covers the whole office for a day, so no case is needed.</T>
        ) : s ? (
          <Card style={{ gap: 4 }}>
            <T v="h3">Case {serialLabel(s.matter.serial_no)} · {s.matter.case_label ?? "Not yet numbered"}</T>
            <T v="small" tone="soft">{s.matter.cause_title ?? "Papers not read yet"}</T>
            {!params.matter ? <TextButton label="Choose another case" onPress={() => { setMatterId(null); setBlankId(null); }} /> : null}
          </Card>
        ) : matterId ? (
          <ActivityIndicator />
        ) : officeId ? (
          <CasePicker
            office={officeId}
            onPick={(m) => setMatterId(m.id)}
            onNewFromPdf={() =>
              run("Opening the case and reading its papers. A long file can take a minute or two…", async () => {
                const picked = await pickClerkFile("case_data");
                if (picked.kind === "cancelled") return;
                if (picked.kind === "error") throw new Error(picked.message);
                const { matter } = await clerk.createMatter(officeId, {});
                const r = await clerk.upload(matter.id, "case_data", picked.file);
                setMatterId(matter.id);
                if (r.readError) setError(r.readError);
              })
            }
          />
        ) : (
          <Notice title="Choose an office first" body="Open Clerk Work and set up or pick your office." />
        )}
      </Step>

      {ready && fillsBlank && s ? (
        <Step n={3} title={work!.blankForm === "required" ? "Blank form PDF (required)" : "Blank form PDF (optional)"}>
          {work!.blankForm === "required" ? <T v="small" tone="soft">Upload the prescribed blank {work!.name.toLowerCase()} for this court, with its backside docket if it has one. Shisho fills it; it does not substitute a format.</T> : null}
          {work!.blankForm !== "required" && !blankId ? <T v="small" tone="soft">Without a blank, Shisho prepares the office docket on A4, with the registry space left empty.</T> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {blanks.map((b) => <Chip key={b.id} label={b.filename} selected={blankId === b.id} onPress={() => setBlankId(blankId === b.id ? null : b.id)} />)}
          </View>
          <Button
            label="Upload a blank form"
            variant="ghost"
            disabled={Boolean(busy)}
            onPress={() =>
              run("Uploading the blank form…", async () => {
                const picked = await pickClerkFile("blank_form");
                if (picked.kind === "cancelled") return;
                if (picked.kind === "error") throw new Error(picked.message);
                const r = await clerk.upload(s.matter.id, "blank_form", picked.file);
                await sheet.reload();
                setBlankId(r.upload.id);
              })
            }
          />
        </Step>
      ) : null}

      {ready && spec && spec.inputs.length ? (
        <Step n={3} title="The service's questions">
          <T v="small" tone="soft">{work!.rule}</T>
          <ClerkForm defs={spec.inputs} values={answers} onChange={setAnswers} />
          {missingAnswers.length ? <T v="small" tone="faint">Still needed: {missingAnswers.join(", ")}</T> : null}
        </Step>
      ) : null}

      {ready ? (
        <Step n={4} title="Details">
          {!officeWide ? <Field label="Filing / signing date" value={filingDate} onChangeText={setFilingDate} placeholder="DD-MM-YYYY, or leave empty" keyboardType="numbers-and-punctuation" /> : null}
          {work?.generator === "docket-front" || work?.generator === "docket-back" ? <Field label="Paper the docket covers" value={documentName} onChangeText={setDocumentName} placeholder="e.g. Written Statement, I.A. for injunction" /> : null}
          <Field label="Note for the file (optional)" value={instructions} onChangeText={setInstructions} multiline style={{ minHeight: 60, textAlignVertical: "top" }} />
          <T v="label" tone="indigo">Language</T>
          {fillsBlank ? (
            <T v="small" tone="soft">A court's own blank form is filled in the language it is printed in (English here).</T>
          ) : (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
                {(["en", "te", "bilingual"] as const).map((l) => <Chip key={l} label={l === "en" ? "English" : l === "te" ? "Telugu" : "English + Telugu"} selected={language === l} onPress={() => setLanguage(l)} />)}
              </View>
              {language !== "en" ? <T v="small" tone="faint">Translated by Claude after the English is prepared. Names, numbers, dates and citations stay as written. Check every line before use.</T> : null}
            </>
          )}
          <T v="label" tone="indigo">Format</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {(["both", "pdf", "docx"] as const).map((f) => <Chip key={f} label={f === "both" ? "Word and PDF" : f === "pdf" ? "PDF" : "Word (DOCX)"} selected={format === f} onPress={() => setFormat(f)} />)}
          </View>
          <Chip label={redact ? "✓ Mask Aadhaar, PAN and account numbers" : "Mask Aadhaar, PAN and account numbers"} selected={redact} onPress={() => setRedact(!redact)} />
        </Step>
      ) : null}

      {ready && !officeWide && s ? (
        <Step n={5} title="Review the particulars that go in">
          {needs.length === 0 ? <T v="small" tone="soft">This service does not take case particulars.</T> : null}
          {needs.map((n) => (
            <View key={n.key} style={{ gap: 1 }}>
              <T v="label" tone="faint">{fieldLabel(n.key)}</T>
              <T v="small" tone={n.state === "ok" ? "ink" : "seal"}>
                {n.state === "conflict" ? "Conflicting readings: choose one" : n.state === "missing" ? "Missing" : `${n.value || "Not available (blank)"}${n.state === "unverified" ? "  (not yet confirmed)" : ""}`}
              </T>
            </View>
          ))}
          {!reviewed ? <Button label="Review on the case sheet" variant="dark" onPress={() => router.push(`/clerk-work/case/${s.matter.id}`)} /> : <T v="small" tone="indigo">All confirmed.</T>}
        </Step>
      ) : null}

      {ready && reviewed ? (
        <Step n={6} title={blankId ? "Check where each value goes, then generate" : "Generate"}>
          {fillsBlank && work!.blankForm === "required" && !blankId ? (
            <T v="small" tone="seal">Choose or upload the blank form above.</T>
          ) : blankId && !map ? (
            <Button label={busy ? "Reading the form…" : "Find the blanks on the form"} variant="dark" disabled={Boolean(busy)} onPress={() => run("Reading the form…", async () => {
              const m = await clerk.mapForm(s!.matter.id, { uploadId: blankId, workNo: work!.no, filingDate, documentName });
              setMap(m);
              setMapping(Object.fromEntries(m.blanks.map((b) => [b.id, b.target])));
            })} />
          ) : (
            <>
              {map ? <MappingList map={map} mapping={mapping} setMapping={setMapping} sheetValues={Object.fromEntries((s?.fields ?? []).filter((f) => f.chosen).map((f) => [f.key, f.value]))} extra={{ filing_date: filingDate, document_name: documentName || work!.name }} /> : null}
              {map ? <Chip label={remember ? "✓ Remember this mapping for this form" : "Remember this mapping for this form"} selected={remember} onPress={() => setRemember(!remember)} /> : null}
              <Button label={busy ? "Preparing…" : "Prepare the draft"} disabled={Boolean(busy) || missingAnswers.length > 0} onPress={generate} />
            </>
          )}
        </Step>
      ) : null}

      {busy ? <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}><ActivityIndicator /><T v="small" tone="soft" style={{ flex: 1 }}>{busy}</T></View> : null}
      {error ? <T v="small" tone="seal">{error}</T> : null}
    </Screen>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <SectionRule />
      <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <StepMark n={n} />
        <T v="h3" style={{ flex: 1 }}>{title}</T>
      </View>
      {children}
    </View>
  );
}

function WorkPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  const [q, setQ] = useState("");
  const chosen = value ? getWork(value) : undefined;
  if (chosen) {
    return (
      <Card style={{ gap: 4 }}>
        <T v="h3">{chosen.no}. {chosen.name}</T>
        <T v="small" tone="soft">{chosen.rule}</T>
        <TextButton label="Change" onPress={() => onChange(null)} />
      </Card>
    );
  }
  const t = q.trim().toLowerCase();
  const list = CLERK_WORK.filter((w) => !t || String(w.no) === t || w.name.toLowerCase().includes(t));
  return (
    <View style={{ gap: space.sm }}>
      <Field label="Number 1–63 or name" value={q} onChangeText={setQ} placeholder="60, or vakalat" autoCapitalize="none" />
      <View>
        {list.slice(0, t ? 63 : 12).map((w) => <Row key={w.no} title={`${w.no}. ${w.name}`} detail={w.area} onPress={() => onChange(w.no)} />)}
      </View>
      {!t ? <T v="small" tone="faint">Type to search all 63.</T> : null}
    </View>
  );
}

function CasePicker({ office, onPick, onNewFromPdf }: { office: string; onPick: (m: MatterSummary) => void; onNewFromPdf: () => void }) {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);
  const matters = useLoad(() => clerk.matters(office, query).then((r) => r.matters), [office, query]);
  return (
    <View style={{ gap: space.sm }}>
      <Button label="New case from its PDF" variant="ghost" onPress={onNewFromPdf} />
      <Field label="Case serial no., case no., CNR or party" value={q} onChangeText={setQ} autoCapitalize="none" placeholder="7" />
      {matters.loading && !matters.data ? <ActivityIndicator /> : null}
      <View>
        {(matters.data ?? []).slice(0, 15).map((m) => <Row key={m.id} title={`${serialLabel(m.serial_no)} · ${m.case_label ?? "Not yet numbered"}`} detail={m.cause_title ?? undefined} onPress={() => onPick(m)} />)}
      </View>
    </View>
  );
}

function MappingList({ map, mapping, setMapping, sheetValues, extra }: { map: FormMap; mapping: Record<string, string>; setMapping: (m: Record<string, string>) => void; sheetValues: Record<string, string>; extra: Record<string, string> }) {
  const p = usePalette();
  const [open, setOpen] = useState<string | null>(null);
  const filledCount = map.blanks.filter((b) => !b.protected && mapping[b.id] !== "blank").length;
  return (
    <View style={{ gap: space.sm }}>
      <T v="small" tone="soft">
        {map.blanks.length} blanks on {map.pages} page{map.pages === 1 ? "" : "s"}; {filledCount} will be filled. {map.hasDocket ? "The form has its own docket page." : "The backside docket will be added."}
        {map.template ? ` Using your saved mapping (version ${map.template.version}).` : ""}
      </T>
      {map.blanks.map((b) => {
        const target = mapping[b.id] ?? "blank";
        const value = target === "blank" ? "" : (extra[target] ?? sheetValues[target] ?? "");
        return (
          <View key={b.id} style={{ borderLeftWidth: 3, borderLeftColor: b.protected ? p.line : target === "blank" ? p.lineStrong : p.indigo, paddingLeft: space.md, gap: 2 }}>
            <T v="small" tone="faint">Page {b.page} · &ldquo;{b.label || "…"}&rdquo;{b.after ? ` … ${b.after}` : ""}</T>
            {b.protected ? (
              <T v="small" tone="soft">Kept blank: signature, seal, attestation or court-use space</T>
            ) : (
              <>
                <T v="small">{TARGETS.find((x) => x.key === target)?.label ?? target}{value ? `: ${value}` : target === "blank" ? "" : ": (no confirmed value; stays blank)"}</T>
                <TextButton label={open === b.id ? "Done" : "Change"} onPress={() => setOpen(open === b.id ? null : b.id)} />
                {open === b.id ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {TARGETS.map((x) => <Chip key={x.key} label={x.label} selected={target === x.key} onPress={() => { setMapping({ ...mapping, [b.id]: x.key }); setOpen(null); }} />)}
                  </View>
                ) : null}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
