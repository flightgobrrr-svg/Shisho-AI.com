import { ImageResponse } from "next/og";

/**
 * The brand mark as a favicon, generated at build time — the 志 glyph inside
 * a seal-outlined circle, matching components/brand/Logo.tsx.
 *
 * Generated rather than shipped as a binary so it stays in step with the
 * palette: the two colours below are the same values as --color-seal and
 * --color-paper. It replaces the Next.js scaffold default.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EAE8E1",
          color: "#1E2127",
          borderRadius: "50%",
          border: "2px solid #A32E1F",
          fontSize: 18,
          lineHeight: 1,
        }}
      >
        志
      </div>
    ),
    size,
  );
}
