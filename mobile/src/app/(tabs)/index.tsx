import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Button, Card, Chip, Headline, Screen, T } from "@/ui/components";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { StateSelect } from "@/ui/StateSelect";
import { fonts, space, usePalette } from "@/ui/theme";
import { dueCount, revisionStore, welcomeStore } from "@/state/stores";
import { getDictionary, type Segment } from "@/lib/i18n/dictionaries";
import { MAP_STAGES, PRODUCT_META } from "@/lib/sitemap";
import { PAGE_AUDIENCES } from "@/lib/audiences";
import { TIERS, formatINR } from "@/lib/pricing";
import { DRAFT_EXCERPT } from "@/lib/showcase";
import { AUDIENCE_PHOTOS, AudienceSample } from "@/features/audienceUi";
import { appRoute } from "@/features/audienceRoutes";

/**
 * The website's homepage, section for section and in the same order, read
 * from the same copy and data files (lib/i18n/dictionaries.ts, lib/sitemap.ts,
 * lib/audiences.ts, lib/pricing.ts, lib/showcase.ts), laid out for a phone the
 * way the website lays itself out at phone width.
 */
const t = getDictionary("en");
/** Segments with one emphasised word, as the shared Headline expects ("a *word* b"). */
const asText = (segs: Segment[]) => segs.map((s) => (s.em ? `*${s.text}*` : s.text)).join("");
const VERBS = ["Read", "Research", "Analyse", "Argue", "Evolve"];
const PRODUCT_ROUTE: Record<string, Href> = { "draft-bot": "/shisho", library: "/library", courses: "/courses" };

