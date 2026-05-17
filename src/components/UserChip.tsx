"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { btn } from "./ui";

function pickAvatarUrl(
  meta: Record<string, unknown> | undefined,
): string | null {
  if (!meta) return null;
  const url = (meta.avatar_url ?? meta.picture) as unknown;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local[0]}•••${domain}`;
  return `${local[0]}•••${local[local.length - 1]}${domain}`;
}

function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 65% 45%)`;
}

type Props = {
  onSignInClick: () => void;
};

export function UserChip({ onSignInClick }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [revealEmail, setRevealEmail] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) setRevealEmail(false);
  }, [open]);

  async function handleConfirmSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmOpen(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onSignInClick}
        className="flex items-center gap-2 rounded-full border border-border bg-elevated py-1 pl-1 pr-3 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
        title="Sign in"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-faint">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" />
          </svg>
        </span>
        <span className="text-xs font-medium">Sign in</span>
      </button>
    );
  }

  const email = user.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();
  const color = avatarColor(email);
  const avatarUrl = pickAvatarUrl(
    user.user_metadata as Record<string, unknown> | undefined,
  );
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? (user.user_metadata.full_name as string)
      : null;

  function Avatar({ size }: { size: number }) {
    if (avatarUrl) {
      return (
        // biome-ignore lint/performance/noImgElement: Google avatar host isn't in the next.config image allowlist; <img> with referrerPolicy=no-referrer is intentional
        <img
          src={avatarUrl}
          alt={fullName ?? email}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <span
        className="flex items-center justify-center rounded-full font-semibold text-white"
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: size * 0.45,
        }}
      >
        {initial}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-elevated py-1 pl-1 pr-2.5 text-sm text-fg transition-colors hover:bg-surface"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar size={24} />
        <span className="hidden font-mono text-xs text-muted sm:inline">
          {redactEmail(email)}
        </span>
        <svg
          className="h-3.5 w-3.5 text-faint"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-64 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-border bg-elevated shadow-lg"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
            <Avatar size={36} />
            <div className="min-w-0 flex-1">
              {fullName && (
                <div className="truncate text-sm font-medium text-fg">
                  {fullName}
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs text-muted [scrollbar-width:thin]">
                  {revealEmail ? email : redactEmail(email)}
                </div>
                <button
                  type="button"
                  onClick={() => setRevealEmail((v) => !v)}
                  aria-label={revealEmail ? "Hide email" : "Show email"}
                  aria-pressed={revealEmail}
                  className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface hover:text-fg"
                >
                  {revealEmail ? (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 0010 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                        clipRule="evenodd"
                      />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path
                        fillRule="evenodd"
                        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-fg transition-colors hover:bg-surface"
            >
              <svg
                className="h-4 w-4 text-faint"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 3a.75.75 0 000 1.5H6.25a.75.75 0 00-.75.75v9.5c0 .41.34.75.75.75H9A.75.75 0 019 17H6.25A2.25 2.25 0 014 14.75v-9.5A2.25 2.25 0 016.25 3H9zm4.72 3.97a.75.75 0 011.06 0l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06l1.22-1.22H9a.75.75 0 010-1.5h5.94l-1.22-1.22a.75.75 0 010-1.06z" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!signingOut) setConfirmOpen(false);
        }}
        title="Sign out?"
        widthClass="max-w-sm"
        hideHeaderBorder
      >
        <p className="text-sm text-muted">
          You&apos;ll be signed out of{" "}
          <span className="font-medium text-fg">{email}</span>. Your synced
          quests stay safe in the cloud.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={signingOut}
            className={btn.secondary}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSignOut}
            disabled={signingOut}
            className={btn.dangerSolid}
          >
            {signingOut && <Spinner className="h-3.5 w-3.5" />}
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
