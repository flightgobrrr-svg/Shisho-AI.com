"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/library";

export type PendingCase = {
  id: string;
  title: string | null;
  citation: string | null;
  court_id: string;
  topic: string | null;
  decision_date: string | null;
  source_url: string | null;
};

type Court = { id: string; name: string };

type Draft = {
  title: string;
  citation: string;
  courtId: string;
  topic: string;
  category: string;
  decisionDate: string;
};

function toDraft(c: PendingCase): Draft {
  return {
    title: c.title ?? "",
    citation: c.citation ?? "",
    courtId: c.court_id,
    topic: c.topic ?? "",
    category: "",
    decisionDate: c.decision_date ?? "",
  };
}

/**
 * The whole review UI: one card per pending_review row, editable, with
 * Approve/Reject. Approve is disabled until title/citation/court/topic/
 * category are all filled — title/citation/topic mirror the DB's own CHECK
 * constraint; category doesn't exist at the DB level (see
 * app/api/admin/cases/[id]/route.ts) but is required all the same, since an
 * approved case with no category is invisible to every filter chip on the
 * public Library — a bug a reviewer should never be able to ship by accident.
 */
export function ReviewQueue({
  initialCases,
  courts,
}: {
  initialCases: PendingCase[];
  courts: Court[];
}) {
  const [cases, setCases] = useState(initialCases);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialCases.map((c) => [c.id, toDraft(c)])),
  );
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function submit(id: string, action: "approve" | "reject") {
    setPending((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [id]: "" }));

    const draft = drafts[id];
    const res = await fetch(`/api/admin/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "approve"
          ? {
              action,
              title: draft.title,
              citation: draft.citation,
              courtId: draft.courtId,
              topic: draft.topic,
              category: draft.category,
              decisionDate: draft.decisionDate,
            }
          : { action },
      ),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Something went wrong." }));
      setErrors((prev) => ({ ...prev, [id]: body.error ?? "Something went wrong." }));
      setPending((prev) => ({ ...prev, [id]: false }));
      return;
    }

    setCases((prev) => prev.filter((c) => c.id !== id));
    setPending((prev) => ({ ...prev, [id]: false }));
  }

  if (cases.length === 0) {
    return (
      <p className="text-[14.5px] text-ink-soft">
        Nothing pending — the queue is empty.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {cases.map((c) => {
        const draft = drafts[c.id];
        const canApprove =
          draft.title.trim() &&
          draft.citation.trim() &&
          draft.topic.trim() &&
          draft.courtId &&
          draft.category;
        const busy = !!pending[c.id];

        return (
          <li key={c.id} className="border border-ink/20 bg-paper-raised p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              {c.source_url && (
                <a
                  href={c.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="label-mono text-indigo underline-draw"
                >
                  View source →
                </a>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label-mono text-ink-soft">Title</span>
                <input
                  value={draft.title}
                  onChange={(e) => updateDraft(c.id, { title: e.target.value })}
                  className="mt-1.5 h-10 w-full border border-ink/30 bg-paper px-3 text-[14px] text-ink"
                />
              </label>
              <label className="block">
                <span className="label-mono text-ink-soft">Citation</span>
                <input
                  value={draft.citation}
                  onChange={(e) => updateDraft(c.id, { citation: e.target.value })}
                  className="mt-1.5 h-10 w-full border border-ink/30 bg-paper px-3 text-[14px] text-ink"
                />
              </label>
              <label className="block">
                <span className="label-mono text-ink-soft">Court</span>
                <select
                  value={draft.courtId}
                  onChange={(e) => updateDraft(c.id, { courtId: e.target.value })}
                  className="mt-1.5 h-10 w-full border border-ink/30 bg-paper px-3 text-[14px] text-ink"
                >
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-mono text-ink-soft">Decision date</span>
                <input
                  type="date"
                  value={draft.decisionDate}
                  onChange={(e) => updateDraft(c.id, { decisionDate: e.target.value })}
                  className="mt-1.5 h-10 w-full border border-ink/30 bg-paper px-3 text-[14px] text-ink"
                />
              </label>
              <label className="block">
                <span className="label-mono text-ink-soft">
                  Category — required to verify
                </span>
                <select
                  value={draft.category}
                  onChange={(e) => updateDraft(c.id, { category: e.target.value })}
                  className="mt-1.5 h-10 w-full border border-ink/30 bg-paper px-3 text-[14px] text-ink"
                >
                  <option value="">Choose one…</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="label-mono text-ink-soft">
                  Topic — the subject, not a headnote. Required to verify.
                </span>
                <textarea
                  value={draft.topic}
                  onChange={(e) => updateDraft(c.id, { topic: e.target.value })}
                  rows={2}
                  placeholder="Not filled by the scraper — write what this case is actually about."
                  className="mt-1.5 w-full border border-ink/30 bg-paper px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/50"
                />
              </label>
            </div>

            {errors[c.id] && (
              <p className="mt-3 text-[13px] text-seal">{errors[c.id]}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={!canApprove || busy}
                onClick={() => submit(c.id, "approve")}
              >
                {busy ? "Working…" : "Approve"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => submit(c.id, "reject")}
              >
                Reject
              </Button>
              {!canApprove && (
                <span className="text-[12.5px] text-ink-soft/60">
                  Fill in title, citation, court, topic, and category to approve.
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
