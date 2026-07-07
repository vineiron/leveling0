"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { Column } from "@/components/Column";
import { StatusIcon } from "@/components/StatusIcon";
import {
  QUEST_STATUSES,
  type Quest,
  type QuestStatus,
  STATUS_LABELS,
} from "@/lib/quests/types";

const now = "2026-01-01T00:00:00.000Z";
const POINTER_ACTIVATION = { distance: 5 };

const PREVIEW_QUESTS: Record<QuestStatus, Quest[]> = {
  backlog: [
    {
      id: "preview-backlog-1",
      status: "backlog",
      position: 0,
      title: "Save the thing I will absolutely forget to read",
      dueAt: null,
      tags: ["reading"],
      detail: "",
      note: "A beautiful lie called later.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "preview-backlog-2",
      status: "backlog",
      position: 1,
      title: "Ask about the deployment timing",
      dueAt: null,
      tags: ["work"],
      detail: "",
      note: "",
      createdAt: now,
      updatedAt: now,
    },
  ],
  in_progress: [
    {
      id: "preview-progress-1",
      status: "in_progress",
      position: 0,
      title: "Send the file before someone asks again",
      dueAt: null,
      tags: ["follow up"],
      detail: "",
      note: "",
      createdAt: now,
      updatedAt: now,
    },
  ],
  done: [
    {
      id: "preview-done-1",
      status: "done",
      position: 0,
      title: "Close the tabs pretending to be tasks",
      dueAt: null,
      tags: ["cleanup"],
      detail: "",
      note: "",
      createdAt: now,
      updatedAt: now,
    },
  ],
};

function groupByStatus(quests: Quest[]): Record<QuestStatus, Quest[]> {
  const out: Record<QuestStatus, Quest[]> = {
    backlog: [],
    in_progress: [],
    done: [],
  };

  for (const quest of quests) out[quest.status].push(quest);
  for (const status of QUEST_STATUSES) {
    out[status].sort((a, b) => a.position - b.position);
  }

  return out;
}

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export function BoardPreview() {
  const [quests, setQuests] = useState(() =>
    QUEST_STATUSES.flatMap((status) => PREVIEW_QUESTS[status]),
  );
  const [mobileTab, setMobileTab] = useState<QuestStatus>("backlog");
  const grouped = useMemo(() => groupByStatus(quests), [quests]);
  const questsRef = useRef(quests);
  const previewKeyRef = useRef("");
  const queuedGroupsRef = useRef<Array<{
    status: QuestStatus;
    ids: string[];
  }> | null>(null);
  const frameRef = useRef<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: POINTER_ACTIVATION }),
  );

  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function isColumnId(id: string) {
    return id.startsWith("column:");
  }

  function findContainer(id: string): QuestStatus | null {
    if (isColumnId(id)) return id.slice("column:".length) as QuestStatus;
    return questsRef.current.find((quest) => quest.id === id)?.status ?? null;
  }

  function applyPreview(groups: Array<{ status: QuestStatus; ids: string[] }>) {
    const key = groups
      .map((group) => `${group.status}:${group.ids.join(",")}`)
      .join("|");
    if (previewKeyRef.current === key) return;
    previewKeyRef.current = key;

    setQuests((current) => {
      const currentGrouped = groupByStatus(current);
      const changed = groups.some(
        (group) =>
          !sameIds(
            currentGrouped[group.status].map((quest) => quest.id),
            group.ids,
          ),
      );

      if (!changed) return current;

      const byId = new Map(current.map((quest) => [quest.id, quest]));
      const touched = new Set(groups.map((group) => group.status));
      const next = current.map((quest) => ({ ...quest }));

      for (const group of groups) {
        group.ids.forEach((id, index) => {
          const quest = byId.get(id);
          if (!quest) return;
          const target = next.find((item) => item.id === id);
          if (!target) return;
          target.status = group.status;
          target.position = index;
        });
      }

      for (const status of touched) {
        const ordered = next
          .filter((quest) => quest.status === status)
          .sort((a, b) => a.position - b.position);
        ordered.forEach((quest, index) => {
          quest.position = index;
        });
      }

      return next;
    });
  }

  function queuePreview(groups: Array<{ status: QuestStatus; ids: string[] }>) {
    const key = groups
      .map((group) => `${group.status}:${group.ids.join(",")}`)
      .join("|");
    if (previewKeyRef.current === key) return;

    queuedGroupsRef.current = groups;
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const queued = queuedGroupsRef.current;
      queuedGroupsRef.current = null;
      if (queued) applyPreview(queued);
    });
  }

  function cancelQueuedPreview() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    queuedGroupsRef.current = null;
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromStatus = findContainer(activeId);
    const toStatus = findContainer(overId);
    if (!fromStatus || !toStatus || fromStatus === toStatus) return;

    const currentGrouped = groupByStatus(questsRef.current);
    const fromIds = currentGrouped[fromStatus]
      .filter((quest) => quest.id !== activeId)
      .map((quest) => quest.id);
    const targetCol = currentGrouped[toStatus].filter(
      (quest) => quest.id !== activeId,
    );
    const targetIds = isColumnId(overId)
      ? [...targetCol.map((quest) => quest.id), activeId]
      : (() => {
          const idx = targetCol.findIndex((quest) => quest.id === overId);
          const insertAt = idx === -1 ? targetCol.length : idx;
          const ids = targetCol.map((quest) => quest.id);
          ids.splice(insertAt, 0, activeId);
          return ids;
        })();

    queuePreview([
      { status: fromStatus, ids: fromIds },
      { status: toStatus, ids: targetIds },
    ]);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    cancelQueuedPreview();
    previewKeyRef.current = "";
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromStatus = findContainer(activeId);
    const toStatus = findContainer(overId);
    if (!fromStatus || !toStatus) return;

    if (fromStatus === toStatus) {
      const ids = grouped[fromStatus].map((quest) => quest.id);
      const fromIdx = ids.indexOf(activeId);
      const toIdx = isColumnId(overId) ? ids.length - 1 : ids.indexOf(overId);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        applyPreview([
          { status: fromStatus, ids: arrayMove(ids, fromIdx, toIdx) },
        ]);
      }
      return;
    }

    const fromIds = grouped[fromStatus]
      .filter((quest) => quest.id !== activeId)
      .map((quest) => quest.id);
    const targetCol = grouped[toStatus].filter(
      (quest) => quest.id !== activeId,
    );
    const targetIds = isColumnId(overId)
      ? [...targetCol.map((quest) => quest.id), activeId]
      : (() => {
          const idx = targetCol.findIndex((quest) => quest.id === overId);
          const insertAt = idx === -1 ? targetCol.length : idx;
          const ids = targetCol.map((quest) => quest.id);
          ids.splice(insertAt, 0, activeId);
          return ids;
        })();

    applyPreview([
      { status: fromStatus, ids: fromIds },
      { status: toStatus, ids: targetIds },
    ]);
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-white/45 bg-canvas p-2.5 shadow-xl backdrop-blur dark:border-white/10"
      aria-label="Interactive board preview"
    >
      <DndContext
        id="landing-board-preview"
        sensors={sensors}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="mb-3 flex gap-1.5 md:hidden" role="tablist">
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

        <div className="flex min-h-[24rem] flex-col gap-3 md:grid md:grid-cols-3">
          {QUEST_STATUSES.map((status) => (
            <div
              key={status}
              className={`${status === mobileTab ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}
            >
              <Column
                status={status}
                quests={grouped[status]}
                filtered={false}
                onAdd={() => {}}
                onEdit={() => {}}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </section>
  );
}
