"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Quest, QuestStatus } from "@/lib/quests/types";
import { QUEST_STATUSES, STATUS_LABELS } from "@/lib/quests/types";
import { useQuests } from "@/lib/quests/useQuests";
import { FlameIcon } from "./BrandMark";
import { Column } from "./Column";
import { CommandPalette } from "./CommandPalette";
import { QuestModal } from "./QuestModal";
import { SignInModal } from "./SignInModal";
import { SkeletonCard } from "./SkeletonCard";
import { StatusIcon } from "./StatusIcon";
import { SyncingPill } from "./SyncingPill";
import { TagFilter } from "./TagFilter";
import { TopBar } from "./TopBar";

function groupByStatus(quests: Quest[]): Record<QuestStatus, Quest[]> {
  const out: Record<QuestStatus, Quest[]> = {
    backlog: [],
    in_progress: [],
    done: [],
  };
  for (const it of quests) out[it.status].push(it);
  for (const s of QUEST_STATUSES)
    out[s].sort((a, b) => a.position - b.position);
  return out;
}

export function Board() {
  const {
    quests,
    loading,
    error,
    create,
    update,
    remove,
    previewReorder,
    commitReorder,
    mode,
  } = useQuests();

  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [editing, setEditing] = useState<Quest | null>(null);
  const [adding, setAdding] = useState<QuestStatus | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<QuestStatus>("backlog");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of quests) for (const t of it.tags) set.add(t);
    return [...set].sort();
  }, [quests]);

  // Global shortcuts: ⌘/Ctrl-K and "/" both open the command palette, which
  // is now the single place to search quests and run actions. "f" toggles the
  // tag filter. Bare-key shortcuts are suppressed while typing or while the
  // palette / a modal owns the screen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      const bare = !e.metaKey && !e.ctrlKey && !e.altKey;
      if (
        bare &&
        (e.key === "/" || e.key.toLowerCase() === "f") &&
        !paletteOpen &&
        editing === null &&
        adding === null
      ) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable)
          return;
        e.preventDefault();
        if (e.key === "/") setPaletteOpen(true);
        else if (allTags.length > 0) setTagFilterOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [paletteOpen, editing, adding, allTags]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quests.filter((it) => {
      if (q) {
        const hay = `${it.title}\n${it.detail}\n${it.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeTags.length > 0) {
        if (!activeTags.every((t) => it.tags.includes(t))) return false;
      }
      return true;
    });
  }, [quests, search, activeTags]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);
  // Reorder works against the raw quests list — we always send the full ordering for affected columns.
  const groupedAll = useMemo(() => groupByStatus(quests), [quests]);

  const isFirstLoad = loading && quests.length === 0;
  const isBackgroundSync = loading && quests.length > 0;
  const hasActiveFilters = search.trim().length > 0 || activeTags.length > 0;
  const isEmptyBoard = !loading && quests.length === 0;

  // Pending reorder state accumulated across onDragOver, committed once on drop.
  const pendingGroupsRef = useRef<Map<QuestStatus, string[]>>(new Map());

  function isColumnId(id: string) {
    return id.startsWith("column:");
  }

  function findContainer(id: string): QuestStatus | null {
    if (isColumnId(id)) return id.slice("column:".length) as QuestStatus;
    const it = quests.find((i) => i.id === id);
    return it ? it.status : null;
  }

  function applyPreview(groups: Array<{ status: QuestStatus; ids: string[] }>) {
    for (const g of groups) pendingGroupsRef.current.set(g.status, g.ids);
    previewReorder(groups);
  }

  function onDragStart(_e: DragStartEvent) {
    pendingGroupsRef.current.clear();
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const fromStatus = findContainer(activeId);
    const toStatus = findContainer(overId);
    if (!fromStatus || !toStatus || fromStatus === toStatus) return;
    const moving = quests.find((i) => i.id === activeId);
    if (!moving) return;
    const targetCol = groupedAll[toStatus].filter((i) => i.id !== activeId);
    const targetIds = isColumnId(overId)
      ? [...targetCol.map((i) => i.id), activeId]
      : (() => {
          const idx = targetCol.findIndex((i) => i.id === overId);
          const insertAt = idx === -1 ? targetCol.length : idx;
          const ids = targetCol.map((i) => i.id);
          ids.splice(insertAt, 0, activeId);
          return ids;
        })();
    const fromIds = groupedAll[fromStatus]
      .filter((i) => i.id !== activeId)
      .map((i) => i.id);
    applyPreview([
      { status: fromStatus, ids: fromIds },
      { status: toStatus, ids: targetIds },
    ]);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over) {
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromStatus = findContainer(activeId);
      const toStatus = findContainer(overId);

      if (fromStatus && toStatus && fromStatus === toStatus) {
        const ids = groupedAll[fromStatus].map((i) => i.id);
        const fromIdx = ids.indexOf(activeId);
        const toIdx = isColumnId(overId) ? ids.length - 1 : ids.indexOf(overId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          const next = arrayMove(ids, fromIdx, toIdx);
          applyPreview([{ status: fromStatus, ids: next }]);
        }
      }
    }

    if (pendingGroupsRef.current.size > 0) {
      const groups = [...pendingGroupsRef.current.entries()].map(
        ([status, ids]) => ({
          status,
          ids,
        }),
      );
      pendingGroupsRef.current.clear();
      void commitReorder(groups);
    }
  }

  async function handleSubmit(draft: Parameters<typeof create>[0]) {
    if (editing) {
      await update(editing.id, draft);
    } else {
      await create(draft);
    }
  }

  function openCreate(status: QuestStatus) {
    setEditing(null);
    setAdding(status);
  }

  function openEdit(it: Quest) {
    setAdding(null);
    setEditing(it);
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        mode={mode}
        allTags={allTags}
        activeTags={activeTags}
        onActiveTagsChange={setActiveTags}
        tagFilterOpen={tagFilterOpen}
        onTagFilterOpenChange={setTagFilterOpen}
        onNewQuest={() => openCreate(mobileTab)}
        onOpenPalette={() => setPaletteOpen(true)}
        onSignInClick={() => setSignInOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-danger-border bg-danger-subtle px-3 py-2.5 text-sm text-danger-text"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM10 13a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {!isEmptyBoard && (
          <div className="flex flex-col gap-4 md:hidden">
            <div className="flex justify-end">
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
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
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search quests or run a command"
                className="group flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted transition-colors hover:bg-surface-2"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-muted"
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
                <span className="flex-1 truncate text-left">
                  Search quests…
                </span>
              </button>
              <TagFilter
                allTags={allTags}
                activeTags={activeTags}
                onChange={setActiveTags}
                open={tagFilterOpen}
                onOpenChange={setTagFilterOpen}
              />
            </div>
          </div>
        )}

        <div className="flex gap-1.5 md:hidden" role="tablist">
          {QUEST_STATUSES.map((status) => {
            const active = status === mobileTab;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobileTab(status)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-elevated text-fg shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                <StatusIcon status={status} className="h-3 w-3" />
                <span className="truncate">{STATUS_LABELS[status]}</span>
                <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                  {grouped[status].length}
                </span>
              </button>
            );
          })}
        </div>

        {isEmptyBoard ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-accent-text">
              <FlameIcon className="h-8 w-8" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-fg">
                Start leveling
              </h2>
              <p className="max-w-xs text-sm text-muted">
                You have no quests, create a quest to start leveling.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCreate("backlog")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-fg shadow-sm transition-all duration-150 ease-[cubic-bezier(.2,.9,.25,1)] hover:bg-accent-hover hover:shadow-[0_2px_14px_var(--accent-glow)] active:scale-[.97]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
                </svg>
                Create your first quest
              </button>
            </div>
          </div>
        ) : isFirstLoad ? (
          <div className="flex flex-1 flex-col gap-3 md:grid md:grid-cols-3">
            {QUEST_STATUSES.map((status) => (
              <div
                key={status}
                className={`${status === mobileTab ? "flex" : "hidden"} flex-1 flex-col md:flex`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl bg-surface p-2.5">
                  <div className="flex items-center gap-2 px-1.5 py-1">
                    <StatusIcon status={status} className="h-3.5 w-3.5" />
                    <h3 className="text-[13px] font-semibold text-fg">
                      {STATUS_LABELS[status]}
                    </h3>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <SkeletonCard />
                    <SkeletonCard lines={1} />
                    <SkeletonCard />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              pendingGroupsRef.current.clear();
            }}
          >
            <div className="flex flex-1 flex-col gap-3 md:grid md:grid-cols-3">
              {QUEST_STATUSES.map((status) => (
                <div
                  key={status}
                  className={`${status === mobileTab ? "flex" : "hidden"} flex-1 flex-col md:flex`}
                >
                  <Column
                    status={status}
                    quests={grouped[status]}
                    filtered={hasActiveFilters}
                    onAdd={openCreate}
                    onEdit={openEdit}
                  />
                </div>
              ))}
            </div>
          </DndContext>
        )}
      </main>

      {isBackgroundSync && <SyncingPill />}

      {/* Mobile primary action — stays reachable while the content scrolls. */}
      <button
        type="button"
        onClick={() => openCreate(mobileTab)}
        aria-label="New quest"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg transition-all duration-150 ease-[cubic-bezier(.2,.9,.25,1)] hover:bg-accent-hover active:scale-95 md:hidden"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
        </svg>
      </button>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        quests={quests}
        onCreate={openCreate}
        onEditQuest={openEdit}
        onSignIn={() => setSignInOpen(true)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSearch("");
          setActiveTags([]);
        }}
      />

      <QuestModal
        open={editing !== null || adding !== null}
        onClose={() => {
          setEditing(null);
          setAdding(null);
        }}
        initial={editing}
        defaultStatus={editing?.status ?? adding ?? "backlog"}
        defaultTags={activeTags}
        allTags={allTags}
        onSubmit={handleSubmit}
        onDelete={editing ? () => remove(editing.id) : undefined}
      />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
