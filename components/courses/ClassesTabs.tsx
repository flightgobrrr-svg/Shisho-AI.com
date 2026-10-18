"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * "Recorded" / "Live" mode switcher for a class track (/courses/english,
 * /courses/spoken-english) — same tab pattern as DraftWorkspace's
 * "Draft a new document" / "Review my draft" tabs on /draft-bot, reused here
 * rather than reinvented: a segmented pair of buttons, one panel visible at
 * a time, active state filled ink.
 *
 * The page itself stays a Server Component — `recorded` and `live` are
 * already-rendered JSX from the page, not fetched here, so this component's
 * only job is which one is currently visible.
 */
export function ClassesTabs({
  recorded,
  live,
}: {
  recorded: React.ReactNode;
  live: React.ReactNode;
}) {
  const [tab, setTab] = useState<"recorded" | "live">("recorded");

  return (
    <div>
      <div role="tablist" aria-label="Recorded or live" className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          role="tab"
          id="tab-recorded"
          aria-selected={tab === "recorded"}
          aria-controls="panel-recorded"
          onClick={() => setTab("recorded")}
          className={cn(
            "min-h-11 flex-1 rounded-seal border px-5 py-2.5 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
            tab === "recorded"
              ? "border-ink bg-ink text-paper-raised"
              : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
          )}
        >
          <span className="label-mono">Recorded classes</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-live"
          aria-selected={tab === "live"}
          aria-controls="panel-live"
          onClick={() => setTab("live")}
          className={cn(
            "min-h-11 flex-1 rounded-seal border px-5 py-2.5 text-left transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
            tab === "live"
              ? "border-ink bg-ink text-paper-raised"
              : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
          )}
        >
          <span className="label-mono">Live classes</span>
        </button>
      </div>

      <div id="panel-recorded" role="tabpanel" aria-labelledby="tab-recorded" hidden={tab !== "recorded"} className="mt-10">
        {recorded}
      </div>
      <div id="panel-live" role="tabpanel" aria-labelledby="tab-live" hidden={tab !== "live"} className="mt-10">
        {live}
      </div>
    </div>
  );
}
