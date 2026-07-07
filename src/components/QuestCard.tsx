"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { dueState } from "@/lib/quests/due";
import type { Quest } from "@/lib/quests/types";

type Props = {
  quest: Quest;
  onEdit: (quest: Quest) => void;
};

function formatDue(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QuestCard({ quest, onEdit }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id, data: { status: quest.status } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const due = formatDue(quest.dueAt);
  const state = dueState(quest.dueAt, quest.status);
  const overdue = state === "overdue";
  const soon = state === "soon";
  const hasNote = quest.note.trim().length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-xl bg-elevated p-3 shadow-xs transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(.2,.9,.25,1)] ${
        isDragging
          ? "opacity-60 shadow-lg"
          : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      />
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => onEdit(quest)}
          className="flex min-w-0 flex-1 flex-col gap-2 text-left"
        >
          <div className="flex items-start gap-2">
            <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-medium leading-snug text-fg">
              {quest.title}
            </span>
          </div>

          {(due || quest.tags.length > 0 || hasNote) && (
            <div className="flex items-end justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                {due && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      overdue
                        ? "bg-danger-subtle text-danger-text"
                        : soon
                          ? "bg-warning-subtle text-warning-text"
                          : "bg-surface text-muted"
                    }`}
                    title={
                      overdue
                        ? `Overdue · ${due}`
                        : soon
                          ? `Due soon · ${due}`
                          : due
                    }
                  >
                    <svg
                      className="h-3 w-3 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18h-10.5A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM3.5 9.5v5.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V9.5h-13z" />
                    </svg>
                    {due}
                    {overdue && (
                      <svg
                        className="h-3 w-3 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" />
                      </svg>
                    )}
                  </span>
                )}
                {quest.tags.slice(0, 2).map((t, i) => (
                  <span
                    key={t}
                    className={`${
                      i === 0 ? "inline-flex" : "hidden md:inline-flex"
                    } max-w-[10rem] items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-muted`}
                  >
                    <svg
                      className="h-3 w-3 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.5 3A2.5 2.5 0 003 5.5v2.672c0 .53.21 1.04.586 1.414l6.5 6.5a2 2 0 002.828 0l3.672-3.672a2 2 0 000-2.828l-6.5-6.5A2 2 0 008.672 3H5.5zM7 7a1 1 0 11-2 0 1 1 0 012 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">{t}</span>
                  </span>
                ))}
                {quest.tags.length > 1 && (
                  <span
                    className="inline-flex shrink-0 items-center rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-muted md:hidden"
                    title={quest.tags.slice(1).join(", ")}
                  >
                    +{quest.tags.length - 1}
                  </span>
                )}
                {quest.tags.length > 2 && (
                  <span
                    className="hidden shrink-0 items-center rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-muted md:inline-flex"
                    title={quest.tags.slice(2).join(", ")}
                  >
                    +{quest.tags.length - 2}
                  </span>
                )}
              </div>

              {hasNote && (
                <span
                  role="img"
                  className="shrink-0 pb-0.5 text-faint"
                  title="Has a note"
                  aria-label="Has a note"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4.75A2.75 2.75 0 016.75 2h6.5A2.75 2.75 0 0116 4.75v10.5A2.75 2.75 0 0113.25 18h-6.5A2.75 2.75 0 014 15.25V4.75zM7.5 7a.75.75 0 000 1.5h5a.75.75 0 000-1.5h-5zm0 3.25a.75.75 0 000 1.5h5a.75.75 0 000-1.5h-5zm0 3.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
          )}
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="-my-3 -mr-3 flex shrink-0 cursor-grab items-center justify-center self-stretch rounded-r-xl px-2 text-muted opacity-60 transition hover:bg-surface hover:text-fg active:cursor-grabbing group-hover:opacity-100"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 4a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM7 9a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM7 14a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
