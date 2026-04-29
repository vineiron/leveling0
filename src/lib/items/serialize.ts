import type { DbItem } from "@/db/schema";
import type { Item } from "./types";

export function dbItemToItem(row: DbItem): Item {
  return {
    id: row.id,
    status: row.status,
    position: row.position,
    title: row.title,
    dueAt: row.dueAt ? row.dueAt.toISOString() : null,
    tags: row.tags,
    detail: row.detail,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
