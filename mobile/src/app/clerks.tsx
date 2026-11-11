import { useMemo, useState } from "react";
import { View } from "react-native";
import { Button, Field, Headline, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { space, usePalette } from "@/ui/theme";
import { SectionRule, StatusList } from "@/ui/web";
import {
  CLERK_BASIC_REQUIREMENTS,
  CLERK_CLOSING_NOTES,
  CLERK_DAILY_ROUTINE,
  CLERK_MANUAL,
  CLERK_MANUAL_INTRO,
  CLERK_PRACTICAL_FORMATS,
  clerkEntriesByLetter,
} from "@/lib/clerkManual";
import { EXTRAS } from "@/lib/audiencePages";
import { AUDIENCE_PHOTOS } from "@/features/audienceUi";

/**
 * The website's /clerks, in the same order: the daily routine, the manual A
 * to Z, the practical formats, "More for clerks", the next-date reminder, and
 * the basic requirements. Same data (lib/clerkManual.ts). The one addition is
 * a search box over the manual: 99 entries is a long scroll on a phone.
 */
export default function Clerks() {
  const p = usePalette();
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clerkEntriesByLetter()
      .map((g) => ({ ...g, entries: q ? g.entries.filter((e) => `${e.name} ${e.description}`.toLowerCase().includes(q)) : g.entries }))
      .filter((g) => g.entries.length > 0);
  }, [query]);

  return (
    <Screen>
      <T v="label" tone="indigo">Advocate Clerks</T>
      <Headline text="The practice manual, A to *Z*." />
      <T tone="soft">{CLERK_MANUAL_INTRO}</T>
      <Button label="Open Clerk Work: dashboard, cases and the 63 services" href="/clerk-work" />

      <SectionRule />
      <T v="label" tone="indigo">Essential daily routine</T>
      {CLERK_DAILY_ROUTINE.map((block) => (
        <View key={block.heading} style={{ gap: 6 }}>
          <T v="h3">{block.heading}</T>
          {block.items.map((item, i) => (
            <T key={item} v="small" tone="soft">{i + 1}. {item}</T>
          ))}
        </View>
      ))}

      <SectionRule />
      <T v="label" tone="indigo">{CLERK_MANUAL.length} entries</T>
      <T v="h2">The manual</T>
      <Field label="Search the manual" value={query} onChangeText={setQuery} placeholder="vakalatnama, court fee, scrutiny" autoCapitalize="none" />
      {groups.map((g) => (
        <View key={g.letter} style={{ gap: space.md }}>
          <T v="label" tone="indigo" style={{ borderBottomWidth: 1, borderBottomColor: p.line, paddingBottom: 6 }}>{g.letter}</T>
          {g.entries.map((e) => (
            <View key={e.sno} style={{ gap: 4 }}>
              <T v="h3" style={{ fontSize: 15.5 }}>
                <T v="mono" tone="faint" style={{ fontSize: 12 }}>{e.sno}.  </T>
                {e.name}
              </T>
              <T v="small" tone="soft" style={{ paddingLeft: 26 }}>{e.description}</T>
            </View>
          ))}
        </View>
      ))}
      {groups.length === 0 ? <T v="small" tone="soft">No entry matches &ldquo;{query}&rdquo;.</T> : null}

      <SectionRule />
      <T v="label" tone="indigo">Practical formats</T>
      <T tone="soft">Working formats to fill in for daily office use — not pleadings, just the fields each one needs.</T>
      {CLERK_PRACTICAL_FORMATS.map((f) => (
        <View key={f.title} style={{ borderWidth: 1, borderColor: p.line, backgroundColor: p.raised, padding: space.lg, gap: 4 }}>
          <T v="h3" style={{ fontSize: 16 }}>{f.title}</T>
          {f.fields.map((field) => <T key={field} v="small" tone="soft">{field}</T>)}
          {f.note ? <T v="small" tone="faint">{f.note}</T> : null}
        </View>
      ))}

      <SectionRule />
      <FadedPhoto source={AUDIENCE_PHOTOS.clerks} height={230} />
      <T v="label" tone="indigo">More for clerks</T>
      <Headline text="Every filing, date and file in *order*." v="h2" />
      <StatusList items={EXTRAS.clerks} />

      <SectionRule />
      <T v="label" tone="indigo">Next-date reminder</T>
      <Headline text="Put the next date in your *calendar*." v="h2" />
      <T tone="soft">On the phone, Shisho reminds you itself: an alert around 9 am the day before the hearing.</T>
      <Button label="Set a next-date reminder" href="/next-dates" variant="dark" />

      <SectionRule />
      <T v="label" tone="indigo">Basic requirements</T>
      <T v="h2">What a competent clerk should ordinarily have</T>
      {CLERK_BASIC_REQUIREMENTS.map((item, i) => (
        <T key={item} v="small" tone="soft">{i + 1}. {item}</T>
      ))}
      <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.lg }}>
        <T v="small" tone="soft">{CLERK_CLOSING_NOTES}</T>
      </View>
    </Screen>
  );
}
