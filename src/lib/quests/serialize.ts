import type { DbQuest } from "@/db/schema";
import type { Quest } from "./types";

export function dbQuestToQuest(row: DbQuest): Quest {
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
