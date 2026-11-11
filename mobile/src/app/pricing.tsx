import { ScrollView, View } from "react-native";
import { Button, Card, Headline, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { ADD_ON, COMPARISON_ROWS, PRICING_FAQS, PRICING_INTRO, TIERS, formatINR } from "@/lib/pricing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { FREE_MONTHLY_TOOL_RUNS } from "@/lib/toolTypes";
import { PayButton } from "@/features/PayButton";

import { FadedPhoto } from "@/ui/FadedPhoto";
/**
 * The website's /pricing page, in the same order: plans, the add-on, the
 * feature comparison and the questions. Every figure and line of copy comes
 * from lib/pricing.ts, so the two can never quote different prices. A paid
 * plan is bought here with Razorpay, one month at a time (features/PayButton).
 */
const t = getDictionary("en").pricingPreview;
const COL = 104;
const LABEL = 150;

export default function Pricing() {
  const p = usePalette();
  return (
    <Screen>
      <FadedPhoto source={require("../../assets/screens/pricing.jpg")} height={180} />
      <T v="label" tone="indigo">Pricing</T>
      <Headline text="Priced for a student *budget*." />
      <T tone="soft">{PRICING_INTRO}</T>

      {TIERS.map((tier) => (
        <View key={tier.id} style={{ borderWidth: 1, borderColor: tier.popular ? p.seal : p.lineStrong, backgroundColor: p.raised, padding: space.xl, gap: space.sm }}>
          {tier.popular ? <T v="label" tone="seal">{t.mostPopular}</T> : null}
          <T v="h3">{tier.name}</T>
          <T v="title" style={{ fontSize: 30, lineHeight: 34 }}>{formatINR(tier.price)}</T>
          <T v="small" tone="soft">{tier.price === 0 ? t.forever : t.perMonth}</T>
          <T v="small" tone="soft">{tier.tagline}</T>
          <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md, gap: 6 }}>
            {tier.features.map((f) => (
              <T key={f} v="small">✓  {f}</T>
            ))}
          </View>
          {tier.id === "free" ? (
            <Button label={tier.cta.label} href="/shisho" variant="ghost" />
          ) : (
            <PayButton plan={tier.id} variant={tier.popular ? "primary" : "ghost"} />
          )}
        </View>
      ))}

      <Card>
        <T v="label" tone="faint">Standalone add-on</T>
        <T v="h3">{ADD_ON.name} — {formatINR(ADD_ON.price)} / month</T>
        <T v="small" tone="soft">{ADD_ON.description}</T>
        <PayButton plan="addon" variant="ghost" />
      </Card>

      <T v="small" tone="soft">
        Each payment buys one month and does not renew by itself. Free and Basic include {FREE_MONTHLY_TOOL_RUNS} runs a month of the
        app&apos;s Shisho tools (contract review, case record, lesson plans, plain-language answers, exam revision); Core,
        Proficient and Shisho only have no limit. In the Library, Free opens one new judgment digest a day and keeps
        every digest you have opened; Basic and above open the whole Library.
      </T>

      <T v="label" tone="indigo" style={{ marginTop: space.xl }}>Compare</T>
      <Headline text="Every plan, feature by *feature*." v="h2" />
      <T v="small" tone="soft">Swipe the table sideways to see every plan.</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: p.line, paddingVertical: space.sm }}>
            <View style={{ width: LABEL }} />
            {TIERS.map((tier) => (
              <T key={tier.id} v="h3" style={{ width: COL, fontSize: 15 }}>{tier.name}</T>
            ))}
          </View>
          {COMPARISON_ROWS.map((row) => (
            <View key={row.label} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: p.line, paddingVertical: space.md }}>
              <T v="small" tone="soft" style={{ width: LABEL, paddingRight: space.sm }}>{row.label}</T>
              {TIERS.map((tier) => {
                const v = row.values[tier.id];
                return (
                  <T key={tier.id} v="small" tone={typeof v === "string" ? "ink" : "faint"} style={{ width: COL }}
                    accessibilityLabel={typeof v === "boolean" ? (v ? "Included" : "Not included") : undefined}>
                    {v === true ? "✓" : v === false ? "—" : v}
                  </T>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <T v="label" tone="indigo" style={{ marginTop: space.xl }}>Questions</T>
      <Headline text="Before you *subscribe*." v="h2" />
      {PRICING_FAQS.map((f) => (
        <View key={f.q} style={{ gap: 4 }}>
          <T v="h3">{f.q}</T>
          <T v="small" tone="soft">{f.a}</T>
        </View>
      ))}
      <Button label="Try Shisho free" href="/shisho" />
    </Screen>
  );
}
