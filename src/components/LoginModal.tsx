"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FlameIcon } from "./BrandMark";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";

type Props = { open: boolean; onClose: () => void };

export function LoginModal({ open, onClose }: Props) {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setBusy(false);
    }
    // On success the browser is redirected to Google — no further state to set.
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign in" widthClass="max-w-sm" hideHeaderBorder>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle text-accent-text">
          <FlameIcon className="h-6 w-6" />
        </span>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-fg">
            Sync your board everywhere
          </h3>
          <p className="text-sm text-muted">
            Sign in to keep your items across devices. Without an account, items stay in this
            browser only.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm font-medium text-fg shadow-xs transition-colors hover:bg-surface disabled:opacity-50"
        >
          {busy ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.2 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.6 7.4 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41 35.6 45 30.3 45 24c0-1.2-.1-2.4-.4-3.5z" />
            </svg>
          )}
          {busy ? "Redirecting…" : "Continue with Google"}
        </button>
        {error && <p className="text-sm text-danger-text">{error}</p>}
      </div>
    </Modal>
  );
}
