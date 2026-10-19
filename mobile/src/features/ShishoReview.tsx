import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Field, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { copyText, shareText } from "@/ui/share";
import { ApiError, describeError } from "@/api/client";
import { reviewDraft, type Annotation } from "@/api/endpoints";
import { DOC_TYPES, DOC_TYPE_LABELS, MAX_DRAFT_CHARS, type DocType } from "@/lib/draft";

const SEVERITY: Record<Annotation["severity"], string> = {
  "must-fix": "Must fix",
  consider: "Consider",
  good: "Good",
};

function asText(draftType: string, notes: Annotation[]) {
  const lines = notes.map(
    (n, i) =>
      `${i + 1}. ${SEVERITY[n.severity]}: "${n.anchor.replace(/\s+/g, " ").trim()}"\n${n.note}${n.authority ? `\n${n.authority}` : ""}`,
  );
  return `Shisho notes on a ${draftType}\n\n${lines.join("\n\n")}\n\nShisho AI provides drafting assistance, not legal advice. Check every provision against its source before you file.`;
}

export function ShishoReview() {
  const p = usePalette();
  const [draft, setDraft] = useState("");
  const [docType, setDocType] = useState<DocType>("plaint");
  const [notes, setNotes] = useState<Annotation[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(false);
  const [onlyMustFix, setOnlyMustFix] = useState(false);
  const [copied, setCopied] = useState(false);

  const tooShort = draft.trim().length < 40;

  async function run() {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const r = await reviewDraft(draft, docType);
      setNotes(r.annotations);
      setDemo(r.mode === "demo");
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) setLimit(true);
      else setError(describeError(e));
    } finally {
      setBusy(false);
    }
  }

  if (limit) {
    return (
      <Card>
        <T v="h3">You have used this month's free reviews</T>
        <T v="small" tone="soft">The free plan includes five reviews a month. Plans are on the website.</T>
        <Button label="Back" variant="ghost" onPress={() => setLimit(false)} />
      </Card>
    );
  }

  const shown = notes ? notes.filter((n) => !onlyMustFix || n.severity === "must-fix") : null;
  const mustFix = notes?.filter((n) => n.severity === "must-fix").length ?? 0;

  return (
    <View style={{ gap: space.md }}>
      <T tone="soft">Paste a draft and Shisho marks it clause by clause, naming the Indian provision each note rests on.</T>

      <T v="label" tone="indigo">Document type</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {DOC_TYPES.map((t) => (
          <Chip key={t} label={DOC_TYPE_LABELS[t]} selected={t === docType} onPress={() => setDocType(t)} />
        ))}
      </View>

      <Field
        label="Your draft"
        value={draft}
        onChangeText={(t) => setDraft(t.slice(0, MAX_DRAFT_CHARS))}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        style={{ minHeight: 220, fontFamily: undefined }}
        placeholder="Paste your plaint, notice, application or contract here"
      />
      <T v="small" tone="faint">
        {draft.length.toLocaleString()} of {MAX_DRAFT_CHARS.toLocaleString()} characters
      </T>

      {error ? <T tone="seal" accessibilityLiveRegion="polite">{error}</T> : null}
      <Button label={busy ? "Reading your draft…" : "Ask Shisho"} variant="dark" disabled={busy || tooShort} onPress={run} />
      {tooShort && draft.length > 0 ? <T v="small" tone="faint">Paste a little more of the draft first.</T> : null}

      {notes ? (
        <View style={{ gap: space.md }} accessibilityLiveRegion="polite">
          <T v="label" tone="indigo">Shisho notes ({notes.length})</T>
          {demo ? (
            <T v="small" tone="faint">
              Demo mode: these come from a small set of sample patterns, not from reading your draft.
            </T>
          ) : null}
          <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
            {notes.length > 1 ? (
              <Chip
                label={onlyMustFix ? "Show all notes" : `Only must-fix (${mustFix})`}
                selected={onlyMustFix}
                onPress={() => setOnlyMustFix((v) => !v)}
              />
            ) : null}
            <Chip
              label={copied ? "Copied" : "Copy notes"}
              onPress={async () => {
                await copyText(asText(DOC_TYPE_LABELS[docType], notes));
                setCopied(true);
              }}
            />
            <Chip label="Share" onPress={() => void shareText(asText(DOC_TYPE_LABELS[docType], notes))} />
          </View>
          {shown?.length === 0 ? <T tone="soft">No notes on this draft.</T> : null}
          {shown?.map((n) => (
            <Card key={n.id}>
              <T v="label" tone={n.severity === "must-fix" ? "seal" : "faint"}>{SEVERITY[n.severity]}</T>
              <T v="mono" tone="faint">“{n.anchor.replace(/\s+/g, " ").trim().slice(0, 90)}”</T>
              <T>{n.note}</T>
              {n.authority ? <T v="label" tone="indigo">{n.authority}</T> : null}
            </Card>
          ))}
          <T v="small" tone="faint" style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md }}>
            Shisho AI provides drafting assistance, not legal advice. Your draft is sent to an AI provider and is not saved by Shisho.
          </T>
        </View>
      ) : null}
    </View>
  );
}
