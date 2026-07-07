"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Quest, QuestStatus } from "@/lib/quests/types";
import { QUEST_STATUSES, STATUS_LABELS } from "@/lib/quests/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { StatusIcon } from "./StatusIcon";

type Props = {
  open: boolean;
  onClose: () => void;
  quests: Quest[];
  onCreate: (status: QuestStatus) => void;
  onEditQuest: (quest: Quest) => void;
  onSignIn: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

type Entry = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  active?: boolean;
  run: () => void;
};

function I({ d }: { d: string }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const PLUS =
  "M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z";
const ARROW =
  "M3 10a.75.75 0 01.75-.75h9.69L10.22 6.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z";
const SUN =
  "M10 3a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3zm0 11a4 4 0 100-8 4 4 0 000 8zm6.36-9.36a.75.75 0 010 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7a.75.75 0 011.06 0zM17 9.25a.75.75 0 010 1.5h-1a.75.75 0 010-1.5h1zM4.34 4.34a.75.75 0 011.06 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 010-1.06zM4 9.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5h1zm1.4 5.3a.75.75 0 011.06 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7zm9.2 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 011.06-1.06zM10 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75z";
const MOON =
  "M9.353 2.939a.75.75 0 01.157.808 6 6 0 007.743 7.743.75.75 0 01.965.965A7.5 7.5 0 119.353 2.94z";
const FILTER_X =
  "M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 01.6 1.2L12 11.31V16a.75.75 0 01-1.17.62l-2.5-1.67A.75.75 0 018 14.33V11.3L3.15 5.2A.75.75 0 013 4.75z";
const SIGN_IN =
  "M11 3a.75.75 0 000 1.5h2.75a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75H11a.75.75 0 000 1.5h2.75A2.25 2.25 0 0016 14.75v-9.5A2.25 2.25 0 0013.75 3H11zM7.28 6.97a.75.75 0 10-1.06 1.06l1.22 1.22H3a.75.75 0 000 1.5h4.44L6.22 11.97a.75.75 0 101.06 1.06l2.5-2.5a.75.75 0 000-1.06l-2.5-2.5z";
const SIGN_OUT =
  "M9 3a.75.75 0 000 1.5H6.25a.75.75 0 00-.75.75v9.5c0 .41.34.75.75.75H9A.75.75 0 019 17H6.25A2.25 2.25 0 014 14.75v-9.5A2.25 2.25 0 016.25 3H9zm4.72 3.97a.75.75 0 011.06 0l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06l1.22-1.22H9a.75.75 0 010-1.5h5.94l-1.22-1.22a.75.75 0 010-1.06z";

export function CommandPalette({
  open,
  onClose,
  quests,
  onCreate,
  onEditQuest,
  onSignIn,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const keyNav = useRef(false);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const commands = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    for (const s of QUEST_STATUSES) {
      list.push({
        id: `create:${s}`,
        group: "Create",
        label: `New quest in ${STATUS_LABELS[s]}`,
        keywords: "add new create task card quest",
        icon: <I d={PLUS} />,
        run: () => onCreate(s),
      });
    }
    if (hasActiveFilters) {
      list.push({
        id: "filters:clear",
        group: "View",
        label: "Clear all filters",
        keywords: "reset search tag",
        icon: <I d={FILTER_X} />,
        run: onClearFilters,
      });
    }
    list.push(
      {
        id: "theme:light",
        group: "View",
        label: "Light theme",
        keywords: "appearance color mode",
        icon: <I d={SUN} />,
        active: resolvedTheme === "light",
        run: () => setTheme("light"),
      },
      {
        id: "theme:dark",
        group: "View",
        label: "Dark theme",
        keywords: "appearance color mode",
        icon: <I d={MOON} />,
        active: resolvedTheme === "dark",
        run: () => setTheme("dark"),
      },
    );
    if (user) {
      list.push({
        id: "account:signout",
        group: "Account",
        label: "Sign out",
        hint: user.email ?? undefined,
        keywords: "log out exit account",
        icon: <I d={SIGN_OUT} />,
        run: () => void signOut(),
      });
    } else {
      list.push({
        id: "account:signin",
        group: "Account",
        label: "Sign in",
        hint: "Sync across devices",
        keywords: "log in google account",
        icon: <I d={SIGN_IN} />,
        run: onSignIn,
      });
    }
    return list;
  }, [
    user,
    resolvedTheme,
    hasActiveFilters,
    onCreate,
    onClearFilters,
    onSignIn,
    setTheme,
    signOut,
  ]);

  const results = useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    const cmds = q
      ? commands.filter((c) =>
          `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q),
        )
      : commands;

    const ranked = [...quests].sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
    const matched = q
      ? ranked.filter((it) =>
          `${it.title}\n${it.detail}\n${it.note}`.toLowerCase().includes(q),
        )
      : ranked;

    const questEntries: Entry[] = matched.slice(0, q ? 12 : 6).map((it) => ({
      id: `quest:${it.id}`,
      group: "Jump to quest",
      label: it.title || "Untitled",
      hint: STATUS_LABELS[it.status],
      icon: <StatusIcon status={it.status} className="h-3.5 w-3.5" />,
      run: () => onEditQuest(it),
    }));

    return [...cmds, ...questEntries];
  }, [query, commands, quests, onEditQuest]);

  useEffect(() => {
    setSelected((s) =>
      results.length === 0 ? 0 : Math.min(s, results.length - 1),
    );
  }, [results]);

  useEffect(() => {
    if (!keyNav.current) return;
    keyNav.current = false;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${selected}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  function exec(entry: Entry) {
    onClose();
    entry.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      keyNav.current = true;
      setSelected((s) => (results.length ? (s + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      keyNav.current = true;
      setSelected((s) =>
        results.length ? (s - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[selected];
      if (entry) exec(entry);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 animate-overlay-in bg-scrim backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-xl animate-panel-in overflow-hidden rounded-xl border border-border bg-elevated shadow-xl"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <svg
            className="h-4 w-4 shrink-0 text-faint"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 103.4 9.82l3.14 3.13a.75.75 0 101.06-1.06l-3.13-3.14A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search by title, detail, note — or run a command…"
            className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
            aria-label="Command palette query"
          />
          <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-faint">
            Esc
          </kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5"
        >
          {results.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted">
              No results for{" "}
              <span className="font-medium text-fg">“{query.trim()}”</span>
            </div>
          ) : (
            results.map((entry, idx) => {
              const showHeader = entry.group !== lastGroup;
              lastGroup = entry.group;
              const isSel = idx === selected;
              return (
                <div key={entry.id}>
                  {showHeader && (
                    <div className="px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
                      {entry.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-idx={idx}
                    onMouseMove={() => {
                      keyNav.current = false;
                      setSelected(idx);
                    }}
                    onClick={() => exec(entry)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      isSel
                        ? "bg-accent-subtle text-fg"
                        : "text-muted hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                        isSel ? "text-accent-text" : "text-faint"
                      }`}
                    >
                      {entry.icon}
                    </span>
                    <span className="flex-1 truncate text-fg">
                      {entry.label}
                    </span>
                    {entry.active && (
                      <span className="rounded-md border border-accent-border bg-accent-subtle px-1.5 py-0.5 text-[10px] font-medium text-accent-text">
                        Active
                      </span>
                    )}
                    {entry.hint && !entry.active && (
                      <span className="max-w-[40%] truncate text-xs text-faint">
                        {entry.hint}
                      </span>
                    )}
                    {isSel && (
                      <span className="shrink-0 text-faint">
                        <I d={ARROW} />
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-2 text-[11px] text-faint">
          <div className="flex items-center gap-3">
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
              select
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-accent-text">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-text" />
            leveling0
          </span>
        </div>
      </div>
    </div>
  );
}
