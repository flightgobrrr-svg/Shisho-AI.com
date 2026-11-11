import { useColorScheme } from "react-native";

/**
 * Shisho's own palette, carried over from the website (app/globals.css) so the
 * app and the site read as one product. Every text colour here was checked at
 * 4.5:1 or better against both surfaces it sits on; `inkFaint` exists because
 * text drawn at reduced opacity failed that bar on the site.
 */
const light = {
  ink: "#1E2127",
  inkSoft: "#3A3F49",
  inkFaint: "#5B5F66",
  paper: "#EAE8E1",
  raised: "#F2F1EC",
  seal: "#A32E1F",
  sealDark: "#85251A",
  indigo: "#2C3A57",
  line: "rgba(30,33,39,0.18)",
  lineStrong: "rgba(30,33,39,0.45)",
  onInk: "#F2F1EC",
};

const dark: typeof light = {
  ink: "#ECE9E2",
  inkSoft: "#B3AEA4",
  inkFaint: "#99948B",
  paper: "#1C1A17",
  raised: "#262320",
  seal: "#EC5D42",
  sealDark: "#CF4A30",
  indigo: "#93A8CF",
  line: "rgba(236,233,226,0.18)",
  lineStrong: "rgba(236,233,226,0.45)",
  onInk: "#1C1A17",
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? dark : light;
}

/** Font family names registered in app/_layout.tsx. */
export const fonts = {
  display: "EBGaramond_600SemiBold",
  displayItalic: "EBGaramond_600SemiBold_Italic",
  sans: "InstrumentSans_400Regular",
  sansMedium: "InstrumentSans_500Medium",
  sansSemi: "InstrumentSans_600SemiBold",
  mono: "IBMPlexMono_400Regular",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** 48dp: the minimum comfortable touch target on both platforms. */
export const TOUCH = 48;
