"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Item, ItemStatus } from "@/lib/items/types";
import { STATUS_LABELS } from "@/lib/items/types";
import { ItemCard } from "./ItemCard";
import { StatusIcon } from "./StatusIcon";

type Props = {
  status: ItemStatus;
  items: Item[];
  filtered: boolean;
  onAdd: (status: ItemStatus) => void;
  onEdit: (item: Item) => void;
};

export function Column({ status, items, filtered, onAdd, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { status },
  });
  const ids = items.map((i) => i.id);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl bg-surface p-2.5">
      <div className="flex items-center justify-between px-1.5 py-1">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} className="h-3.5 w-3.5" />
          <h3 className="text-[13px] font-semibold text-fg">
            {STATUS_LABELS[status]}
          </h3>
          <span className="hidden rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted md:inline-block">
            {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(status)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-accent-text"
          aria-label={`Add to ${STATUS_LABELS[status]}`}
          title={`Add to ${STATUS_LABELS[status]}`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
          </svg>
        </button>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-24 flex-1 flex-col gap-2 rounded-xl p-0.5 transition-colors ${
            isOver ? "bg-accent-subtle ring-1 ring-accent-border" : ""
          }`}
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onEdit={onEdit} />
          ))}

          {items.length === 0 &&
            (filtered ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <p className="text-[13px] font-medium text-muted">No matches</p>
                <p className="text-xs text-faint">
                  No items here fit the current filters.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(status)}
                className="group flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center transition-colors hover:border-accent-border hover:bg-accent-subtle/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-faint transition-colors group-hover:bg-accent-subtle group-hover:text-accent-text">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
                  </svg>
                </span>
                <span className="text-[13px] font-medium text-muted transition-colors group-hover:text-fg">
                  Add an item
                </span>
              </button>
            ))}
        </div>
      </SortableContext>
    </div>
  );
}
