"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import "./globals.css";

// Last-resort boundary for errors that escape the root layout. It replaces
// the whole document, so it renders its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-canvas p-6 text-fg">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <h1 className="text-lg font-semibold">Something broke.</h1>
          <p className="text-sm text-muted">
            The page hit an error it could not recover from. Your quests are
            safe; reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
