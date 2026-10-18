"use client";

import Link from "next/link";
import { useState } from "react";
import { addCard } from "@/lib/revision";

type Option = { title: string; slug: string };

const FIELDS = [
  ["facts", "Facts"],
  ["issue", "Issue"],
  ["held", "Held"],
  ["ratio", "Ratio"],
] as const;

type FieldId = (typeof FIELDS)[number][0];

/**
 * The four boxes live in this page's memory until the student chooses to save
 * the brief for revision, which stores it in this browser only (lib/revision.ts).
 * "Compare" opens the Library digest for the chosen case, so the brief is
 * checked against one drawn from the judgment's real text.
 */
export function CaseBriefPractice({ options }: { options: Option[] }) {
  const [slug, setSlug] = useState(options[0]?.slug ?? "");
  const [values, setValues] = useState<Record<FieldId, string>>({
    facts: "",
    issue: "",
    held: "",
    ratio: "",
  });
  const [saved, setSaved] = useState(false);

  const input =
    "mt-2 w-full rounded-seal border border-ink/45 bg-paper px-3 py-2 text-[15px] leading-relaxed text-ink focus:border-ink/80 focus:outline-none";
  const hasText = Object.values(values).some((v) => v.trim() !== "");
  const title = options.find((o) => o.slug === slug)?.title ?? "";

  function saveForRevision() {
    addCard({ title, slug, ...values });
    setSaved(true);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="cb-case" className="label-mono text-indigo">
          Choose a judgment
        </label>
        <select
          id="cb-case"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSaved(false);
          }}
          className={`${input} h-11 py-0`}
        >
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      {FIELDS.map(([id, label]) => (
        <div key={id}>
          <label htmlFor={`cb-${id}`} className="label-mono text-indigo">
            {label}
          </label>
          <textarea
            id={`cb-${id}`}
            rows={3}
            value={values[id]}
            onChange={(e) => {
              setValues((v) => ({ ...v, [id]: e.target.value }));
              setSaved(false);
            }}
            className={input}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/library/judgments/${slug}`}
          target="_blank"
          className="inline-flex h-11 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised transition-colors hover:bg-ink-soft"
        >
          Compare with the digest
        </Link>
        <button
          type="button"
          onClick={saveForRevision}
          disabled={!hasText || saved}
          className="inline-flex h-11 items-center rounded-seal border border-ink/45 px-5 text-[14.5px] font-medium text-ink transition-colors hover:bg-ink/[0.04] disabled:opacity-45"
        >
          {saved ? "Saved for revision" : "Save for revision"}
        </button>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-soft">
        Saved briefs stay in this browser only and come back after 1, 7 and 30
        days on the{" "}
        <Link href="/courses/revision" className="underline-draw text-ink">
          revision page
        </Link>
        . Clearing your browser data removes them.
      </p>
    </div>
  );
}
