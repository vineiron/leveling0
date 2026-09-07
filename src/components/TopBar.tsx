"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { TagFilter } from "./TagFilter";
import { ThemeToggle } from "./ThemeToggle";
import { UserChip } from "./UserChip";

type Props = {
  mode: "remote" | "local";
  allTags: string[];
  activeTags: string[];
  onActiveTagsChange: (next: string[]) => void;
  tagFilterOpen: boolean;
  onTagFilterOpenChange: (open: boolean) => void;
  onNewQuest: () => void;
  onOpenPalette: () => void;
  onSignInClick: () => void;
};

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export function TopBar({
  mode,
  allTags,
  activeTags,
  onActiveTagsChange,
  tagFilterOpen,
  onTagFilterOpenChange,
  onNewQuest,
  onOpenPalette,
  onSignInClick,
}: Props) {
  // Show the platform-correct shortcut hint only after mount (navigator is
  // client-only and would otherwise mismatch SSR).
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(
      /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent),
    );
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/45 bg-elevated/55 shadow-[0_1px_0_rgb(255_255_255/0.55)_inset,0_12px_32px_rgb(20_16_12/0.07)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-elevated/45 dark:shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_12px_34px_rgb(0_0_0/0.38)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgb(255_255_255/0.42),rgb(255_255_255/0.10)_58%,rgb(255_255_255/0))] dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.03)_54%,rgb(255_255_255/0))]" />
      <div className="relative mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-2 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <div className="flex min-w-0 shrink items-center">
          <BrandMark />
        </div>

        {/* Desktop only — on mobile these move to a content toolbar + FAB. */}
        <div className="hidden items-center justify-self-center gap-1.5 sm:gap-2 md:flex">
          <button
            type="button"
            onClick={onOpenPalette}
            className="group flex h-9 w-[14rem] items-center gap-2 rounded-lg border border-white/55 bg-elevated/55 px-3 text-sm text-muted shadow-xs backdrop-blur-md transition-colors hover:border-border-strong hover:bg-elevated/80 dark:border-white/10 dark:bg-surface/55 dark:hover:bg-surface-2/70 lg:w-[21rem] xl:w-[27rem]"
            aria-label="Search quests or run a command"
          >
            <SearchIcon className="h-4 w-4 text-faint transition-colors group-hover:text-muted" />
            <span className="flex-1 truncate text-left">
              Search by title, detail, note — or run a command…
            </span>
            <kbd className="hidden rounded-md border border-white/55 bg-white/35 px-1.5 py-0.5 font-mono text-[10px] font-medium text-faint dark:border-white/10 dark:bg-white/5 lg:block">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>

          <TagFilter
            allTags={allTags}
            activeTags={activeTags}
            onChange={onActiveTagsChange}
            open={tagFilterOpen}
            onOpenChange={onTagFilterOpenChange}
          />

          <button
            type="button"
            onClick={onNewQuest}
            aria-keyshortcuts="n"
            title="New quest (N)"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-sm font-medium text-accent-fg shadow-sm transition-all duration-150 ease-[cubic-bezier(.2,.9,.25,1)] hover:bg-accent-hover hover:shadow-[0_2px_14px_var(--accent-glow)] active:scale-[.97] lg:px-3"
          >
            <PlusIcon />
            <span className="hidden lg:inline">New quest</span>
          </button>
        </div>

        <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
          <ThemeToggle />
          <span
            className="hidden h-5 w-px bg-border md:block"
            aria-hidden="true"
          />
          {/* Desktop only — on mobile this lives in the page content. */}
          <span
            className="hidden items-center gap-1.5 rounded-full border border-white/45 bg-elevated/50 px-2 py-0.5 text-[11px] font-medium text-muted shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-surface/50 md:inline-flex"
            title={
              mode === "remote"
                ? "Quests sync to your account"
                : "Quests are saved in this browser only"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mode === "remote" ? "bg-accent-text" : "bg-faint"
              }`}
            />
            {mode === "remote" ? "Synced" : "Local only"}
          </span>
          <UserChip compactTablet onSignInClick={onSignInClick} />
        </div>
      </div>
    </header>
  );
}
