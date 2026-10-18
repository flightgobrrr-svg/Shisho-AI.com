import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * A share card for a tool or reference page: the same cream paper, ink and
 * seal red as the site's own card (app/opengraph-image.tsx), with this page's
 * eyebrow and title in place of the site headline. Generated, so a link to
 * the limitation checker previews as that page rather than the homepage.
 */
export const OG_SIZE = { width: 1200, height: 630 };

export async function ogCard({
  eyebrow,
  title,
  line,
}: {
  eyebrow: string;
  title: string;
  /** One supporting line under the title. */
  line?: string;
}) {
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
          <img src={logoSrc} alt="" width={64} height={64} style={{ width: 64, height: 64 }} />
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
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#A32E1F",
              fontFamily: "monospace",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ marginTop: 20, fontSize: 68, color: "#1E2127", lineHeight: 1.1 }}>
            {title}
          </div>
          {line ? (
            <div style={{ marginTop: 24, fontSize: 28, color: "#3A3F49", lineHeight: 1.3 }}>
              {line}
            </div>
          ) : null}
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
          <div>Indian law · every citation checked</div>
          <div style={{ fontFamily: "monospace" }}>NOT LEGAL ADVICE</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
