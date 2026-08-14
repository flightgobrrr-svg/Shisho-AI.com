import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The social card. Generated, so it carries the real palette and the real
 * headline rather than a screenshot that goes stale.
 *
 * Deliberately typographic: the two-tone headline that opens the site, the
 * brand emblem, and the disclaimer strip. No stock photography, consistent
 * with the rest of the design.
 *
 * The emblem is read off disk and inlined as a data URI: ImageResponse renders
 * on the server with no origin to resolve a relative src against, so a plain
 * "/shisho-emblem.png" would silently render nothing.
 *
 * It uses the pre-cropped emblem rather than the full lockup. Satori, which
 * renders this, does not honour object-fit/object-position, so cropping in CSS
 * here silently does nothing and the whole lockup — wordmark and all — squeezes
 * into the mark's slot.
 *
 * Fonts are not loaded here — ImageResponse would need the binaries fetched
 * at build. The system serif fallback is close enough at this size, and the
 * layout carries the identity.
 */

export const alt =
  "Shisho AI — your AI legal mentor, built for Indian law";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/shisho-emblem.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EAE8E1",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ width: 64, height: 64 }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#3A3F49",
              fontFamily: "monospace",
            }}
          >
            Shisho AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 62, color: "#1E2127", lineHeight: 1.1 }}>
            Every great lawyer had a shisho.
          </div>
          <div style={{ fontSize: 62, color: "#A32E1F", lineHeight: 1.1 }}>
            Now yours is AI — built for Indian law.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#3A3F49",
            borderTop: "1px solid rgba(30,33,39,0.15)",
            paddingTop: 24,
          }}
        >
          <div>Courses · Legal Library · Shisho</div>
          <div style={{ fontFamily: "monospace" }}>SC &amp; HIGH COURTS</div>
        </div>
      </div>
    ),
    size,
  );
}
