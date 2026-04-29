"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Item, ItemStatus } from "@/lib/items/types";
import { STATUS_LABELS } from "@/lib/items/types";
import { ItemCard } from "./ItemCard";

type Props = {
  status: ItemStatus;
  items: Item[];
  onAdd: (status: ItemStatus) => void;
  onEdit: (item: Item) => void;
};

export function Column({ status, items, onAdd, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}`, data: { status } });
  const ids = items.map((i) => i.id);
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{STATUS_LABELS[status]}</h3>
          <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(status)}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label={`Add to ${STATUS_LABELS[status]}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
          </svg>
        </button>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-1 flex-col gap-2 rounded-md p-1 transition-colors ${isOver ? "bg-zinc-200/60 dark:bg-zinc-800/60" : ""}`}
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onEdit={onEdit} />
          ))}
          {items.length === 0 && (
            <div className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              Drop items here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
