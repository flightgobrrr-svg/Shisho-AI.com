"use client";

/** Opens the browser's print dialog; print styles in globals.css make the page a clean one-pager. */
export function PrintButton({ label = "Print this page" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print group inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
    >
      {/* The same printer as the Shisho review's Print control. Decorative:
          the label names the button. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 13 KB static icon; next/image adds nothing here */}
      <img src="/icons/print.png" alt="" width={20} height={20} className="size-5 dark:opacity-90" />
      <span className="underline-draw">{label}</span>
    </button>
  );
}
