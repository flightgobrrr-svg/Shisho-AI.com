import { useMemo, useState } from "react";
import { View } from "react-native";
import { Button, Chip, Field, Headline, Notice, Row, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space } from "@/ui/theme";
import { PageHeader, StageTrail } from "@/ui/web";
import { CATEGORIES, PREVIEW_CASES, slugify } from "@/lib/library";
import { PROVISIONS } from "@/lib/acts";
import { apiConfigured } from "@/api/client";
import { digestStore } from "@/state/digests";

// Only judgments with a verified source link can have a digest prepared.
const CASES = PREVIEW_CASES.filter((c) => c.sourceUrl);

/**
 * The curated Library. The list is bundled in the app, so it is searchable
 * with no signal; opening a judgment fetches its digest and saves a copy.
 */
export default function Library() {
  const [query, setQuery] = useState("");
  const { value: saved } = digestStore.use();

  const [category, setCategory] = useState<string | null>(null);
  // 20 at a time, as on the website; a new search or filter starts again.
  const [shown, setShown] = useState({ key: "", count: 20 });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASES.filter(
      (c) =>
        (!category || c.category === category) &&
        (!q || `${c.title} ${c.citation} ${c.topic} ${c.category}`.toLowerCase().includes(q)),
    );
  }, [query, category]);
  const key = `${query}|${category ?? ""}`;
  const count = shown.key === key ? shown.count : 20;
  const results = filtered.slice(0, count);

  return (
    <Screen gap={4}>
      <FadedPhoto source={require("../../../assets/library.jpg")} height={190} />
      {/* The website's Library opens with its three collections. */}
      <PageHeader
        eyebrow="Legal Library"
        headline="The *authorities*, explained."
        intro="Supreme Court and High Court judgments, bare acts, and commentary — correctly cited and explained in plain language. Search any of the three below, or jump straight to a collection; each judgment links to Indian Kanoon to help you find the full text."
      />
      <StageTrail product="library" />
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>Three collections</T>
      <Row title="Bare Acts" detail={`${PROVISIONS.length} provisions, the text Shisho is built on`} href="/library/provisions" />
      <Row title="Commentary" detail="How each of those provisions plays out in practice" href="/library/provisions?mode=commentary" />
      <Row title="Index of Acts" detail="Central Acts, and state Acts state-wise" href="/library/acts" />
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>Landmark cases</T>
      <Headline text="Starting with the judgments every student *knows*." v="h2" />
      <T tone="soft">Subject and subsequent history, flagged where a judgment is no longer good law — not a substitute for reading the full report.</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        <Chip label={`All (${CASES.length})`} selected={!category} onPress={() => setCategory(null)} />
        {CATEGORIES.map((cat) => {
          const n = CASES.filter((c) => c.category === cat).length;
          return n ? <Chip key={cat} label={`${cat} (${n})`} selected={category === cat} onPress={() => setCategory(cat)} /> : null;
        })}
      </View>
      <Field label="Search the Library" value={query} onChangeText={setQuery} placeholder="Maneka, Article 21, basic structure" autoCapitalize="none" returnKeyType="search" />

      {apiConfigured ? (
        <Row title="Look up any judgment" detail="Find one by name. Needs an account and a connection" href="/library/lookup" />
      ) : null}

      {results.length === 0 ? (
        <Notice title="No judgment matches" body="Try a shorter word, or a topic such as “bail” or “writ”." />
      ) : (
        results.map((c) => {
          const slug = slugify(c.title);
          return (
            <Row
              key={slug}
              title={c.title}
              detail={[`${c.citation} · ${c.court} · ${c.category}`, c.topic, saved[slug] ? "Saved offline" : ""]
                .filter(Boolean)
                .join(" — ")}
              href={{ pathname: "/library/[slug]", params: { slug } }}
            />
          );
        })
      )}
      {filtered.length > results.length ? (
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <Button label={`Show ${Math.min(20, filtered.length - results.length)} more`} variant="ghost" onPress={() => setShown({ key, count: count + 20 })} />
          <T v="small" tone="soft">{filtered.length - results.length} more in this list</T>
        </View>
      ) : null}
      {!apiConfigured ? (
        <T v="small" tone="faint" style={{ marginTop: 12 }}>
          Digests need Shisho's online service, which this build is not connected to. The judgment itself can still be opened from its link.
        </T>
      ) : null}
    </Screen>
  );
}
