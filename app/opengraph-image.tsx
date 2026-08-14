import { ImageResponse } from "next/og";

/**
 * The social card. Generated, so it carries the real palette and the real
 * headline rather than a screenshot that goes stale.
 *
 * Deliberately typographic: the two-tone headline that opens the site, the
 * seal mark, and the disclaimer strip. No stock photography, consistent with
 * the rest of the design.
 *
 * Fonts are not loaded here — ImageResponse would need the binaries fetched
 * at build. The system serif fallback is close enough at this size, and the
 * layout carries the identity.
 */

export const alt =
  "Shisho AI — your AI legal mentor, built for Indian law";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "2px solid #A32E1F",
              color: "#1E2127",
              fontSize: 22,
            }}
          >
            志
          </div>
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
