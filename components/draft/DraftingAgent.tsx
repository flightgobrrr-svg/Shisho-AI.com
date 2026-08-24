"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_BYTES,
  type AssistantResponse,
  type ChatMessage,
} from "@/lib/assistant";
import type { AssistantEntitlement } from "@/lib/assistantEntitlements";
import type { DocType } from "@/lib/draft";

/** A chat message plus one client-only flag, used to annotate the transcript
 *  when a reply was accompanied by a draft — never sent back to the server
 *  as anything other than the plain role/content the API expects. */
type DisplayMessage = ChatMessage & { draftSent?: boolean };

const ACCEPT_ATTRIBUTE = ".txt,.pdf,.docx,image/*";

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
  onDraft,
}: {
  entitlement: AssistantEntitlement;
  /** What the workspace's picker is set to, sent as grounding so a reader who
   *  arrived from a document page gets that document drafted rather than the
   *  default. Advisory only — the route re-validates it with isDocType, and
   *  in live mode the model still decides. */
  contextDocType?: DocType;
  onDraft: (draft: string, docType: DocType | null) => void;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(!entitlement.allowed);
  const [remaining, setRemaining] = useState(entitlement.remaining);
  const [mode, setMode] = useState<AssistantResponse["mode"] | null>(null);

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
    setPendingFile(file);
  }

  async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function send() {
    const text = input.trim();
    if (!text || status === "pending") return;

    const file = pendingFile;
    setInput("");
    setPendingFile(null);
    setFileError(null);
    setStatus("pending");
    setError(null);

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    try {
      const body: {
        messages: ChatMessage[];
        context?: { docType: DocType };
        file?: { filename: string; mimeType: string; dataBase64: string };
      } = {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      };

      if (contextDocType) {
        body.context = { docType: contextDocType };
      }

      if (file) {
        body.file = {
          filename: file.name,
          mimeType: file.type,
          dataBase64: await fileToBase64(file),
        };
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
        <h2 className="label-mono text-ink-soft/70">Ask Shisho</h2>
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
        <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
          Tell Shisho the facts — the parties, what happened, what you want
          done about it — and attach a file if you have one. A first draft
          will appear in the workspace below once there&rsquo;s enough to
          work with.
        </p>
      ) : (
        <div aria-live="polite" className="mt-5 space-y-4">
          {messages.map((message, i) => (
            <div key={i} className="min-w-0">
              <span className="label-mono block text-ink-soft/70">
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
                <p className="mt-1.5 label-mono text-ink-soft/50">
                  Draft sent to the workspace below.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {status === "pending" ? (
        <p aria-live="polite" aria-busy="true" className="mt-4 text-[14px] text-ink-soft">
          Shisho is thinking…
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-seal">
          {error}
        </p>
      ) : null}

      {locked ? (
        <LockedChat quota={entitlement.quota ?? 5} />
      ) : (
        <div className="mt-5">
          {pendingFile ? (
            <div className="mb-2.5 flex items-center gap-2 text-[13px] text-ink-soft">
              <span className="min-w-0 truncate">{pendingFile.name}</span>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="text-ink-soft/70 underline underline-offset-2 hover:text-ink"
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
                "font-sans text-[14px] leading-relaxed text-ink placeholder:text-ink-soft/50",
              )}
            />

            <div className="flex shrink-0 flex-col items-stretch gap-2">
              <label
                className={cn(
                  "cursor-pointer rounded-seal border border-ink/45 px-3 py-1.5 text-center text-[13px] text-ink-soft",
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
              <Button
                onClick={send}
                disabled={!input.trim() || status === "pending"}
                aria-disabled={!input.trim() || status === "pending"}
                size="sm"
              >
                Send
              </Button>
            </div>
          </div>

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
