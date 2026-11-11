import type { AudienceSample } from "@/lib/audiences";

/** A small labelled illustration of an audience's output — always marked "Sample". */
export function SampleCard({
  sample,
  className = "",
}: {
  sample: AudienceSample;
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-seal border border-ink/20 bg-paper-raised p-6 md:p-7 ${className || "max-w-md"}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-mono text-indigo">{sample.label}</p>
        <p className="label-mono text-ink-faint">Sample</p>
      </div>
      <dl className="mt-5 divide-y divide-ink/10">
        {sample.rows.map((row) => (
          <div key={row.term} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="font-display text-[16px] font-semibold text-ink">{row.term}</dt>
            {row.detail ? (
              <dd className="max-w-[26ch] text-right text-[14px] leading-relaxed text-ink-soft">
                {row.detail}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
      {sample.note ? (
        <p className="mt-4 text-[13px] italic text-ink-soft">{sample.note}</p>
      ) : null}
    </div>
  );
}