export default function Home() {
  const router = useRouter();
  const p = usePalette();
  const { value: welcome } = welcomeStore.use();
  const { value: cards } = revisionStore.use();
  const due = dueCount(cards);

  // The welcome screen is offered once, never forced: it has a Skip.
  useEffect(() => {
    if (!welcome.seen) router.push("/welcome");
  }, [welcome.seen, router]);

  const Link = ({ label, href }: { label: string; href: Href }) => (
    <Pressable accessibilityRole="link" onPress={() => router.push(href)} hitSlop={8}>
      <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: p.ink, textDecorationLine: "underline" }}>{label}</Text>
    </Pressable>
  );
  const Rule = () => <View style={{ height: 1, backgroundColor: p.line, marginVertical: space.xl }} />;

  return (
    <Screen>
      {due > 0 ? (
        <Card>
          <T v="h3">{due === 1 ? "1 case brief is due" : `${due} case briefs are due`}</T>
          <T v="small" tone="soft">Revision keeps what you read.</T>
          <Button label="Revise now" href="/revision" variant="dark" />
        </Card>
      ) : null}

      {/* Hero: short, so the actions below are on the first screen. */}
      <FadedPhoto source={require("../../../assets/gurukul-teaching.jpg")} height={170} opacity={0.6} />
      <View style={{ gap: space.sm, marginTop: -space.sm }}>
        <T v="label" tone="faint">{t.hero.eyebrow}</T>
        <Headline text={asText(t.hero.line1)} />
        <T v="h2" tone="seal" style={{ fontSize: 22, lineHeight: 27 }}>{asText(t.hero.line2)}</T>
      </View>

      {/* Start here: the three things most people open the app to do. */}
      <View style={{ gap: space.sm }}>
        <T v="label" tone="indigo">Start here</T>
        <ActionTile
          title="Draft with Shisho"
          detail="Describe the facts, get a first draft, then have it marked up like a senior would."
          href="/shisho"
          primary
        />
        <ActionTile title="Take a mock test" detail="CLAT, judicial services and court staff papers. Works offline." href="/tests" />
        <ActionTile title="Check a deadline" detail="The last day to file under the Limitation Act, 1963." href="/limitation" />
      </View>

      {/* Quick tools */}
      <View style={{ gap: space.sm }}>
        <T v="label" tone="faint">Quick tools</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          <Chip label="Look up a judgment" onPress={() => router.push("/library/lookup")} />
          <Chip label="Bare Acts" onPress={() => router.push("/library/provisions")} />
          <Chip label="IPC to BNS" onPress={() => router.push("/ipc-bns")} />
          <Chip label="Trace a doctrine" onPress={() => router.push("/tools/doctrine")} />
          <Chip label="Mark my draft" onPress={() => router.push("/shisho?mode=review")} />
        </View>
      </View>

      {/* Explore: the website's homepage, section by section, below the actions. */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.xl }}>
        <T v="label" tone="faint">Explore</T>
        <View style={{ flex: 1, height: 1, backgroundColor: p.line }} />
      </View>
      <T tone="soft">{t.hero.subhead}</T>
      {/* As on the website's hero: which High Court hears a matter from your state. */}
      <StateSelect label="Where are you from" />

      {/* Find the stage you are at */}
      <T v="label" tone="indigo">{t.matterFlow.eyebrow}</T>
      <Headline text={asText(t.matterFlow.heading)} v="h2" />
      <Link label={t.matterFlow.seeMap} href="/map" />
      <View style={{ borderLeftWidth: 1, borderLeftColor: p.line, marginLeft: 12, paddingLeft: space.lg, gap: space.lg }}>
        {MAP_STAGES.map((stage) => (
          <Pressable key={stage.n} onPress={() => router.push("/map")} accessibilityRole="link" style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
              <View style={{ width: 22, height: 22, borderWidth: 1, borderColor: p.lineStrong, alignItems: "center", justifyContent: "center", marginLeft: -space.lg - 12, backgroundColor: p.paper }}>
                <T v="mono" style={{ fontSize: 11, lineHeight: 14 }}>{stage.n}</T>
              </View>
              <T v="h3">{t.matterFlow.stages[stage.n]?.title ?? stage.title}</T>
            </View>
            <T v="small" tone="soft">{t.matterFlow.stages[stage.n]?.summary ?? stage.summary}</T>
            {stage.serves.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {stage.serves.map((product) => (
                  <Pressable key={product} onPress={() => router.push(PRODUCT_ROUTE[product])} accessibilityRole="link"
                    style={{ borderWidth: 1, borderColor: p.lineStrong, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <T v="label" tone="soft" style={{ fontSize: 10 }}>{PRODUCT_META[product].label}</T>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* Shisho · Legal Library · Courses */}
      <Rule />
      {t.featureStrip.features.map((f, i) => (
        <Card key={f.name}>
          <T v="h3">{f.name}</T>
          <T v="small" tone="soft">{f.body}</T>
          <Link label={t.featureStrip.exploreLabel(f.name)} href={(["/shisho", "/library", "/courses"] as const)[i]} />
        </Card>
      ))}

      {/* See what a marked-up draft looks like */}
      <Rule />
      <View style={{ alignSelf: "center", borderWidth: 1, borderColor: p.lineStrong, paddingHorizontal: space.md, paddingVertical: 4 }}>
        <T v="label" tone="soft">{t.productShowcase.pill}</T>
      </View>
      <Headline text={asText(t.productShowcase.heading)} v="h2" />
      <T tone="soft">{t.productShowcase.body}</T>
      <View style={{ gap: space.sm }}>
        <Button label={t.productShowcase.ctaPrimary} href="/shisho" />
        <Button label={t.productShowcase.ctaSecondary} href="/pricing" variant="ghost" />
      </View>
      <Card>
        {DRAFT_EXCERPT.map((line) =>
          line.heading ? (
            <T key={line.text} v="label" tone="soft">{line.text}</T>
          ) : (
            <Text maxFontSizeMultiplier={1.35} key={line.text} style={{ fontFamily: fonts.display, fontSize: 15, lineHeight: 21, color: p.ink }}>
              <Text maxFontSizeMultiplier={1.35} style={line.note !== undefined ? { textDecorationLine: "underline", textDecorationColor: p.seal } : undefined}>{line.text}</Text>
              {line.note !== undefined ? <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sansSemi, fontSize: 11, color: p.seal }}> {line.note + 1}</Text> : null}
            </Text>
          ),
        )}
        <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md, gap: space.sm }}>
          <T v="label" tone="faint">Shisho notes</T>
          {t.productShowcase.miniNotes.map((note, i) => (
            <View key={note} style={{ flexDirection: "row", gap: space.sm }}>
              <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sansSemi, fontSize: 12, color: p.seal }}>{i + 1}</Text>
              <T v="small" style={{ flex: 1 }}>{note}</T>
            </View>
          ))}
        </View>
      </Card>

      {/* Who it is for */}
      <Rule />
      <T v="label" tone="indigo">Who it is for</T>
      <Headline text="Built for students and advocates. Next, for *everyone* the law touches." v="h2" />
      <T tone="soft">
        Advocates can use Shisho today. The rest are planned. Each section says which, and each has its own page with what exists now and what is to come.
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {PAGE_AUDIENCES.map((a) => (
          <Chip key={a.slug} label={a.name} onPress={() => router.push(`/for/${a.slug}` as Href)} />
        ))}
      </View>
      {PAGE_AUDIENCES.map((a) => (
        <View key={a.slug} style={{ gap: space.md, borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.xl, marginTop: space.md }}>
          {a.photo && AUDIENCE_PHOTOS[a.slug] ? (
            <FadedPhoto source={AUDIENCE_PHOTOS[a.slug]} height={230} />
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
            <T v="label" tone="indigo">{a.eyebrow}</T>
            <T v="label" tone="faint">{a.live ? "Available now" : "Planned"}</T>
          </View>
          <Headline text={a.headline} v="h2" />
          <T tone="soft">{a.blurb}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {a.chips.map((c) => <Chip key={c} label={c} />)}
          </View>
          <Link label={`See the ${a.name} page`} href={(appRoute(`/for/${a.slug}`) ?? "/for") as Href} />
          <AudienceSample audience={a} />
        </View>
      ))}

      {/* A student of law, for life */}
      <Rule />
      <T v="label" tone="indigo">Always learning</T>
      <Headline text="A student of *law*, for life." v="h2" />
      <T tone="soft">Shisho AI keeps pace with the way the profession works and learns.</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {VERBS.map((v) => <Chip key={v} label={v} />)}
      </View>
      <T v="label" tone="faint">Wisdom · Guidance · Intelligence</T>

      {/* Pricing preview */}
      <Rule />
      <T v="label" tone="indigo">{t.pricingPreview.eyebrow}</T>
      <Headline text={asText(t.pricingPreview.heading)} v="h2" />
      <Link label={t.pricingPreview.seeFull} href="/pricing" />
      {TIERS.map((tier) => (
        <Pressable key={tier.id} onPress={() => router.push("/pricing")} accessibilityRole="link"
          style={{ borderWidth: 1, borderColor: tier.popular ? p.seal : p.lineStrong, backgroundColor: p.raised, padding: space.xl, gap: 6 }}>
          {tier.popular ? <T v="label" tone="seal">{t.pricingPreview.mostPopular}</T> : null}
          <T v="h3">{tier.name}</T>
          <T v="title" style={{ fontSize: 30, lineHeight: 34 }}>{formatINR(tier.price)}</T>
          <T v="small" tone="soft">{tier.price === 0 ? t.pricingPreview.forever : t.pricingPreview.perMonth}</T>
          <T v="small" tone="soft">{t.pricingPreview.taglines[tier.id]}</T>
        </Pressable>
      ))}

      {/* Put your draft in front of a mentor */}
      <View style={{ backgroundColor: p.ink, padding: space.xl, gap: space.md, marginTop: space.xl, marginHorizontal: -space.xl }}>
        <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.display, fontSize: 26, lineHeight: 31, color: p.onInk, textAlign: "center" }}>
          {t.finalCta.heading.map((s, i) => (
            <Text maxFontSizeMultiplier={1.35} key={i} style={s.em ? { fontFamily: fonts.displayItalic, textDecorationLine: "underline" } : undefined}>{s.text}</Text>
          ))}
        </Text>
        <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: p.onInk, opacity: 0.8, textAlign: "center" }}>{t.finalCta.body}</Text>
        <Button label={t.finalCta.ctaPrimary} href="/shisho" />
        <Pressable accessibilityRole="link" onPress={() => router.push("/pricing")} style={{ minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: p.onInk }}>
          <Text maxFontSizeMultiplier={1.35} style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: p.onInk }}>{t.finalCta.ctaSecondary}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

/** A large, full-width action: the title, one line, and a chevron. */
function ActionTile({ title, detail, href, primary }: { title: string; detail: string; href: Href; primary?: boolean }) {
  const router = useRouter();
  const p = usePalette();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="link"
      accessibilityLabel={`${title}. ${detail}`}
      style={({ pressed }) => ({
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        backgroundColor: primary ? p.ink : pressed ? p.line : p.raised,
        borderWidth: 1,
        borderColor: primary ? p.ink : p.line,
        borderLeftWidth: primary ? 1 : 3,
        borderLeftColor: primary ? p.ink : p.seal,
        opacity: pressed && primary ? 0.9 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.display, fontSize: 20, color: primary ? p.onInk : p.ink }}>{title}</Text>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.sans, fontSize: 14, lineHeight: 19, color: primary ? p.onInk : p.inkSoft, opacity: primary ? 0.85 : 1 }}>{detail}</Text>
      </View>
      <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.sans, fontSize: 24, color: primary ? p.onInk : p.inkFaint }} accessibilityElementsHidden importantForAccessibility="no">
        ›
      </Text>
    </Pressable>
  );
}
