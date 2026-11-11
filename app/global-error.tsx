"use client";

/**
 * The last-resort error screen, used when the root layout itself fails. It
 * replaces the whole document, so it cannot rely on the site's components or
 * styles; it is deliberately plain and self-contained.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EAE8E1",
          color: "#1E2127",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ maxWidth: 480, padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Shisho AI is having trouble.</h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "#3A3F49" }}>
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44,
              padding: "0 20px",
              fontSize: 15,
              background: "#1E2127",
              color: "#EAE8E1",
              border: 0,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
