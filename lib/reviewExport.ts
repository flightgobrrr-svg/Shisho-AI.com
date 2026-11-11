import type { Annotation } from "@/lib/draft";

const SEVERITY_LABEL: Record<Annotation["severity"], string> = {
  "must-fix": "Must fix",
  consider: "Consider",
  good: "Good",
};

function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A self-contained HTML file of the draft followed by Shisho's notes, numbered,
 * each quoting the words it marks. It opens in any browser or in Word, prints
 * cleanly, and can be handed to a senior. It is not a Word file with live
 * comments; it is the same notes in a form that travels.
 */
export function buildReviewHtml(
  draft: string,
  annotations: Annotation[],
  docTypeLabel: string,
): string {
  const notes = annotations
    .map(
      (a, i) => `<li>
<p class="sev">${i + 1}. ${esc(SEVERITY_LABEL[a.severity])}</p>
<p class="anchor">&ldquo;${esc(a.anchor.replace(/\s+/g, " ").trim())}&rdquo;</p>
<p>${esc(a.note)}</p>${a.authority ? `\n<p class="auth">${esc(a.authority)}</p>` : ""}
</li>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Shisho review — ${esc(docTypeLabel)}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#222;line-height:1.55}
h1{font-size:1.4rem}h2{font-size:1.1rem;margin-top:2.5rem;border-top:1px solid #ccc;padding-top:1rem}
pre{white-space:pre-wrap;font-family:inherit}
ol{padding-left:1.2rem}li{margin-bottom:1.2rem;break-inside:avoid}
.sev{font:600 .75rem/1 sans-serif;text-transform:uppercase;letter-spacing:.06em;margin:0 0 .4rem}
.anchor{font-style:italic;color:#555;margin:.2rem 0}.auth{font:.8rem sans-serif;color:#345;margin:.3rem 0 0}
.foot{margin-top:2.5rem;font:.8rem sans-serif;color:#666}
</style></head><body>
<h1>${esc(docTypeLabel)} — draft and Shisho notes</h1>
<pre>${esc(draft)}</pre>
<h2>Notes</h2>
<ol>
${notes}
</ol>
<p class="foot">Shisho AI provides drafting assistance, not legal advice. Check every provision against its source before you file.</p>
</body></html>`;
}

export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
