import { useState, type ReactNode } from "react";
import { View, type ImageSourcePropType } from "react-native";
import { Button, Card, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space } from "@/ui/theme";
import { PageHeader } from "@/ui/web";
import { ApiError, apiConfigured, describeError } from "@/api/client";
import { runTool } from "@/api/endpoints";
import { formatSize, pickAttachment, type Attachment } from "@/features/attachments";
import { ToolOutputView, toolText } from "@/features/ToolResults";
import { saveResult } from "@/state/tools";
import { copyText, shareText } from "@/ui/share";
import { FREE_MONTHLY_TOOL_RUNS, type ToolId, type ToolInput, type ToolResult } from "@/lib/toolTypes";

/**
 * The frame every Shisho tool shares: the page's opening, the tool's own
 * fields, an optional attachment, Run, then the answer with copy, share and
 * save. Results are saved on this phone only. A trial plan's remaining runs
 * are shown after each answer, and running out says so with a way to a plan.
 */
export function ToolRunner<T extends ToolId>({
  tool,
  eyebrow,
  headline,
  intro,
  children,
  build,
  acceptsFile,
  saveTitle,
  runLabel = "Run",
  footer,
  photo,
}: {
  tool: T;
  eyebrow: string;
  headline: string;
  intro: string;
  children: ReactNode;
  /** The tool's input from the fields, or a message saying what is missing. */
  build: (hasFile: boolean) => ToolInput[T] | string;
  acceptsFile?: boolean;
  saveTitle: (result: ToolResult<T>) => string;
  runLabel?: string;
  footer?: ReactNode;
  /** A picture for the top of the page. */
  photo?: ImageSourcePropType;
}) {
  const [file, setFile] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfRuns, setOutOfRuns] = useState(false);
  const [result, setResult] = useState<ToolResult<T> | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const attach = async () => {
    setError(null);
    const r = await pickAttachment();
    if (r.kind === "ok") setFile(r.attachment);
    else if (r.kind === "error") setError(r.message);
  };

  const run = async () => {
    setError(null);
    setOutOfRuns(false);
    const input = build(Boolean(file));
    if (typeof input === "string") {
      setError(input);
      return;
    }
    setBusy(true);
    setSaved(false);
    try {
      const payload = file ? { ...input, file: { filename: file.filename, mimeType: file.mimeType, dataBase64: file.dataBase64 } } : input;
      setResult(await runTool(tool, payload as ToolInput[T]));
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) setOutOfRuns(true);
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      {photo ? <FadedPhoto source={photo} height={180} /> : null}
      <PageHeader eyebrow={eyebrow} headline={headline} intro={intro} />
      {!apiConfigured ? (
        <Notice title="Needs Shisho's online service" body="This build is not connected to it, so the tool cannot run here." />
      ) : null}

      {children}

      {acceptsFile ? (
        file ? (
          <Card>
            <T v="label" tone="indigo">Attached</T>
            <T v="small">{file.filename} · {formatSize(file.size)}</T>
            <TextButton label="Remove" onPress={() => setFile(null)} />
          </Card>
        ) : (
          <Button label="Attach a file (PDF, Word, text or photo)" variant="ghost" onPress={attach} />
        )
      ) : null}

      {error ? <T tone="seal" accessibilityLiveRegion="polite">{error}</T> : null}
      {outOfRuns ? <Button label="See plans" href="/pricing" variant="ghost" /> : null}
      <Button label={busy ? "Working… this can take a minute" : runLabel} onPress={run} disabled={busy || !apiConfigured} />

      {result ? (
        <View style={{ gap: space.lg, marginTop: space.lg }} accessibilityLiveRegion="polite">
          <ToolOutputView result={result} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            <Button label={copied ? "Copied" : "Copy"} variant="ghost" onPress={async () => { await copyText(toolText(result)); setCopied(true); setTimeout(() => setCopied(false), 1500); }} />
            <Button label="Share" variant="ghost" onPress={() => shareText(toolText(result))} />
            <Button label={saved ? "Saved on this phone" : "Save"} variant="dark" disabled={saved} onPress={() => { saveResult(saveTitle(result), result); setSaved(true); }} />
          </View>
          {result.remaining !== null ? (
            <T v="small" tone="faint">
              {result.remaining} of {FREE_MONTHLY_TOOL_RUNS} free runs left this month, shared by every tool.
            </T>
          ) : null}
        </View>
      ) : null}

      <Row title="Saved results" detail="Everything you saved from the tools, on this phone" href="/tools/saved" />
      {footer}
      <T v="small" tone="faint">Educational assistance, not legal advice. Check every authority against its source before you rely on it.</T>
    </Screen>
  );
}
