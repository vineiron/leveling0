import type { DbQuestInsert } from "@/db/schema";
import type { ImportQuest } from "@/lib/validation";

type Holder = { id: string; userId: string };

export function planImport(
  userId: string,
  incoming: ImportQuest[],
  existing: Holder[],
  startPosition: number,
  now: Date,
  newId: () => string,
) {
  const holderOf = new Map(existing.map((row) => [row.id, row.userId]));
  const rows: DbQuestInsert[] = [];
  const sourceOf = new Map<string, string>();
  const alreadyHere: string[] = [];

  for (const quest of incoming) {
    const holder = holderOf.get(quest.id);
    if (holder === userId) {
      alreadyHere.push(quest.id);
      continue;
    }
    const id = holder === undefined ? quest.id : newId();
    const createdAt = notAfter(quest.createdAt ?? now, now);
    rows.push({
      id,
      userId,
      status: quest.status,
      position: startPosition + rows.length,
      title: quest.title,
      dueAt: quest.dueAt,
      tags: quest.tags,
      detail: quest.detail,
      note: quest.note,
      createdAt,
      updatedAt: notAfter(quest.updatedAt ?? createdAt, now),
    });
    sourceOf.set(id, quest.id);
  }

  return { rows, sourceOf, alreadyHere };
}

function notAfter(date: Date, limit: Date): Date {
  return date > limit ? limit : date;
}
