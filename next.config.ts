import type { NextConfig } from "next";

/* The fourteen language homepages removed on 21 Oct 2026 (see the header of
   lib/i18n/dictionaries.ts). Old links land on the English homepage. */
const REMOVED_LOCALES = ["as", "brx", "doi", "ks", "kok", "mai", "mni", "ne", "or", "pa", "sa", "sat", "sd", "ur"];

const nextConfig: NextConfig = {
  experimental: {
    /* Cross-route morph via the View Transitions API. Native — no animation
       library, and it degrades to an ordinary navigation in engines that
       don't support it. Timing and the reduced-motion override live in
       app/globals.css under "Route transitions". */
    viewTransition: true,
  },
  /* HarfBuzz loads its .wasm at runtime and shapes Telugu for Clerk Work's
     PDFs (lib/clerkTelugu.ts); bundling would lose the wasm file. */
  serverExternalPackages: ["harfbuzzjs"],
  /* The Telugu font files are read from disk at runtime, so deployments must
     carry them for the Clerk Work routes that render papers. */
  outputFileTracingIncludes: {
    "/api/mobile/clerk/**/*": ["./node_modules/@expo-google-fonts/noto-sans-telugu/400Regular/*.ttf", "./node_modules/@expo-google-fonts/noto-sans-telugu/700Bold/*.ttf"],
  },
  redirects() {
    return REMOVED_LOCALES.map((l) => ({ source: `/${l}`, destination: "/", permanent: true }));
  },
};

export default nextConfig;
