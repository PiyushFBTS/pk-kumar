"use client";

import { useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

// Route-level error boundary for the app. Logs the error (hook up a real
// monitoring service such as Sentry in production — see DEPLOYMENT.md).
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <Section>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-semibold text-brand">Something went wrong</h1>
        <p className="mt-3 text-muted">
          An unexpected error occurred. Please try again, or contact us if it persists.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="outline">
            Go home
          </Button>
        </div>
      </div>
    </Section>
  );
}
