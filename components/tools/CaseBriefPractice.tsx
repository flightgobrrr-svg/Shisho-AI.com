"use client";

import Link from "next/link";
import { useState } from "react";

type Option = { title: string; slug: string };

const FIELDS = [
  ["facts", "Facts"],
  ["issue", "Issue"],
  ["held", "Held"],
  ["ratio", "Ratio"],
] as const;

/**
 * Nothing is saved: the four boxes live in this page's memory. "Compare" opens
 * the Library digest for the chosen case, so the student checks their brief
 * against one drawn from the judgment's real text.
 */
export function CaseBriefPractice({ options }: { options: Option[] }) {
  const [slug, setSlug] = useState(options[0]?.slug ?? "");
  const input =
    "mt-2 w-full rounded-seal border border-ink/45 bg-paper px-3 py-2 text-[15px] leading-relaxed text-ink focus:border-ink/80 focus:outline-none";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="cb-case" className="label-mono text-indigo">
          Choose a judgment
        </label>
        <select
          id="cb-case"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
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
          <textarea id={`cb-${id}`} rows={3} className={input} />
        </div>
      ))}

      <Link
        href={`/library/judgments/${slug}`}
        target="_blank"
        className="inline-flex h-11 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised transition-colors hover:bg-ink-soft"
      >
        Compare with the digest
      </Link>
      <p className="text-[13px] text-ink-soft">Your answers are not saved.</p>
    </div>
  );
}
