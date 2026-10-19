import { useMemo, useState } from "react";
import { Linking, View } from "react-native";
import { Link } from "expo-router";
import { Button, Card, Chip, Field, Notice, Screen, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { PREVIEW_CASES, slugify } from "@/lib/library";
import { saveBrief } from "@/state/stores";

const FIELDS = [
  ["facts", "Facts"],
  ["issue", "Issue"],
  ["held", "Held"],
  ["ratio", "Ratio"],
] as const;
type FieldId = (typeof FIELDS)[number][0];

// Only judgments with a verified source link can be opened to compare against.
const CASES = PREVIEW_CASES.filter((c) => c.sourceUrl);

export default function CaseBrief() {
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [values, setValues] = useState<Record<FieldId, string>>({ facts: "", issue: "", held: "", ratio: "" });
  const [saved, setSaved] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? CASES.filter((c) => c.title.toLowerCase().includes(q)) : CASES).slice(0, 8);
  }, [query]);

  const chosen = CASES.find((c) => slugify(c.title) === slug);
  const hasText = Object.values(values).some((v) => v.trim() !== "");

  return (
    <Screen>
      <T tone="soft">Read the judgment, write the facts, issue, held and ratio in your own words, then open the judgment to see what you missed.</T>

      <Field label="Find a judgment" value={query} onChangeText={setQuery} placeholder="Kesavananda, Maneka, Vishaka" autoCapitalize="none" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {matches.map((c) => (
          <Chip key={c.title} label={c.title.length > 38 ? `${c.title.slice(0, 36)}…` : c.title} selected={slugify(c.title) === slug} onPress={() => { setSlug(slugify(c.title)); setSaved(false); }} />
        ))}
      </View>
      {matches.length === 0 ? <T v="small" tone="soft">No judgment matches. Try a shorter word.</T> : null}

      {chosen ? (
        <Card>
          <T v="h3">{chosen.title}</T>
          <T v="small" tone="soft">{chosen.citation} · {chosen.court}</T>
          <Button label="Open the judgment" variant="ghost" onPress={() => void Linking.openURL(chosen.sourceUrl!)} />
        </Card>
      ) : (
        <Notice title="Choose a judgment" body="Pick one above to see its citation and a link to the full text." />
      )}

      {FIELDS.map(([id, label]) => (
        <Field
          key={id}
          label={label}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 88 }}
          value={values[id]}
          onChangeText={(t) => { setValues((v) => ({ ...v, [id]: t })); setSaved(false); }}
        />
      ))}

      <Button
        label={saved ? "Saved for revision" : "Save for revision"}
        variant="dark"
        disabled={!chosen || !hasText || saved}
        onPress={() => {
          if (!chosen) return;
          saveBrief({ title: chosen.title, slug: slugify(chosen.title), ...values });
          setSaved(true);
        }}
      />
      <T v="small" tone="faint">
        Saved briefs stay on this phone and come back after 1, 7 and 30 days on the{" "}
        <Link href="/revision" style={{ textDecorationLine: "underline" }}>revision page</Link>. Clearing the app's data removes them.
      </T>
    </Screen>
  );
}
