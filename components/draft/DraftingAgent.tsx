"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThinkingSequence } from "@/components/draft/ThinkingSequence";
import { MicButton } from "@/components/draft/MicButton";
import { useSpeechToText } from "@/components/draft/useSpeechToText";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_BYTES,
  type AssistantResponse,
  type ChatMessage,
} from "@/lib/assistant";
import type { AssistantEntitlement } from "@/lib/assistantEntitlements";
import type { DocType } from "@/lib/draft";
import type { DriveTemplateFile } from "@/lib/driveTemplate";

/** A chat message plus one client-only flag, used to annotate the transcript
 *  when a reply was accompanied by a draft — never sent back to the server
 *  as anything other than the plain role/content the API expects. */
type DisplayMessage = ChatMessage & { draftSent?: boolean };

const ACCEPT_ATTRIBUTE = ".txt,.pdf,.docx,image/*";

/** Written by app/draft-bot/formats (the 99-format picker) right before it
 *  navigates here, and consumed once on mount below. A sessionStorage
 *  handoff rather than a query string deliberately — the payload includes
 *  whatever facts the visitor typed about their own matter, and those can
 *  be personal or sensitive; they don't belong in a URL. */
const FORMAT_SEED_KEY = "shisho-draft-seed";

type FormatSeed = { formatName: string; description: string; facts: string };

/** Starting prompts shown only before the first message — each just
 *  populates the compose box (never auto-sends) so a visitor can still add
 *  or adjust facts before sending. */
const STARTER_SUGGESTIONS = [
  "Draft a Section 138 cheque-bounce notice",
  "Draft a bail application for a first-time accused",
  "Draft a plaint for recovery of money due under a contract",
  "Review my draft for a missing verification clause",
  "Prepare me for tomorrow's hearing on an interim injunction",
];

/**
 * The turn's one attachment slot — a manual upload or a Drive template,
 * never both, since /api/assistant's `body.file` only has room for one.
 *
 * A manual upload is one-shot, same as always: cleared the moment `send()`
 * fires. A Drive template is sticky instead — it stays selected across
 * turns until the user removes it, since "follow my template" is a
 * property of the whole drafting session, not one message. Its bytes are
 * fetched once (selectDriveTemplate) and cached right here in state, so a
 * sticky template never re-hits /api/drive/file on later turns.
 */
type PendingAttachment =
  | { kind: "upload"; file: File }
  | { kind: "drive"; fileId: string; filename: string; mimeType: string; dataBase64: string };

/**
 * The drafting agent's chat panel — describe your facts, optionally attach a
 * file, and Shisho either asks what's still missing or drafts the document
 * straight into the workspace below via `onDraft`.
 *
 * Owns its own state entirely, independent of the reviewer's `draft`/
 * `docType`/`annotations`/etc. in DraftWorkspace — a separate quota, a
 * separate locked state, a separate pending/error state. The only thing
 * that crosses the boundary is `onDraft`, called once per turn that
 * actually produces a document.
 */
