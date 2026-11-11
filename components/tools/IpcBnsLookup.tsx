"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IPC_BNS, searchIpcBns } from "@/lib/ipcBns";

export function IpcBnsLookup() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => searchIpcBns(IPC_BNS, query), [query]);

  return (
    <div className="max-w-3xl">
      <label htmlFor="ipc-q" className="label-mono text-indigo">
        Section number or offence
      </label>
      <input
        id="ipc-q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="420, 498A, theft…"
        className="mt-2 h-11 w-full rounded-seal border border-ink/45 bg-paper px-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-ink/80"
      />

      <div aria-live="polite" className="mt-6">
        {rows.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Not in this list. It holds only mappings two published tables agree
            on. Check the BNS directly for anything else.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="label-mono border-b border-ink/20 text-ink-faint">
                <th scope="col" className="py-2 pr-4 font-normal">IPC</th>
                <th scope="col" className="py-2 pr-4 font-normal">BNS</th>
                <th scope="col" className="py-2 font-normal">Offence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 align-top">
              {rows.map((r) => (
                <tr key={r.ipc}>
                  <td className="py-3 pr-4 font-display text-[16px] font-semibold text-ink">
                    <Link href={`/ipc-bns/${r.ipc.toLowerCase()}`} className="underline-draw">
                      {r.ipc}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-display text-[16px] font-semibold text-ink">
                    {r.bns || "—"}
                  </td>
                  <td className="py-3 text-[14px] leading-relaxed text-ink-soft">
                    {r.offence}
                    {r.note ? <span className="mt-1 block text-[12.5px]">{r.note}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
