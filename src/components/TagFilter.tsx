"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  allTags: string[];
  activeTags: string[];
  onChange: (next: string[]) => void;
  /** Controlled by Board so the "f" shortcut shares the other global guards. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TagFilter({
  allTags,
  activeTags,
  onChange,
  open,
  onOpenChange,
}: Props) {
  const [tagQuery, setTagQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Only scroll the highlighted row into view for keyboard moves — otherwise
  // the list would jump under the pointer while hovering.
  const keyNav = useRef(false);

  // Fresh query + highlight on every open, and focus the search field —
  // whether the popover was opened by click or by the "f" shortcut.
  useEffect(() => {
    if (!open) return;
    setTagQuery("");
    setSelected(0);
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      // Two TagFilters share this open state (desktop top bar + mobile
      // toolbar). The one hidden by a media query has no offsetParent and
      // must ignore outside clicks, or it would close the visible one on
      // every mousedown — including clicks on a tag row.
      const wrap = wrapRef.current;
      if (!wrap || wrap.offsetParent === null) return;
      if (!wrap.contains(e.target as Node)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const visible = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.toLowerCase().includes(q));
  }, [allTags, tagQuery]);

  // Keep the highlight in range when the list shrinks (search, tag removed).
  useEffect(() => {
    setSelected((s) =>
      visible.length === 0 ? 0 : Math.min(s, visible.length - 1),
    );
  }, [visible]);

  useEffect(() => {
    if (!keyNav.current) return;
    keyNav.current = false;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const disabled = allTags.length === 0;

  function toggle(tag: string) {
    onChange(
      activeTags.includes(tag)
        ? activeTags.filter((x) => x !== tag)
        : [...activeTags, tag],
    );
  }

  function onSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      keyNav.current = true;
      setSelected((s) => (visible.length ? (s + 1) % visible.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      keyNav.current = true;
      setSelected((s) =>
        visible.length ? (s - 1 + visible.length) % visible.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const tag = visible[selected];
      // Stay open — filtering is multi-select, so Enter is "toggle", not "pick".
      if (tag) toggle(tag);
    }
  }

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          onOpenChange(!open);
        }}
        disabled={disabled}
        aria-label="Filter by tags"
        aria-keyshortcuts="f"
        aria-expanded={open}
        title={disabled ? "No tags yet" : "Filter by tags (F)"}
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
        <kbd
          className={`hidden rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium lg:block ${
            activeTags.length > 0
              ? "border-accent-border text-accent-text/75"
              : "border-border bg-elevated text-faint"
          }`}
        >
          F
        </kbd>
      </button>
      {open && !disabled && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-72 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-border bg-elevated shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={tagQuery}
                onChange={(e) => {
                  setTagQuery(e.target.value);
                  setSelected(0);
                }}
                onKeyDown={onSearchKeyDown}
                role="combobox"
                aria-expanded
                aria-controls="tag-filter-list"
                aria-activedescendant={
                  visible[selected] ? `tag-filter-opt-${selected}` : undefined
                }
                placeholder="Search tags…"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 pr-7 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-elevated focus:ring-2 focus:ring-ring"
              />
              {tagQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTagQuery("");
                    setSelected(0);
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
          {/* Options are direct children of the listbox — an intervening <li>
              would carry an implicit listitem role and break ownership. */}
          <div
            ref={listRef}
            id="tag-filter-list"
            role="listbox"
            aria-multiselectable="true"
            aria-label="Tags"
            className="max-h-64 overflow-auto p-1"
          >
            {visible.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted">
                {tagQuery ? `No tags match “${tagQuery}”` : "No tags yet"}
              </div>
            )}
            {visible.map((t, idx) => {
              const on = activeTags.includes(t);
              const isSel = idx === selected;
              return (
                <button
                  key={t}
                  type="button"
                  id={`tag-filter-opt-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={on}
                  onMouseMove={() => {
                    keyNav.current = false;
                    setSelected(idx);
                  }}
                  onClick={() => toggle(t)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg transition-colors ${
                    isSel ? "bg-accent-subtle" : "hover:bg-surface"
                  }`}
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
              );
            })}
          </div>
          <div className="flex items-center gap-3 border-t border-border bg-surface px-2.5 py-1.5 text-[11px] text-faint">
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-border bg-elevated px-1 py-0.5 font-mono">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-border bg-elevated px-1 py-0.5 font-mono">
                ↵
              </kbd>
              toggle
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-border bg-elevated px-1 py-0.5 font-mono">
                Esc
              </kbd>
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
