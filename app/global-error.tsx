"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#612D05", color: "#fff" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
          <div>
            <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, opacity: 0.7 }}>Temporary snag</p>
            <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>The site could not load</h1>
            <p style={{ opacity: 0.75, maxWidth: 420, margin: "0 auto 20px" }}>
              Check the live database settings, then retry. {error.digest ? `Ref ${error.digest}` : ""}
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{ background: "#c47a3a", color: "#fff", border: 0, padding: "12px 20px", borderRadius: 8, fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
