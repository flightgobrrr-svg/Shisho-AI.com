import { LIMITATION_ENTRIES, periodLabel } from "@/lib/limitation";
import { IPC_BNS } from "@/lib/ipcBns";

/**
 * SERVER ONLY. Shisho's verified limitation and IPC-to-BNS tables, as text a
 * model's instructions can carry, so Shisho answers these from checked data
 * instead of from memory. Built from lib/limitation.ts and lib/ipcBns.ts, so
 * it can never disagree with the Limitation checker or the IPC to BNS tool.
 *
 * Why: asked about a loan repayable on demand, the drafting chat said the
 * period runs from the demand. Article 21 runs from when the loan is made;
 * it is Article 22 (a deposit payable on demand) that runs from the demand.
 * Used by app/api/assistant/route.ts, app/api/draft/route.ts and lib/aiTools.ts.
 */

const limitationLines = LIMITATION_ENTRIES.map(
  (e) => `- ${e.article}: ${e.description.replace(/\.$/, "")} — ${periodLabel(e.period)}, running from: ${e.runsFrom.replace(/\.$/, "")}.${e.outer ? ` (${e.outer.note})` : ""}`,
);

const bnsLines = IPC_BNS.map((r) =>
  r.bns
    ? `- IPC ${r.ipc} (${r.offence}) → BNS ${r.bns}${r.note ? ` (${r.note})` : ""}`
    : `- IPC ${r.ipc} (${r.offence}) → no BNS successor${r.note ? ` (${r.note})` : ""}`,
);

export const VERIFIED_REFERENCE = `VERIFIED REFERENCE — checked against the published texts. Where a question falls within these tables, use them exactly, and never contradict them:

Limitation Act, 1963 (Schedule) and the CPC written-statement period:
${limitationLines.join("\n")}

IPC to BNS (sections two published tables agree on):
${bnsLines.join("\n")}

For a limitation Article or an IPC section NOT in these tables, do not state a period, a starting point or a BNS number from memory. Say it must be checked against the Act, and name the Act. Never treat an Article as covering facts it does not describe: a loan repayable on demand is Article 21 (time runs from the loan), not Article 22, which is for deposits.`;
