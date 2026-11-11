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
        <h2 className="sr-only">Ask Shisho</h2>
        {mode === "demo" ? (
          <span className="label-mono rounded-seal border border-ink/45 px-1.5 py-0.5 text-ink-soft">
            Demo
          </span>
        ) : null}
      </div>

      {mode === "demo" ? (
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
          No model is connected. Replies come from a small set of sample
          responses, not from analysis of what you tell it.
        </p>
      ) : null}

      {messages.length > 0 ? (
        <ol aria-live="polite" className="mb-8 space-y-7">
          {messages.map((message, i) =>
            message.role === "user" ? (
              <li key={i} className="flex min-w-0 flex-col items-end">
                <span className="label-mono text-ink-faint">You</span>
                {/* What you wrote is paper, same as the composer it came from. */}
                <p className="sheet mt-2 max-w-[min(88%,62ch)] whitespace-pre-wrap bg-paper-raised px-4 py-3 text-[15px] leading-relaxed text-ink border border-ink/15 shadow-[var(--slip-shadow)]">
                  {message.content}
                </p>
              </li>
            ) : (
              <li key={i} className="min-w-0">
                <span className="label-mono text-seal">Shisho</span>
                <p className="mt-2 max-w-[66ch] whitespace-pre-wrap font-display text-[1.2rem] leading-[1.55] text-ink">
                  {message.content}
                </p>
                {message.draftSent ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-ink-soft">
                    <ArrowIcon className="size-4 text-seal" />
                    The draft is on the desk, under Review my draft.
                  </p>
                ) : null}
              </li>
            ),
          )}
        </ol>
      ) : null}

      {status === "pending" ? <ThinkingSequence /> : null}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-seal">
          {error}
        </p>
      ) : null}

      {locked ? (
        <LockedChat quota={entitlement.quota ?? 5} />
      ) : (
        <div className="mt-6">
          {fileError ? (
            <p role="alert" className="mb-2.5 text-[13px] text-seal">
              {fileError}
            </p>
          ) : null}

          {/* One composer: the attachment, the box and its controls read as a
              single object, with focus shown on the whole frame rather than
              on the bare textarea inside it. */}
          <div
            className={cn(
              "sheet bg-paper-raised text-ink border border-ink/15 shadow-[var(--sheet-shadow)]",
              "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-4 has-[textarea:focus-visible]:outline-seal",
            )}
          >
            {/* No manual picker here — driveFiles' own doc comment explains
                why: a default template auto-attaches via the effect above the
                moment one is connected, so there's nothing to choose each
                message. This just reports status/lets the visitor opt out. */}
            {templateStatus === "loading" && !pendingAttachment ? (
              <p className="px-4 pt-3 text-[13px] text-ink-soft">Loading your default template…</p>
            ) : null}

            {pendingAttachment ? (
              <div className="flex items-center gap-2 px-3 pt-3">
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-seal border border-ink/15 bg-paper px-2.5 py-1 text-[12.5px] text-ink-soft">
                  <PaperclipIcon className="size-3.5 shrink-0" />
                  <span className="min-w-0 truncate">
                    {pendingAttachment.kind === "upload"
                      ? pendingAttachment.file.name
                      : `${pendingAttachment.filename} (your default template — applies to every draft until removed)`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingAttachment.kind === "drive") setDefaultDismissed(true);
                    setPendingAttachment(null);
                  }}
                  className="shrink-0 text-[12.5px] text-ink-faint underline underline-offset-2 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ) : null}

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
              placeholder={
                messages.length === 0
                  ? "The parties, what happened, and what you want done about it…"
                  : "Answer Shisho, or add more facts…"
              }
              rows={3}
              className={cn(
                "block min-h-[7.5rem] w-full resize-y bg-transparent px-5 pt-5 pb-3 sm:px-6",
                "font-display text-[1.25rem] leading-relaxed text-ink placeholder:text-ink-faint focus-visible:outline-none",
              )}
            />

            <div className="flex items-center gap-1 border-t border-ink/10 px-2.5 py-2.5 sm:px-3.5">
              <label
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-seal px-2.5 text-[13px] text-ink-soft",
                  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-ink/5 hover:text-ink",
                  "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-seal",
                )}
              >
                <PaperclipIcon className="size-4" />
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
              <span className="mr-2 ml-auto hidden text-[12px] text-ink-faint md:inline">
                Enter to send · Shift + Enter for a new line
              </span>
              <Button
                onClick={() => send()}
                disabled={!input.trim() || status === "pending"}
                aria-disabled={!input.trim() || status === "pending"}
                className="max-md:ml-auto"
              >
                {messages.length === 0 ? "Ask Shisho" : "Send"}
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
            <p className="mt-2.5 text-[12.5px] text-ink-faint">
              {remaining} of {entitlement.quota} free messages left
            </p>
          ) : null}
        </div>
      )}

      {/* Ways in, shown only before the first message, under the composer.
          Each fills the box (never sends), so facts can be added first. */}
      {messages.length === 0 && !locked ? (
        <ul className="mt-8 grid border-t border-ink/15 sm:grid-cols-2 sm:gap-x-10">
          {STARTER_SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="border-b border-ink/15">
              <button
                type="button"
                onClick={() => setInput(suggestion)}
                className={STARTER_CLASS}
              >
                <span>{suggestion}</span>
                <ArrowIcon className={ARROW_CLASS} />
              </button>
            </li>
          ))}
          <li className="border-b border-ink/15">
            <a href="/draft-bot/formats" className={cn(STARTER_CLASS, "text-ink")}>
              <span>Browse all 99 civil and criminal formats</span>
              <ArrowIcon className={ARROW_CLASS} />
            </a>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

const STARTER_CLASS = cn(
  "group flex h-full min-h-12 w-full items-center justify-between gap-4 py-3 text-left text-[14.5px] leading-snug text-ink-soft",
  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink",
);

const ARROW_CLASS =
  "size-4 shrink-0 text-ink-faint transition-[color,transform] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] group-hover:translate-x-1 group-hover:text-seal";

/* Same line-art family as the mic and clock icons: 1.5 stroke, square caps,
 * no rounding (radius is 0 everywhere on the site). */
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("fill-none stroke-current stroke-[1.5]", className)}>
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="square" />
    </svg>
  );
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("fill-none stroke-current stroke-[1.5]", className)}>
      <path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" strokeLinecap="square" />
    </svg>
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
