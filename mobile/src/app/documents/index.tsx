import { Row, Screen, T } from "@/ui/components";
import { DOCUMENTS } from "@/lib/documents";

export default function Documents() {
  return (
    <Screen gap={4}>
      <T tone="soft">
        {DOCUMENTS.length} documents, each with the provision that governs it, what it must contain, and the ways it actually fails.
      </T>
      {DOCUMENTS.map((d) => (
        <Row key={d.slug} title={d.name} detail={d.provision.cite} href={{ pathname: "/documents/[slug]", params: { slug: d.slug } }} />
      ))}
    </Screen>
  );
}
