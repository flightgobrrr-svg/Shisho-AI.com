"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  DRAFT_FORMATS,
  formatsByCategory,
  STANDARD_FILING_STRUCTURE,
  type DraftFormat,
} from "@/lib/draftFormats";

const FORMAT_SEED_KEY = "shisho-draft-seed";

type Tab = "civil" | "criminal";

/**
 * The 99-format picker: choose a civil or criminal format, then describe
 * the facts of the matter. Submitting hands both off to /draft-bot via
 * sessionStorage (see DraftingAgent.tsx's own comment on FORMAT_SEED_KEY for
 * why not a query string — the facts typed here can be personal/sensitive
 * and don't belong in a URL) rather than generating anything itself; the
 * actual drafting still happens in the one place that already knows how,
 * the assistant chat.
 */
export function FormatsPicker() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("civil");
  const [selected, setSelected] = useState<DraftFormat | null>(null);
  const [facts, setFacts] = useState("");
  const [showStructure, setShowStructure] = useState(false);

  const list = formatsByCategory(tab);

  function choose(format: DraftFormat) {
    setSelected(format);
    setFacts("");
  }

  function switchTab(next: Tab) {
    setTab(next);
    setSelected(null);
    setFacts("");
  }

  function startDrafting() {
    if (!selected || !facts.trim()) return;
    sessionStorage.setItem(
      FORMAT_SEED_KEY,
      JSON.stringify({
        formatName: selected.name,
        description: selected.description,
        facts: facts.trim(),
      }),
    );
    router.push("/draft-bot");
  }

  return (
    <div>
      <div role="tablist" aria-label="Format category" className="flex gap-2">
        {(["civil", "criminal"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={cn(
              "rounded-seal border px-4 py-2 text-[14px] font-medium capitalize",
              "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
              tab === t
                ? "border-ink bg-ink text-paper-raised"
                : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
            )}
          >
            {t}
            <span className="label-mono ml-2 opacity-70">
              {formatsByCategory(t).length}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[13px] text-ink-soft">
        {DRAFT_FORMATS.length} formats total, sorted alphabetically within
        each tab. A format marked for both categories appears in both.{" "}
        <button
          type="button"
          onClick={() => setShowStructure((s) => !s)}
          className="underline underline-offset-2 hover:text-ink"
        >
          {showStructure ? "Hide" : "Show"} the standard 18-point filing structure
        </button>
        .
      </p>

      {showStructure ? (
        <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-soft sm:grid-cols-2">
          {STANDARD_FILING_STRUCTURE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul
          role="tabpanel"
          className="max-h-[32rem] min-w-0 space-y-1.5 overflow-y-auto rounded-seal border border-ink/20 p-2"
        >
          {list.map((format) => (
            <li key={format.sno}>
              <button
                type="button"
                onClick={() => choose(format)}
                className={cn(
                  "flex w-full items-baseline gap-3 rounded-seal border px-3 py-2.5 text-left",
                  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                  selected?.sno === format.sno
                    ? "border-seal/60 bg-paper-raised"
                    : "border-transparent hover:border-ink/30 hover:bg-paper-raised",
                )}
              >
                {/* The format's number in the source list, so the column is
                    not sequential once sorted by name. A fixed, right-aligned
                    column keeps every name on the same left edge. */}
                <span className="label-mono w-6 shrink-0 text-right tabular-nums text-ink-faint">
                  {format.sno}
                </span>
                <span className="min-w-0 text-[14.5px] text-ink">{format.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="min-w-0 rounded-seal border border-ink/20 bg-paper-raised p-5">
          {selected ? (
            <>
              <h2 className="font-display text-[19px] font-semibold text-ink">
                {selected.name}
              </h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                {selected.description}
              </p>

              <label
                htmlFor="format-facts"
                className="label-mono mt-5 block text-ink-soft"
              >
                Facts of the matter
              </label>
              <textarea
                id="format-facts"
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="Parties, dates, what happened, what you want done about it…"
                rows={8}
                className="mt-2 block w-full resize-y rounded-seal border border-ink/45 bg-paper p-3 font-sans text-[14px] leading-relaxed text-ink placeholder:text-ink-faint"
              />

              <Button
                onClick={startDrafting}
                disabled={!facts.trim()}
                aria-disabled={!facts.trim()}
                className="mt-4"
              >
                Start drafting →
              </Button>
              <p className="mt-2.5 text-[12.5px] text-ink-soft">
                Opens Shisho with this format and your facts already in the
                conversation.
              </p>
            </>
          ) : (
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Select a format on the left to see what it must contain, then
              describe your facts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