export function DraftingAgent({
  entitlement,
  contextDocType,
  driveFiles = [],
  onDraft,
}: {
  entitlement: AssistantEntitlement;
  /** What the workspace's picker is set to, sent as grounding so a reader who
   *  arrived from a document page gets that document drafted rather than the
   *  default. Advisory only — the route re-validates it with isDocType, and
   *  in live mode the model still decides. */
  contextDocType?: DocType;
  /** The visitor's single default template, if one is connected — resolved
   *  server-side (app/draft-bot/page.tsx) and threaded down through
   *  DraftWorkspace as a one-element array (see lib/driveConnection.ts for
   *  why it's still shaped as an array). Empty when Drive isn't connected
   *  or no default template has been chosen yet, in which case nothing
   *  auto-attaches and the chat behaves exactly as it did before this
   *  feature existed. */
  driveFiles?: DriveTemplateFile[];
  onDraft: (draft: string, docType: DocType | null) => void;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  /** Set only by the "Remove" button — distinguishes "never auto-applied
   *  yet" from "the visitor explicitly opted out for this conversation",
   *  so the auto-apply effect below doesn't just re-attach the default the
   *  instant someone removes it. */
  const [defaultDismissed, setDefaultDismissed] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState<"idle" | "loading">("idle");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(!entitlement.allowed);
  const [remaining, setRemaining] = useState(entitlement.remaining);
  const [mode, setMode] = useState<AssistantResponse["mode"] | null>(null);
  const speech = useSpeechToText();

  /** Each FINAL chunk (not the live interim preview — see
   *  useSpeechToText's own doc comment) is appended to whatever's already
   *  typed, space-separated, so dictating partway through a typed message
   *  continues it rather than overwriting it. */
  function toggleDictation() {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.start((finalText) => {
      const trimmed = finalText.trim();
      if (!trimmed) return;
      setInput((prev) => (prev ? `${prev} ${trimmed}` : trimmed));
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-selected later if removed
    if (!file) return;

    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      setFileError("Unsupported file type. Attach a .txt, .docx, .pdf, or an image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`Attachments are capped at ${Math.round(MAX_FILE_BYTES / 1_000_000)}MB.`);
      return;
    }

    setFileError(null);
    setPendingAttachment({ kind: "upload", file });
  }

  /** Fetches the default template's content once and caches it in
   *  pendingAttachment — see that type's own doc comment for why this
   *  doesn't re-fetch on every subsequent send() while it stays active. */
  async function loadDefaultTemplate(fileId: string) {
    setTemplateStatus("loading");
    setFileError(null);

    try {
      const res = await fetch("/api/drive/file", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not load your default template.");

      setPendingAttachment({
        kind: "drive",
        fileId,
        filename: data.filename,
        mimeType: data.mimeType,
        dataBase64: data.dataBase64,
      });
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not load your default template.");
    } finally {
      setTemplateStatus("idle");
    }
  }

  /* Auto-applies the visitor's default template the moment the attachment
   * slot is empty — this used to be a manual per-message dropdown, but the
   * point of "a default template" is that it's the ordinary state of every
   * conversation, not something to pick each time. `pendingAttachment` is a
   * dependency so this also restores the default after a one-shot manual
   * upload clears back to null (send() only clears "upload" kind, never
   * "drive" kind, so this never fights that). `defaultDismissed` is what
   * actually stops it from reappearing right after "Remove". */
  useEffect(() => {
    if (driveFiles.length > 0 && !pendingAttachment && !defaultDismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to an external default (see block comment above)
      void loadDefaultTemplate(driveFiles[0].id);
    }
  }, [driveFiles, defaultDismissed, pendingAttachment]);

  /* Runs once on mount: picks up a seed left by app/draft-bot/formats (the
     99-format picker), assembles it into the opening message, and sends it
     immediately — then clears the key so a later reload of /draft-bot
     doesn't resend it. Empty-string guard on `raw` covers both "no seed"
     and "already consumed", so this is safe to leave unconditional. */
  useEffect(() => {
    const raw = sessionStorage.getItem(FORMAT_SEED_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FORMAT_SEED_KEY);
    try {
      const seed = JSON.parse(raw) as FormatSeed;
      const text = `I need to draft: ${seed.formatName}\n\n${seed.description}\n\nFacts of the matter:\n${seed.facts}`;
      void send(text);
    } catch {
      // Malformed seed — ignore rather than surface an error for a
      // handoff the visitor never directly interacted with.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only
  }, []);

  async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  /** `overrideText`, when given, is used instead of the compose box — the
   *  formats-page handoff below sends its assembled seed straight through
   *  this way, since setInput() then immediately calling send() would race
   *  React's state batching and send the box's stale (empty) value. */
  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || status === "pending") return;

    const attachment = pendingAttachment;
    if (overrideText === undefined) setInput("");
    // Only the upload kind is one-shot — a Drive template stays selected
    // (see PendingAttachment's doc comment) until the user removes it.
    if (attachment?.kind === "upload") setPendingAttachment(null);
    setFileError(null);
    setStatus("pending");
    setError(null);

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    try {
      const body: {
        messages: ChatMessage[];
        context?: { docType?: DocType; isDefaultTemplate?: boolean };
        file?: { filename: string; mimeType: string; dataBase64: string };
      } = {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      };

      if (contextDocType) {
        body.context = { docType: contextDocType };
      }

      if (attachment?.kind === "upload") {
        body.file = {
          filename: attachment.file.name,
          mimeType: attachment.file.type,
          dataBase64: await fileToBase64(attachment.file),
        };
      } else if (attachment?.kind === "drive") {
        body.file = {
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          dataBase64: attachment.dataBase64,
        };
        // Unconditional signal, not left for the model to infer — the
        // attachment happened silently (no chat message says "this is my
        // template"), so app/api/assistant/route.ts needs this to know for
        // certain it's style to mirror, not facts to draw from.
        body.context = { ...body.context, isDefaultTemplate: true };
      }

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 402) {
        setLocked(true);
        setRemaining(0);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      const reply = data as AssistantResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.reply, draftSent: reply.draft !== null },
      ]);
      setMode(reply.mode);
      setRemaining((r) => (r === null ? null : Math.max(0, r - 1)));

      if (reply.draft) {
        onDraft(reply.draft, reply.docType);
      }
    } catch {
      setError("Could not reach the assistant. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="label-mono text-ink-faint">Ask Shisho</h2>
        {mode === "demo" ? (
          <span className="label-mono rounded-seal border border-ink/45 px-1.5 py-0.5 text-ink-soft">
            Demo
          </span>
        ) : null}
      </div>

      <p className="mt-3 border-b border-ink/10 pb-4 text-[12.5px] leading-relaxed text-ink-soft">
        Shisho AI provides drafting assistance, not legal advice.
      </p>

      {mode === "demo" ? (
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">
          No model is connected. Replies come from a small set of sample
          responses, not from analysis of what you tell it.
        </p>
      ) : null}

      {messages.length === 0 ? (
        <div className="mt-5">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Tell Shisho the facts — the parties, what happened, what you want
            done about it — and attach a file if you have one. A first draft
            will appear in the workspace below once there&rsquo;s enough to
            work with.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {STARTER_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className={cn(
                  "rounded-seal border border-ink/45 px-3 py-1.5 text-left text-[13px] text-ink-soft",
                  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75 hover:text-ink",
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[13px] text-ink-soft">
            Not sure what to draft?{" "}
            <a href="/draft-bot/formats" className="text-ink underline underline-offset-2">
              Browse all 99 civil and criminal formats
            </a>
            .
          </p>
        </div>
      ) : (
        <div aria-live="polite" className="mt-5 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className="min-w-0">
              <span className="label-mono block text-ink-faint">
                {message.role === "user" ? "You" : "Shisho"}
              </span>
              <p
                className={cn(
                  "mt-1.5 whitespace-pre-wrap rounded-seal border p-3 text-[14px] leading-relaxed text-ink",
                  message.role === "user"
                    ? "border-ink/45 bg-paper-raised"
                    : "border-ink/45",
                )}
              >
                {message.content}
              </p>
              {message.draftSent ? (
                <p className="mt-1.5 label-mono text-ink-faint">
                  Draft sent to the workspace below.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {status === "pending" ? <ThinkingSequence /> : null}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-seal">
          {error}
        </p>
      ) : null}

      {locked ? (
        <LockedChat quota={entitlement.quota ?? 5} />
      ) : (
        <div className="mt-5">
          {/* No manual picker here — driveFiles' own doc comment explains
              why: a default template auto-attaches via the effect above the
              moment one is connected, so there's nothing to choose each
              message. This just reports status/lets the visitor opt out. */}
          {templateStatus === "loading" && !pendingAttachment ? (
            <p className="mb-2.5 text-[13px] text-ink-soft">Loading your default template…</p>
          ) : null}

          {pendingAttachment ? (
            <div className="mb-2.5 flex items-center gap-2 text-[13px] text-ink-soft">
              <span className="min-w-0 truncate">
                {pendingAttachment.kind === "upload"
                  ? pendingAttachment.file.name
                  : `${pendingAttachment.filename} (your default template — applies to every draft until removed)`}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (pendingAttachment.kind === "drive") setDefaultDismissed(true);
                  setPendingAttachment(null);
                }}
                className="shrink-0 text-ink-faint underline underline-offset-2 hover:text-ink"
              >
                Remove
              </button>
            </div>
          ) : null}

          {fileError ? (
            <p role="alert" className="mb-2.5 text-[13px] text-seal">
              {fileError}
            </p>
          ) : null}

          <div className="flex items-end gap-3">
            <label className="sr-only" htmlFor="assistant-input">
              Message Shisho
            </label>
            <textarea
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Describe the facts, or answer Shisho's question…"
              rows={2}
              className={cn(
                "block h-[4.5rem] w-full resize-y rounded-seal border border-ink/45 bg-paper-raised p-3",
                "font-sans text-[14px] leading-relaxed text-ink placeholder:text-ink-faint",
              )}
            />

            <div className="flex shrink-0 flex-col items-stretch gap-2">
              <div className="flex gap-2">
                <label
                  className={cn(
                    "flex-1 cursor-pointer rounded-seal border border-ink/45 px-3 py-1.5 text-center text-[13px] text-ink-soft",
                    "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/40",
                  )}
                >
                  Attach
                  <input
                    type="file"
                    accept={ACCEPT_ATTRIBUTE}
                    onChange={onFileChange}
                    className="sr-only"
                  />
                </label>
                {speech.supported ? (
                  <MicButton listening={speech.listening} onClick={toggleDictation} />
                ) : null}
              </div>
              <Button
                onClick={() => send()}
                disabled={!input.trim() || status === "pending"}
                aria-disabled={!input.trim() || status === "pending"}
                size="sm"
              >
                Send
              </Button>
            </div>
          </div>

          {speech.listening ? (
            <p aria-live="polite" className="mt-2.5 text-[13px] text-ink-soft">
              Listening…{speech.interimTranscript ? ` "${speech.interimTranscript}"` : ""}
            </p>
          ) : null}

          {speech.error ? (
            <p role="alert" className="mt-2.5 text-[13px] text-seal">
              {speech.error}
            </p>
          ) : null}

          {remaining !== null ? (
            <p className="mt-2.5 text-[13px] text-ink-soft">
              {remaining} of {entitlement.quota} free messages left
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Same shape as DraftWorkspace's LockedNotes, adapted for chat. Unlike
 * LockedNotes there is real prior conversation worth keeping on screen —
 * this replaces only the compose row, not the transcript above it.
 */
function LockedChat({ quota }: { quota: number }) {
  return (
    <div className="mt-5 rounded-seal border border-seal/30 bg-paper p-5 shadow-[0_8px_28px_-12px_rgba(34,37,43,0.25)]">
      <p className="label-mono text-seal">Limit reached</p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink">
        You have used all {quota} free messages this month. Core includes
        unlimited chat with Shisho.
      </p>
      <Button href="/pricing" className="mt-5 w-full" size="sm">
        See plans
      </Button>
    </div>
  );
}
