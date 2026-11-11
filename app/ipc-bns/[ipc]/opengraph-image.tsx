import { OG_SIZE, ogCard } from "@/lib/ogCard";
import { IPC_BNS } from "@/lib/ipcBns";

export const alt = "IPC to BNS section — Shisho AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ ipc: string }> }) {
  const { ipc } = await params;
  const row = IPC_BNS.find((r) => r.ipc.toLowerCase() === ipc.toLowerCase());
  return ogCard({
    eyebrow: "IPC to BNS",
    title: row
      ? row.bns
        ? `IPC ${row.ipc} is BNS ${row.bns}`
        : `IPC ${row.ipc} has no BNS section`
      : "IPC to BNS",
    line: row?.offence,
  });
}
