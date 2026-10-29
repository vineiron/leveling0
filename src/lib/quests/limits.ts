import type { Quest } from "./types";

export const QUEST_LIMITS = {
  title: 200,
  detail: 20_000,
  note: 10_000,
  tag: 32,
  tags: 15,
} as const;

export const IMPORT_MAX_QUESTS = 500;

export function fitsLimits(
  q: Pick<Quest, "title" | "detail" | "note" | "tags">,
): boolean {
  return (
    q.title.trim().length <= QUEST_LIMITS.title &&
    q.detail.length <= QUEST_LIMITS.detail &&
    q.note.length <= QUEST_LIMITS.note &&
    q.tags.length <= QUEST_LIMITS.tags &&
    q.tags.every((t) => t.trim().length <= QUEST_LIMITS.tag)
  );
}
