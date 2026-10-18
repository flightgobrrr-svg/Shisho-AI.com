"use client";

import Link from "next/link";
import { findDocumentForAuthority } from "@/lib/documents";
import { buildReviewHtml, downloadHtml } from "@/lib/reviewExport";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { DraftingAgent } from "@/components/draft/DraftingAgent";
import { DriveConnect } from "@/components/draft/DriveConnect";
import { cn } from "@/lib/cn";
import {
  DOC_TYPES,
  DOC_TYPE_LABELS,
  isDocType,
  MAX_DRAFT_CHARS,
  SEVERITY_LABELS,
  type Annotation,
  type DocType,
  type DraftResponse,
} from "@/lib/draft";
import type { Entitlement } from "@/lib/entitlements";
import type { AssistantEntitlement } from "@/lib/assistantEntitlements";
import type { DriveTemplateFile } from "@/lib/driveTemplate";

const SAMPLE = `IN THE HIGH COURT OF DELHI AT NEW DELHI
CIVIL WRIT JURISDICTION

W.P. (C) No. ____ of 2026

In the matter of Article 226 of the Constitution of India

Ramesh Kumar Sharma ..... Petitioner
versus
Union of India & Ors. ..... Respondents

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is a citizen of India and is possessed of the fundamental rights guaranteed under Part III of the Constitution.

2. That the impugned order dated 14.03.2026 was passed without affording the Petitioner any opportunity of hearing.

3. That the Petitioner seeks an interim stay of the operation of the impugned order pending disposal of the present petition.

PRAYER

It is therefore most respectfully prayed that this Hon'ble Court may be pleased to issue a writ of certiorari quashing the impugned order dated 14.03.2026.`;

const SEVERITY_STYLES: Record<Annotation["severity"], string> = {
  "must-fix": "text-seal",
  consider: "text-ink-soft",
  good: "text-ink-soft",
};

