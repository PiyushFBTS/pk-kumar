"use client";

import { useEffect } from "react";

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#14213d" }}>Something went wrong</h1>
          <p style={{ color: "#5b6478" }}>Please refresh the page or try again later.</p>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              borderRadius: "0.25rem",
              background: "#14213d",
              color: "#fff",
              border: 0,
              padding: "0.6rem 1.2rem",
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
