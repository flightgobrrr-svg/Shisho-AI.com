import { Emphasis } from "@/components/ui/Emphasis";

/** Renders a headline in which the word between asterisks gets the brand emphasis. */
export function AudienceHeadline({ text }: { text: string }) {
  const [before, key, after] = text.split("*");
  return (
    <>
      {before}
      <Emphasis>{key}</Emphasis>
      {after}
    </>
  );
}
