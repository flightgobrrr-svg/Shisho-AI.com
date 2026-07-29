import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* Cross-route morph via the View Transitions API. Native — no animation
       library, and it degrades to an ordinary navigation in engines that
       don't support it. Timing and the reduced-motion override live in
       app/globals.css under "Route transitions". */
    viewTransition: true,
  },
};

export default nextConfig;
