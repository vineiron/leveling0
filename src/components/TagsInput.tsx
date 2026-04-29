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
    <div ref={wrapRef} className="relative flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-950">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label={`Remove ${tag}`}
            >
              ×
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
          className="flex-1 min-w-[6rem] bg-transparent px-1 py-0.5 text-sm text-zinc-900 outline-none dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={() => commit()}
          disabled={!draft.trim()}
          aria-label="Add tag"
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
        Press Enter, comma, or click + to add a tag.
      </p>
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {draft.trim() ? "Matching tags" : "Existing tags"}
          </div>
          <ul className="max-h-44 overflow-auto py-1">
            {filteredSuggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(s);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <span className="truncate">{s}</span>
                </button>
              </li>
            ))}
            {draft.trim() && !exactExists && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit();
                  }}
                  className="flex w-full items-center gap-2 border-t border-zinc-200 px-3 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
                  </svg>
                  <span className="text-zinc-500 dark:text-zinc-400">Create</span>
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
