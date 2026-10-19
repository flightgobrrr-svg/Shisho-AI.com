import { router, Stack, useLocalSearchParams } from "expo-router";
import { Headline, Row, Screen, T, TextButton } from "@/ui/components";
import { AUDIENCE_GROUPS } from "@/lib/nav";
import { AUDIENCES } from "@/lib/audiences";
import { appRoute } from "@/features/audienceRoutes";

/**
 * The twelve audiences from the promo video, in the same four sections as
 * the website's "Who it's for" menu (lib/nav.ts). Three already have a screen
 * in the app; the other nine open a page that says plainly they are planned.
 */
/* One line per group in the list (its topics), not the full pitch: the pitch
   is on the group's own page, and five-line rows made the list a long scroll. */
const summaryFor = (siteHref: string) => {
  const slug = siteHref.startsWith("/for/") ? siteHref.slice(5) : null;
  const byHref = AUDIENCES.find((a) => (slug ? a.slug === slug : a.href === siteHref));
  return byHref?.chips.join(" \u00b7 ");
};

/** `?group=Exams` (from Home) shows that one section; no group shows all four. */
export default function WhoItsFor() {
  const { group } = useLocalSearchParams<{ group?: string }>();
  const one = AUDIENCE_GROUPS.find((g) => g.heading === group);

  if (one) {
    return (
      <Screen gap={4}>
        <Stack.Screen options={{ title: one.heading }} />
        <GroupSection heading={one.heading} links={one.links} first />
        <TextButton label="Everyone it's for" onPress={() => router.push("/for")} />
      </Screen>
    );
  }

  return (
    <Screen gap={4}>
      <Headline text="Built for students and advocates. Next, for *everyone* the law touches." v="h2" />
      <T tone="soft" style={{ marginTop: 8 }}>
        Advocates can use Shisho today; planned groups say so. Each has a page with what works now and what is to come.
      </T>

      {AUDIENCE_GROUPS.map((g) => (
        <GroupSection key={g.heading} heading={g.heading} links={g.links} />
      ))}
    </Screen>
  );
}

function GroupSection({ heading, links, first }: (typeof AUDIENCE_GROUPS)[number] & { first?: boolean }) {
  return (
    <>
      {/* On a one-section view the screen title already names the section. */}
      {first ? null : <T v="label" tone="indigo" style={{ marginTop: 24 }}>{heading}</T>}
      {links.map((link) => (
        <Row
          key={link.href}
          title={link.label}
          detail={summaryFor(link.href)}
          status={link.planned ? "planned" : "live"}
          href={appRoute(link.href) ?? undefined}
        />
      ))}
    </>
  );
}
