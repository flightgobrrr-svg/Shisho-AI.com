/**
 * IPC → BNS correspondence for the lookup at /ipc-bns.
 *
 * VERIFIED to the standard PRODUCT.md sets: each row below is one two
 * independent published conversion tables agree on —
 *   • https://lawsikho.com/blog/ipc-to-bns-conversion
 *   • https://vakeel360.com/ipc-to-bns
 * The official source is the BPRD "Correspondence Table and Comparison
 * Summary of the Bharatiya Nyaya Sanhita, 2023 to the Indian Penal Code,
 * 1860"; it could not be opened as text, so rows are matched at section level
 * and the page tells readers to confirm against it.
 *
 * LEFT OUT ON PURPOSE, because the sources disagree or the offences are not
 * the same: IPC 376 (the tables differ on 64 and 65, and the sexual-offences
 * chapter was reorganised), IPC 124A (sedition is not simply "BNS 152"), and
 * IPC 143 and 409 (only one source). IPC 377 and 497 appear as omitted: the
 * BNS carries no successor, matching the entries already verified in
 * lib/acts.ts. To add a row, check it against both tables first.
 *
 * The BNS applies to offences committed on or after 1 July 2024; earlier
 * offences stay under the IPC even if the trial is later.
 */

export type IpcBnsRow = {
  ipc: string;
  offence: string;
  /** Empty string when the BNS carries no successor. */
  bns: string;
  note?: string;
};

export const IPC_BNS: IpcBnsRow[] = [
  { ipc: "34", offence: "Acts done by several persons in furtherance of common intention", bns: "3(5)" },
  { ipc: "120B", offence: "Criminal conspiracy (punishment)", bns: "61" },
  { ipc: "147", offence: "Rioting (punishment)", bns: "191" },
  { ipc: "149", offence: "Every member of unlawful assembly guilty of offence committed in prosecution of common object", bns: "190" },
  { ipc: "302", offence: "Murder (punishment)", bns: "103(1)", note: "BNS 302 is a different offence (wounding religious feelings)." },
  { ipc: "304A", offence: "Causing death by negligence", bns: "106" },
  { ipc: "304B", offence: "Dowry death", bns: "80" },
  { ipc: "307", offence: "Attempt to murder", bns: "109" },
  { ipc: "323", offence: "Voluntarily causing hurt", bns: "115" },
  { ipc: "324", offence: "Voluntarily causing hurt by dangerous weapons", bns: "118" },
  { ipc: "354", offence: "Assault or criminal force to woman with intent to outrage modesty", bns: "74" },
  { ipc: "354D", offence: "Stalking", bns: "78" },
  { ipc: "379", offence: "Theft (punishment)", bns: "303", note: "BNS 303 is theft; do not confuse it with IPC 303." },
  { ipc: "406", offence: "Criminal breach of trust (punishment)", bns: "316" },
  { ipc: "420", offence: "Cheating and dishonestly inducing delivery of property", bns: "318" },
  { ipc: "498A", offence: "Cruelty by husband or relatives of husband", bns: "85" },
  { ipc: "506", offence: "Criminal intimidation (punishment)", bns: "351" },
  { ipc: "377", offence: "Unnatural offences", bns: "", note: "No BNS successor." },
  { ipc: "497", offence: "Adultery", bns: "", note: "Struck down in 2018; not carried into the BNS." },
];

export function searchIpcBns(rows: IpcBnsRow[], query: string): IpcBnsRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.ipc.toLowerCase() === q ||
      r.bns.toLowerCase().startsWith(q) ||
      r.offence.toLowerCase().includes(q) ||
      `ipc ${r.ipc}`.includes(q) ||
      `bns ${r.bns}`.includes(q),
  );
}

/** Date the entries were last checked against their sources. Update it when re-checked. */
export const VERIFIED_ON = "18 October 2026";

/** One row by its IPC section, case-insensitive ("498a" finds "498A"). */
export function findIpcRow(ipc: string): IpcBnsRow | undefined {
  return IPC_BNS.find((r) => r.ipc.toLowerCase() === ipc.toLowerCase());
}

/** The heading of a section's own page: "IPC 302 is BNS 103(1)". */
export function ipcHeadline(ipc: string, bns: string): string {
  return bns ? `IPC ${ipc} is BNS ${bns}` : `IPC ${ipc} has no BNS section`;
}
