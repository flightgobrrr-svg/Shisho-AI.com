import { useRef, useState } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Field, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { copyText, shareText } from "@/ui/share";
import { ApiError, describeError } from "@/api/client";
import { askShisho, type ChatTurn } from "@/api/endpoints";
import { formatSize, pickAttachment, type Attachment } from "@/features/attachments";

const MAX_MESSAGE_CHARS = 4_000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CHARS = 24_000;

const STARTERS = [
  "Draft a Section 138 cheque-bounce notice",
  "Draft a bail application for a first-time accused",
  "Draft a plaint for recovery of money due under a contract",
  "Prepare me for tomorrow's hearing on an interim injunction",
];

type Bubble = ChatTurn & { draft?: string | null; attached?: string };

/** Keep the conversation within the same limits the website enforces. */
function trimHistory(turns: ChatTurn[]): ChatTurn[] {
  let kept = turns.slice(-MAX_HISTORY_MESSAGES);
  while (kept.length > 1 && kept.reduce((n, t) => n + t.content.length, 0) > MAX_HISTORY_CHARS) {
    kept = kept.slice(1);
  }
  return kept;
}

/** `initialInput` starts the message box with a prompt, e.g. for hearing prep. */
export function ShishoChat({ initialInput = "" }: { initialInput?: string }) {
  const p = usePalette();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState(initialInput);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(false);
  const [demo, setDemo] = useState(false);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [picking, setPicking] = useState(false);

  async function attach() {
    setPicking(true);
    setError(null);
    const r = await pickAttachment();
    setPicking(false);
    if (r.kind === "ok") setAttachment(r.attachment);
    else if (r.kind === "error") setError(r.message);
  }
  const lastText = useRef("");

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    if (content.length > MAX_MESSAGE_CHARS) {
      setError(`That message is too long. Keep it under ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`);
      return;
    }
    lastText.current = content;
    setError(null);
    setSending(true);
    const file = attachment;
    const next: Bubble[] = [...bubbles, { role: "user", content, attached: file?.filename }];
    setBubbles(next);
    setInput("");
    try {
      const reply = await askShisho(
        trimHistory(next.map(({ role, content: c }) => ({ role, content: c }))),
        file ? { filename: file.filename, mimeType: file.mimeType, dataBase64: file.dataBase64 } : undefined,
      );
      setAttachment(null);
      setDemo(reply.mode === "demo");
      setBubbles([...next, { role: "assistant", content: reply.reply, draft: reply.draft }]);
    } catch (e) {
      // Take the failed message back out of the box so nothing the user typed is lost.
      setBubbles(bubbles);
      setInput(content);
      if (e instanceof ApiError && e.status === 402) setLimit(true);
      else setError(describeError(e));
    } finally {
      setSending(false);
    }
  }

  if (limit) {
    return (
      <Card>
        <T v="h3">You have used this month's free messages</T>
        <T v="small" tone="soft">
          The free plan includes five Shisho messages a month. Plans are on the website. Your earlier replies are still on screen.
        </T>
        <Button label="Back to the conversation" variant="ghost" onPress={() => setLimit(false)} />
      </Card>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      {bubbles.length === 0 ? (
        <>
          <T tone="soft">Describe the facts, or pick a starting point. Shisho asks for what it needs, then drafts.</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {STARTERS.map((s) => (
              <Chip key={s} label={s} onPress={() => setInput(s)} />
            ))}
          </View>
        </>
      ) : null}

      {bubbles.map((b, i) => (
        <View key={i} style={{ gap: space.sm }}>
          <View
            style={{
              alignSelf: b.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "92%",
              padding: space.md,
              borderWidth: 1,
              borderColor: p.line,
              backgroundColor: b.role === "user" ? p.raised : "transparent",
            }}
          >
            <T v="label" tone="faint">{b.role === "user" ? "You" : "Shisho"}</T>
            <T selectable>{b.content}</T>
            {b.attached ? <T v="small" tone="faint">Attached: {b.attached}</T> : null}
          </View>
          {b.draft ? (
            <Card>
              <T v="label" tone="indigo">Draft</T>
              <T v="mono" selectable>{b.draft}</T>
              <View style={{ flexDirection: "row", gap: space.md, flexWrap: "wrap" }}>
                <Button
                  label={copiedAt === i ? "Copied" : "Copy draft"}
                  variant="ghost"
                  onPress={async () => {
                    await copyText(b.draft!);
                    setCopiedAt(i);
                  }}
                />
                <Button label="Share" variant="ghost" onPress={() => void shareText(b.draft!)} />
              </View>
              <T v="small" tone="faint">Read it in full and check every provision before you file.</T>
            </Card>
          ) : null}
        </View>
      ))}

      {sending ? (
        <T tone="soft" accessibilityLiveRegion="polite">{attachment ? "Reading your file and drafting. This can take up to a minute." : "Drafting. This usually takes 15 to 25 seconds."}</T>
      ) : null}
      {demo ? (
        <T v="small" tone="faint">Demo mode: no model is connected, so replies are samples, not analysis of your facts.</T>
      ) : null}
      {error ? (
        <View style={{ gap: space.sm }}>
          <T tone="seal" accessibilityLiveRegion="polite">{error}</T>
          {lastText.current ? <Button label="Try again" variant="ghost" onPress={() => void send(lastText.current)} /> : null}
        </View>
      ) : null}

      <Field
        label="Your message"
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={{ minHeight: 110 }}
        editable={!sending}
      />
      {attachment ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, flexWrap: "wrap" }}>
          <T v="small" style={{ flex: 1 }}>Attached: {attachment.filename} ({formatSize(attachment.size)})</T>
          <Chip label="Remove" onPress={() => setAttachment(null)} />
        </View>
      ) : (
        <Button label={picking ? "Opening files…" : "Attach a file"} variant="ghost" disabled={sending || picking} onPress={() => void attach()} />
      )}
      <T v="small" tone="faint">
        One file per message: PDF, Word, text or an image, up to 15 MB. Shisho says what it took from it, and can follow it as a template.
      </T>
      <Button label={sending ? "Waiting for Shisho…" : "Send"} variant="dark" disabled={sending || !input.trim()} onPress={() => void send(input)} />
      {bubbles.length > 0 ? (
        <Button label="Start a new conversation" variant="ghost" onPress={() => { setBubbles([]); setError(null); setDemo(false); }} />
      ) : null}
      <T v="small" tone="faint">
        What you type is sent to an AI provider to write the reply. Shisho does not save it. Share only what you are authorised to, and leave out client names where you can.
      </T>
    </View>
  );
}
