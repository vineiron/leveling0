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
import { useItems } from "@/lib/items/useItems";
import type { Item, ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES, STATUS_LABELS } from "@/lib/items/types";
import { Column } from "./Column";
import { ItemModal } from "./ItemModal";
import { LoginModal } from "./LoginModal";
import { SkeletonCard } from "./SkeletonCard";
import { SyncingPill } from "./SyncingPill";
import { UserChip } from "./UserChip";

function groupByStatus(items: Item[]): Record<ItemStatus, Item[]> {
  const out: Record<ItemStatus, Item[]> = { backlog: [], in_progress: [], done: [] };
  for (const it of items) out[it.status].push(it);
  for (const s of ITEM_STATUSES) out[s].sort((a, b) => a.position - b.position);
  return out;
}

export function Board() {
  const { items, loading, error, create, update, remove, previewReorder, commitReorder, mode } =
    useItems();

  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [adding, setAdding] = useState<ItemStatus | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<ItemStatus>("backlog");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const tagSearchRef = useRef<HTMLInputElement | null>(null);
  const filterWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function onDoc(e: MouseEvent) {
      if (!filterWrapRef.current?.contains(e.target as Node)) setFilterOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const t of it.tags) set.add(t);
    return [...set].sort();
  }, [items]);

  const visibleTagOptions = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.toLowerCase().includes(q));
  }, [allTags, tagQuery]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (q) {
        const hay = `${it.title}\n${it.detail}\n${it.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeTags.length > 0) {
        if (!activeTags.every((t) => it.tags.includes(t))) return false;
      }
      return true;
    });
  }, [items, search, activeTags]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);
  // Reorder works against the raw items list — we always send the full ordering for affected columns.
  const groupedAll = useMemo(() => groupByStatus(items), [items]);

  const isFirstLoad = loading && items.length === 0;
  const isBackgroundSync = loading && items.length > 0;

  // Pending reorder state accumulated across onDragOver, committed once on drop.
  const pendingGroupsRef = useRef<Map<ItemStatus, string[]>>(new Map());

  function isColumnId(id: string) {
    return id.startsWith("column:");
  }

  function findContainer(id: string): ItemStatus | null {
    if (isColumnId(id)) return id.slice("column:".length) as ItemStatus;
    const it = items.find((i) => i.id === id);
    return it ? it.status : null;
  }

  function applyPreview(groups: Array<{ status: ItemStatus; ids: string[] }>) {
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
    const moving = items.find((i) => i.id === activeId);
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
    const fromIds = groupedAll[fromStatus].filter((i) => i.id !== activeId).map((i) => i.id);
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
      const groups = [...pendingGroupsRef.current.entries()].map(([status, ids]) => ({
        status,
        ids,
      }));
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">leveling0</h1>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdding(mobileTab)}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
              </svg>
              New item
            </button>
            <UserChip onSignInClick={() => setLoginOpen(true)} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {mode === "remote" ? "Synced to your account" : "Guest — saved locally only"}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-2 sm:justify-end">
        <div ref={filterWrapRef} className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              if (allTags.length === 0) return;
              setFilterOpen((v) => !v);
              setTimeout(() => tagSearchRef.current?.focus(), 0);
            }}
            disabled={allTags.length === 0}
            aria-label="Filter by tags"
            aria-expanded={filterOpen}
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title={allTags.length === 0 ? "No tags yet" : "Filter by tags"}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 01.6 1.2L12 11.31V16a.75.75 0 01-1.17.62l-2.5-1.67A.75.75 0 018 14.33V11.3L3.15 5.2A.75.75 0 013 4.75z" />
            </svg>
            {activeTags.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {activeTags.length}
              </span>
            )}
          </button>
          {filterOpen && allTags.length > 0 && (
            <div className="absolute left-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                <div className="relative flex-1">
                  <input
                    ref={tagSearchRef}
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    placeholder="Search tags…"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 pr-7 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                  {tagQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setTagQuery("");
                        tagSearchRef.current?.focus();
                      }}
                      aria-label="Clear tag search"
                      className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                </div>
                {activeTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTags([])}
                    className="shrink-0 text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul className="max-h-64 overflow-auto py-1">
                {visibleTagOptions.length === 0 && (
                  <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {tagQuery ? `No tags match “${tagQuery}”` : "No tags yet"}
                  </li>
                )}
                {visibleTagOptions.map((t) => {
                  const on = activeTags.includes(t);
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTags((prev) =>
                            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                          )
                        }
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            on
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                              : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {on && (
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
        <div className="relative w-full sm:max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, detail, note…"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 md:hidden dark:bg-zinc-900/50" role="tablist">
        {ITEM_STATUSES.map((status) => {
          const active = status === mobileTab;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMobileTab(status)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {STATUS_LABELS[status]}
              <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {grouped[status].length}
              </span>
            </button>
          );
        })}
      </div>

      {isFirstLoad ? (
        <div className="flex flex-1 flex-col gap-3 md:grid md:grid-cols-3">
          {ITEM_STATUSES.map((status) => (
            <div
              key={status}
              className={`${status === mobileTab ? "flex" : "hidden"} flex-1 flex-col md:flex`}
            >
              <div className="flex min-w-0 flex-1 flex-col rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900/50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {STATUS_LABELS[status]}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-md p-1">
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
            {ITEM_STATUSES.map((status) => (
              <div
                key={status}
                className={`${status === mobileTab ? "flex" : "hidden"} flex-1 flex-col md:flex`}
              >
                <Column
                  status={status}
                  items={grouped[status]}
                  onAdd={(s) => {
                    setEditing(null);
                    setAdding(s);
                  }}
                  onEdit={(it) => {
                    setAdding(null);
                    setEditing(it);
                  }}
                />
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {isBackgroundSync && <SyncingPill />}

      <ItemModal
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

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
