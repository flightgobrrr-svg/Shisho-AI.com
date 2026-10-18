"use client";

/** Opens the browser's print dialog; print styles in globals.css make the page a clean one-pager. */
export function PrintButton({ label = "Print this page" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print underline-draw label-mono text-ink-soft transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}
