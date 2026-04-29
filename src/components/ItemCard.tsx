"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Item } from "@/lib/items/types";

type Props = {
  item: Item;
  onEdit: (item: Item) => void;
};

function formatDue(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ItemCard({ item, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, data: { status: item.status } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const due = formatDue(item.dueAt);
  const overdue = item.dueAt ? new Date(item.dueAt) < new Date() && item.status !== "done" : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag"
          className="mt-0.5 cursor-grab text-zinc-300 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-700 dark:hover:text-zinc-400"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 4a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM7 9a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM7 14a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex-1 text-left"
        >
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
          {due && (
            <div
              className={`mt-1 text-xs ${overdue ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              Due {due}
            </div>
          )}
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
