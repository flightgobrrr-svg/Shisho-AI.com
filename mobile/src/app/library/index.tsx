import { useMemo, useState } from "react";
import { Field, Notice, Row, Screen, T } from "@/ui/components";
import { PREVIEW_CASES, slugify } from "@/lib/library";
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? CASES.filter((c) => `${c.title} ${c.citation} ${c.topic}`.toLowerCase().includes(q))
      : CASES;
    return list.slice(0, 40);
  }, [query]);

  return (
    <Screen gap={4}>
      <T tone="soft">{CASES.length} judgments with a verified source. Search by name, citation or topic.</T>
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
              detail={`${c.citation} · ${c.court}${saved[slug] ? " · saved offline" : ""}`}
              href={{ pathname: "/library/[slug]", params: { slug } }}
            />
          );
        })
      )}
      {!apiConfigured ? (
        <T v="small" tone="faint" style={{ marginTop: 12 }}>
          Digests need Shisho's online service, which this build is not connected to. The judgment itself can still be opened from its link.
        </T>
      ) : null}
    </Screen>
  );
}
