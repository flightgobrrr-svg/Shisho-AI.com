"use client";

import { useState } from "react";
import { TAB_LABEL_CLASS, TAB_LIST_CLASS, tabClass } from "@/components/ui/Tabs";

/**
 * "Recorded" / "Live" mode switcher for a class track (/courses/english,
 * /courses/spoken-english) — the site's one tab style (components/ui/Tabs),
 * shared with DraftWorkspace's "Draft a new document" / "Review my draft"
 * tabs on /draft-bot: one panel visible at a time, the selected tab ruled
 * underneath.
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
      <div role="tablist" aria-label="Recorded or live" className={TAB_LIST_CLASS}>
        {(
          [
            ["recorded", "Recorded classes"],
            ["live", "Live classes"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`panel-${value}`}
            onClick={() => setTab(value)}
            className={tabClass(tab === value)}
          >
            <span className={TAB_LABEL_CLASS}>{label}</span>
          </button>
        ))}
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
