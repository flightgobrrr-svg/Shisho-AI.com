"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { INTERVAL_DAYS, parseCards, revisionStore } from "@/lib/revision";
import { Container } from "@/components/ui/Section";

/**
 * Picks up where a student left off: if saved case briefs are due, say so with
 * a link. It reads this browser's own storage and renders nothing for anyone
 * with no saved briefs — including on the server, so it never flashes.
 */
export function RevisionDueBand() {
  const raw = useSyncExternalStore(
    revisionStore.subscribe,
    revisionStore.getSnapshot,
    revisionStore.getServerSnapshot,
  );
  const [now] = useState(() => Date.now());

  if (!raw) return null;
  const due = parseCards(raw).filter((c) => c.stage < INTERVAL_DAYS.length && c.dueAt <= now).length;
  if (due === 0) return null;

  return (
    <div className="border-b border-ink/10 bg-paper-raised">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-[14.5px] text-ink">
          {due === 1 ? "1 case brief is" : `${due} case briefs are`} due for revision.
        </p>
        <Link href="/courses/revision" className="underline-draw text-[14px] text-ink">
          Revise now
        </Link>
      </Container>
    </div>
  );
}