export function DraftWorkspace({
  entitlement,
  assistantEntitlement,
  initialDocType = "plaint",
  initialMode = "new",
  driveConnected = false,
  driveTemplateName: initialDriveTemplateName = null,
  driveFiles: initialDriveFiles = [],
  driveJustConnected = false,
  driveConnectError = null,
}: {
  entitlement: Entitlement;
  assistantEntitlement: AssistantEntitlement;
  /** Pre-selected when the reader arrived from a document page via ?doc=.
   *  Already resolved and validated on the server; defaults to the plaint. */
  initialDocType?: DocType;
  /** Pre-selected when the reader arrived via the nav's "Review a draft" —
   *  resolved server-side from ?mode= in app/draft-bot/page.tsx. */
  initialMode?: "new" | "review";
  /** All five driveX props are resolved server-side (app/draft-bot/page.tsx,
   *  from the visitor_id cookie) — same pattern as entitlement/initialMode
   *  above: the server decides, the client seeds local state from it once
   *  and owns it from there. Lifted to this level (rather than living
   *  inside DraftingAgent) because both DriveConnect (writes it, once a
   *  default template is chosen) and DraftingAgent (reads it, to
   *  auto-apply that template) need the same value. */
  driveConnected?: boolean;
  driveTemplateName?: string | null;
  driveFiles?: DriveTemplateFile[];
  /** True right after Google's consent redirect lands back on this page. */
  driveJustConnected?: boolean;
  driveConnectError?: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [docType, setDocType] = useState<DocType>(initialDocType);
  const [annotations, setAnnotations] = useState<Annotation[] | null>(null);
  const [mode, setMode] = useState<DraftResponse["mode"] | null>(null);
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(!entitlement.allowed);
  const [remaining, setRemaining] = useState(entitlement.remaining);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [onlyMustFix, setOnlyMustFix] = useState(false);

  /* Two modes, not two pages — the chat and the reviewer keep the same
     backend calls and the same state they always had, only one is visible
     at a time. Both stay mounted throughout (toggled with `hidden`, never
     conditionally rendered) so switching tabs never drops a chat transcript
     or a pasted draft.

     `initialMode` is resolved server-side (app/draft-bot/page.tsx, from
     ?mode=) rather than read from window.location.hash on the client — a
     hash is never sent to the server, so deciding the tab from one would
     mean the server always guessing "new" and the client correcting itself
     after mount, which is a real hydration mismatch on a hard reload of
     /draft-bot#review, not just a theoretical one. Threading it through as
     a prop means the server gets it right the first time. */
  const [activeMode, setActiveMode] = useState<"new" | "review">(initialMode);

  const [driveFiles, setDriveFiles] = useState<DriveTemplateFile[]>(initialDriveFiles);
  const [driveTemplateName, setDriveTemplateName] = useState(initialDriveTemplateName);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const visibleAnnotations = annotations
    ? annotations.filter((a) => !onlyMustFix || a.severity === "must-fix")
    : null;
  const mustFixCount = annotations?.filter((a) => a.severity === "must-fix").length ?? 0;

  function exportReview() {
    if (!annotations) return;
    downloadHtml(
      "shisho-review.html",
      buildReviewHtml(draft, annotations, DOC_TYPE_LABELS[docType]),
    );
  }

  async function review() {
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft, docType }),
      });

      if (res.status === 402) {
        setLocked(true);
        setRemaining(0);
        setAnnotations(null);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      setAnnotations(data.annotations);
      setMode(data.mode);
      setRemaining((r) => (r === null ? null : Math.max(0, r - 1)));
    } catch {
      setError("Could not reach the review service. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  /** Clicking a note selects its anchor in the draft, so the two panels stay tied together. */
  function highlight(annotation: Annotation) {
    setActiveId(annotation.id);
    const el = textareaRef.current;
    if (!el) return;

    const index = draft.indexOf(annotation.anchor);
    if (index === -1) return;

    el.focus();
    el.setSelectionRange(index, index + annotation.anchor.length);
  }

  const tooShort = draft.trim().length < 40;

  return (
    <div>
      {/* Two modes, not two panels stacked one after the other — drafting
          from facts and reviewing an existing draft are different jobs a
          reader arrives wanting to do, and showing both at once (the old
          layout) buried whichever one they didn't come for below a screen
          of the other. Picking "Draft a new document" and getting an
          answer switches you here automatically, since that's the one
          moment the two are actually the same errand. */}
      <div role="tablist" aria-label="What do you want to do" className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          role="tab"
          id="tab-ask"
          aria-selected={activeMode === "new"}
          aria-controls="ask"
          onClick={() => setActiveMode("new")}
          className={cn(
            "min-h-14 flex-1 rounded-seal border px-5 py-3 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
            activeMode === "new"
              ? "border-ink bg-ink text-paper-raised"
              : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
          )}
        >
          <span className="label-mono block">Draft a new document</span>
          <span
            className={cn(
              "mt-1 block text-[12.5px] leading-snug",
              activeMode === "new" ? "text-paper-raised/70" : "text-ink-faint",
            )}
          >
            Describe the facts to Shisho
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-review"
          aria-selected={activeMode === "review"}
          aria-controls="review"
          onClick={() => setActiveMode("review")}
          className={cn(
            "min-h-14 flex-1 rounded-seal border px-5 py-3 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
            activeMode === "review"
              ? "border-ink bg-ink text-paper-raised"
              : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
          )}
        >
          <span className="label-mono block">Review my draft</span>
          <span
            className={cn(
              "mt-1 block text-[12.5px] leading-snug",
              activeMode === "review" ? "text-paper-raised/70" : "text-ink-faint",
            )}
          >
            Paste a document for clause-level notes
          </span>
        </button>
      </div>

      {/* The agent — describe the facts, attach a file, and a draft lands
          in the reviewer below via `onDraft`. Its own mechanics (the 402
          lock, the chat transcript) are untouched; this is the only new
          wire into them. */}
      <div id="ask" role="tabpanel" aria-labelledby="tab-ask" hidden={activeMode !== "new"} className="mt-10">
        <DriveConnect
          connected={driveConnected}
          templateName={driveTemplateName}
          autoOpenPicker={driveJustConnected}
          connectError={driveConnectError}
          onTemplateChange={(files, templateName) => {
            setDriveFiles(files);
            setDriveTemplateName(templateName);
          }}
        />
        <div className="mt-6">
          <DraftingAgent
            entitlement={assistantEntitlement}
            contextDocType={docType}
            driveFiles={driveFiles}
            onDraft={(text, dt) => {
              setDraft(text);
              if (dt && isDocType(dt)) setDocType(dt);
              setActiveMode("review");
            }}
          />
        </div>
      </div>

      <div
        id="review"
        role="tabpanel"
        aria-labelledby="tab-review"
        hidden={activeMode !== "review"}
        className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10"
      >
      {/* ================= Draft ================= */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label
              htmlFor="doc-type"
              className="label-mono block text-ink-faint"
            >
              Document type
            </label>
            <select
              id="doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="mt-2.5 rounded-seal border border-ink/45 bg-paper-raised px-3 py-2 font-sans text-[14px] text-ink"
            >
              {DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOC_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setDraft(SAMPLE)}
            className="underline-draw text-[13.5px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
          >
            Load a sample writ petition
          </button>
        </div>

        <label htmlFor="draft" className="sr-only">
          Your draft
        </label>
        <textarea
          id="draft"
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_DRAFT_CHARS))}
          spellCheck={false}
          placeholder="Paste your plaint, notice, application, or contract here…"
          className={cn(
            "mt-4 block h-[26rem] w-full resize-y rounded-seal border border-ink/45 bg-paper-raised p-5",
            "font-mono text-[12.5px] leading-[1.9] text-ink",
            "placeholder:text-ink-faint lg:h-[34rem]",
          )}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="label-mono text-ink-faint">
            {draft.length.toLocaleString("en-IN")} / {MAX_DRAFT_CHARS.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-4">
            {remaining !== null ? (
              <p className="text-[13px] text-ink-soft">
                {remaining} of {entitlement.quota} free reviews left
              </p>
            ) : null}
            <Magnetic>
              <Button
                onClick={review}
                disabled={tooShort || status === "pending"}
                aria-disabled={tooShort || status === "pending"}
              >
                {status === "pending" ? "Reading…" : "Ask Shisho"}
              </Button>
            </Magnetic>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-[14px] text-seal">
            {error}
          </p>
        ) : null}
      </div>

      {/* ================= Notes ================= */}
      <aside className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="label-mono text-ink-faint">Shisho notes</h2>
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
            No model is connected. These notes come from a small set of sample
            patterns, not from analysis of your draft.
          </p>
        ) : null}

        {locked ? (
          <LockedNotes quota={entitlement.quota ?? 5} />
        ) : (
          <div
            aria-live="polite"
            aria-busy={status === "pending"}
            className="mt-5 space-y-3"
          >
            {status === "pending" ? (
              <p className="text-[14px] text-ink-soft">
                Shisho is reading your draft…
              </p>
            ) : null}

            {status === "idle" && annotations && annotations.length > 1 ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-ink-soft">
                <button
                  type="button"
                  onClick={() => setOnlyMustFix((v) => !v)}
                  aria-pressed={onlyMustFix}
                  className="underline-draw text-ink"
                >
                  {onlyMustFix ? "Show all notes" : `Show only must-fix (${mustFixCount})`}
                </button>
                <button type="button" onClick={exportReview} className="underline-draw text-ink">
                  Download review
                </button>
              </div>
            ) : null}

            {status === "idle" && annotations && annotations.length === 1 ? (
              <div className="text-[12.5px]">
                <button type="button" onClick={exportReview} className="underline-draw text-ink">
                  Download review
                </button>
              </div>
            ) : null}

            {status === "idle" && annotations === null ? (
              <p className="text-[14px] leading-relaxed text-ink-soft">
                Paste a draft and ask for a review. Notes will appear here,
                keyed to the clause they mark.
              </p>
            ) : null}

            {status === "idle" && annotations?.length === 0 ? (
              <p className="text-[14px] text-ink-soft">
                No notes on this draft.
              </p>
            ) : null}

            {status === "idle" &&
              visibleAnnotations?.map((annotation, i) => {
                const doc = annotation.authority
                  ? findDocumentForAuthority(annotation.authority)
                  : undefined;
                return (
                <div key={annotation.id}>
                <button
                  type="button"
                  onClick={() => highlight(annotation)}
                  className={cn(
                    "rise block w-full rounded-seal border p-4 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                    activeId === annotation.id
                      ? "border-seal/40 bg-paper-raised"
                      : "border-ink/45 hover:bg-paper-raised",
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    className={cn(
                      "label-mono block",
                      SEVERITY_STYLES[annotation.severity],
                    )}
                  >
                    {SEVERITY_LABELS[annotation.severity]}
                  </span>

                  <span className="mt-2.5 block font-mono text-[11px] leading-snug text-ink-faint italic">
                    &ldquo;{truncate(annotation.anchor, 60)}&rdquo;
                  </span>

                  <span className="mt-2.5 block text-[13.5px] leading-relaxed text-ink">
                    {annotation.note}
                  </span>

                  {/* Statute or case reference in indigo, not seal — it is a
                      citation, not an annotation, and separating the two
                      keeps seal reserved for the mentor's own marks. */}
                  {annotation.authority ? (
                    <span className="label-mono mt-2.5 block text-indigo">
                      {annotation.authority}
                    </span>
                  ) : null}
                </button>
                {doc ? (
                  <details className="group border-x border-b border-ink/25 px-4 py-2.5">
                    <summary className="cursor-pointer text-[12.5px] text-ink-soft hover:text-ink">
                      Why this matters
                    </summary>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                      {doc.provision.gist}
                    </p>
                    <Link
                      href={`/documents/${doc.slug}`}
                      className="underline-draw mt-2 inline-block text-[13px] text-ink"
                    >
                      Read: {doc.name}
                    </Link>
                  </details>
                ) : null}
                </div>
                );
              })}
          </div>
        )}
      </aside>
      </div>
    </div>
  );
}

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

/**
 * The locked state shows the *shape* of what is withheld rather than an empty
 * panel — that is the point of a paywall preview. The blurred cards are
 * decorative and hidden from assistive tech; the real message lives in the
 * card below them, which is fully readable and keyboard-reachable.
 */
function LockedNotes({ quota }: { quota: number }) {
  return (
    <div className="relative mt-5">
      <div aria-hidden="true" className="space-y-3 blur-[5px] select-none">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-seal border border-ink/45 p-4">
            <div className="h-2 w-16 rounded-full bg-ink/20" />
            <div className="mt-3 h-2 w-full rounded-full bg-ink/10" />
            <div className="mt-2 h-2 w-4/5 rounded-full bg-ink/10" />
            <div className="mt-2 h-2 w-3/5 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 top-6">
        <div className="rounded-seal border border-seal/30 bg-paper p-5 shadow-[0_8px_28px_-12px_rgba(34,37,43,0.25)]">
          <p className="label-mono text-seal">Limit reached</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink">
            You have used all {quota} free reviews this month. Core includes the
            Shisho with no limit.
          </p>
          <Button href="/pricing" className="mt-5 w-full" size="sm">
            See plans
          </Button>
        </div>
      </div>
    </div>
  );
}
