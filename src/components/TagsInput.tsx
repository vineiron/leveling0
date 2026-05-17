"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
};

export function TagsInput({ value, onChange, suggestions = [], placeholder }: Props) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const filteredSuggestions = useMemo(() => {
    const taken = new Set(value);
    const q = draft.trim().toLowerCase();
    return suggestions
      .filter((s) => !taken.has(s))
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [suggestions, value, draft]);

  useEffect(() => {
    if (!focused) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [focused]);

  function commit(raw?: string) {
    const t = (raw ?? draft).trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
    inputRef.current?.focus();
  }

  const showSuggestions = focused && filteredSuggestions.length > 0;
  const exactExists = suggestions.includes(draft.trim()) || value.includes(draft.trim());

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1.5">
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-surface px-2 py-1.5 transition-colors ${
          focused ? "border-accent ring-2 ring-ring" : "border-border"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-0.5 text-[11px] font-medium text-fg"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded-full text-faint transition-colors hover:bg-danger-subtle hover:text-danger-text"
              aria-label={`Remove ${tag}`}
            >
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              e.stopPropagation();
              commit();
            } else if (e.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            } else if (e.key === "Escape") {
              setFocused(false);
            }
          }}
          placeholder={placeholder ?? "Add tag…"}
          className="min-w-[6rem] flex-1 bg-transparent px-1 py-0.5 text-sm text-fg outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={() => commit()}
          disabled={!draft.trim()}
          aria-label="Add tag"
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-accent-text disabled:opacity-40"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
          </svg>
        </button>
      </div>
      <p className="text-[11px] text-faint">
        Press Enter, comma, or click + to add a tag.
      </p>
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 origin-top animate-pop-in overflow-hidden rounded-xl border border-border bg-elevated shadow-lg">
          <div className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
            {draft.trim() ? "Matching tags" : "Existing tags"}
          </div>
          <ul className="max-h-44 overflow-auto p-1">
            {filteredSuggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(s);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-fg transition-colors hover:bg-surface"
                >
                  <span className="truncate">{s}</span>
                </button>
              </li>
            ))}
            {draft.trim() && !exactExists && (
              <li className="mt-1 border-t border-border pt-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-fg transition-colors hover:bg-surface"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-accent-text"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
                  </svg>
                  <span className="text-muted">Create</span>
                  <span className="font-medium">“{draft.trim()}”</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
