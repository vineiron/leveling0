"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  allTags: string[];
  activeTags: string[];
  onChange: (next: string[]) => void;
};

export function TagFilter({ allTags, activeTags, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
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

  const visible = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.toLowerCase().includes(q));
  }, [allTags, tagQuery]);

  const disabled = allTags.length === 0;

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          setTimeout(() => searchRef.current?.focus(), 0);
        }}
        disabled={disabled}
        aria-label="Filter by tags"
        aria-expanded={open}
        title={disabled ? "No tags yet" : "Filter by tags"}
        className={`relative inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors disabled:opacity-40 ${
          activeTags.length > 0
            ? "border-accent-border bg-accent-subtle text-accent-text"
            : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg"
        }`}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 01.6 1.2L12 11.31V16a.75.75 0 01-1.17.62l-2.5-1.67A.75.75 0 018 14.33V11.3L3.15 5.2A.75.75 0 013 4.75z" />
        </svg>
        <span className="hidden sm:inline">
          {activeTags.length > 0
            ? `${activeTags.length} tag${activeTags.length > 1 ? "s" : ""}`
            : "Filter"}
        </span>
      </button>
      {open && !disabled && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-72 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-border bg-elevated shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Search tags…"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 pr-7 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-elevated focus:ring-2 focus:ring-ring"
              />
              {tagQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTagQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear tag search"
                  className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-faint hover:bg-surface-2 hover:text-fg"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="shrink-0 text-xs font-medium text-accent-text hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-auto p-1">
            {visible.length === 0 && (
              <li className="px-3 py-3 text-xs text-muted">
                {tagQuery ? `No tags match “${tagQuery}”` : "No tags yet"}
              </li>
            )}
            {visible.map((t) => {
              const on = activeTags.includes(t);
              return (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        activeTags.includes(t)
                          ? activeTags.filter((x) => x !== t)
                          : [...activeTags, t],
                      )
                    }
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg transition-colors hover:bg-surface"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-md border transition-colors ${
                        on
                          ? "border-accent bg-accent text-accent-fg"
                          : "border-border-strong"
                      }`}
                    >
                      {on && (
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{t}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
