"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/cn";
import {
  DOC_TYPES,
  DOC_TYPE_LABELS,
  MAX_DRAFT_CHARS,
  SEVERITY_LABELS,
  type Annotation,
  type DocType,
  type DraftResponse,
} from "@/lib/draft";
import type { Entitlement } from "@/lib/entitlements";

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
}: {
  entitlement: Entitlement;
}) {
  const [draft, setDraft] = useState("");
  const [docType, setDocType] = useState<DocType>("plaint");
  const [annotations, setAnnotations] = useState<Annotation[] | null>(null);
  const [mode, setMode] = useState<DraftResponse["mode"] | null>(null);
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(!entitlement.allowed);
  const [remaining, setRemaining] = useState(entitlement.remaining);
  const [activeId, setActiveId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      {/* ================= Draft ================= */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label
              htmlFor="doc-type"
              className="label-mono block text-ink-soft/70"
            >
              Document type
            </label>
            <select
              id="doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="mt-2.5 rounded-seal border border-ink/20 bg-paper-raised px-3 py-2 font-sans text-[14px] text-ink"
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
            "mt-4 block h-[26rem] w-full resize-y rounded-seal border border-ink/15 bg-paper-raised p-5",
            "font-mono text-[12.5px] leading-[1.9] text-ink",
            "placeholder:text-ink-soft/50 lg:h-[34rem]",
          )}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="label-mono text-ink-soft/60">
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
          <h2 className="label-mono text-ink-soft/70">Shisho notes</h2>
          {mode === "demo" ? (
            <span className="label-mono rounded-seal border border-ink/20 px-1.5 py-0.5 text-ink-soft">
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
              annotations?.map((annotation, i) => (
                <button
                  key={annotation.id}
                  type="button"
                  onClick={() => highlight(annotation)}
                  className={cn(
                    "rise block w-full rounded-seal border p-4 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                    activeId === annotation.id
                      ? "border-seal/40 bg-paper-raised"
                      : "border-ink/10 hover:bg-paper-raised",
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

                  <span className="mt-2.5 block font-mono text-[11px] leading-snug text-ink-soft/70 italic">
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
              ))}
          </div>
        )}
      </aside>
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
          <div key={i} className="rounded-seal border border-ink/10 p-4">
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
            Draft Bot with no limit.
          </p>
          <Button href="/pricing" className="mt-5 w-full" size="sm">
            See plans
          </Button>
        </div>
      </div>
    </div>
  );
}
