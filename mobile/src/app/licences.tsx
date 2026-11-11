import { useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { Field, Row, Screen, T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import { PageHeader } from "@/ui/web";
import data from "@/data/licences.json";

/**
 * Open-source notices: the fonts and other material the app ships, then every
 * production package with its licence, grouped by licence and searchable. The
 * package list is generated from package-lock.json by `npm run licences`
 * (scripts/licences.mjs), so it matches what is actually installed.
 */
type Pkg = { name: string; version: string; license: string };
const PACKAGES = (data as { generated: string; packages: Pkg[] }).packages;
const GENERATED = (data as { generated: string }).generated;

const FONTS = [
  { name: "EB Garamond", note: "SIL Open Font License 1.1, through @expo-google-fonts/eb-garamond (MIT)" },
  { name: "Instrument Sans", note: "SIL Open Font License 1.1, through @expo-google-fonts/instrument-sans (MIT)" },
  { name: "IBM Plex Mono", note: "SIL Open Font License 1.1, through @expo-google-fonts/ibm-plex-mono (MIT)" },
];

const open = (url: string) => Linking.openURL(url).catch(() => {});

export default function Licences() {
  const p = usePalette();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Pkg[]>();
    for (const pkg of PACKAGES) {
      if (q && !`${pkg.name} ${pkg.license}`.toLowerCase().includes(q)) continue;
      map.set(pkg.license, [...(map.get(pkg.license) ?? []), pkg]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [query]);

  return (
    <Screen gap={space.md}>
      <PageHeader
        eyebrow="Open-source notices"
        headline="Built on open *source*."
        intro={`Shisho AI uses ${PACKAGES.length} open-source packages and three open-licence typefaces. Each is listed with its licence; tap a package to read it on npm, where its full licence text is published.`}
      />

      <T v="label" tone="indigo" style={{ marginTop: space.md }}>Typefaces</T>
      {FONTS.map((f) => (
        <Row key={f.name} title={f.name} detail={f.note} onPress={() => open("https://openfontlicense.org/")} />
      ))}

      <T v="label" tone="indigo" style={{ marginTop: space.lg }}>Packages, by licence</T>
      <Field label="Search packages" value={query} onChangeText={setQuery} placeholder="react-native, MIT, expo" autoCapitalize="none" />
      {groups.length === 0 ? <T v="small" tone="soft">No package matches.</T> : null}
      {groups.map(([licence, pkgs]) => {
        const expanded = openGroup === licence || query.trim().length > 1;
        return (
          <View key={licence} style={{ borderBottomWidth: 1, borderBottomColor: p.line }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpenGroup(openGroup === licence ? null : licence)}
              style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm, opacity: pressed ? 0.6 : 1 })}
            >
              <T v="h3" style={{ flex: 1 }}>{licence}</T>
              <T v="mono" tone="soft">{pkgs.length}</T>
              <T tone="faint" style={{ fontFamily: fonts.sans, fontSize: 18 }} accessibilityElementsHidden importantForAccessibility="no">
                {expanded ? "−" : "+"}
              </T>
            </Pressable>
            {expanded ? (
              <View style={{ paddingBottom: space.md, gap: 2 }}>
                {pkgs.map((pkg) => (
                  <Pressable
                    key={`${pkg.name}@${pkg.version}`}
                    accessibilityRole="link"
                    accessibilityLabel={`${pkg.name}, version ${pkg.version}, ${pkg.license}`}
                    onPress={() => open(`https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`)}
                    style={({ pressed }) => ({ minHeight: 40, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
                  >
                    <T v="small">
                      {pkg.name} <T v="small" tone="faint">{pkg.version}</T>
                    </T>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}

      <T v="small" tone="faint" style={{ marginTop: space.md }}>
        List generated {GENERATED} from the app&apos;s installed packages. Shisho AI&apos;s own name, logo and content are not covered by these licences.
      </T>
    </Screen>
  );
}
