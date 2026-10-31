import type { ZodIssue } from "./errors";
import type { Quest } from "./types";

export const QUEST_LIMITS = {
  title: 200,
  detail: 20_000,
  note: 10_000,
  tag: 32,
  tags: 15,
} as const;

export const IMPORT_MAX_QUESTS = 500;

export const BOARD_MAX_BYTES = 4_000_000;
export const QUEST_BASE_BYTES = 300;

type Limited = Pick<Quest, "title" | "detail" | "note" | "tags">;

function over(
  path: ZodIssue["path"],
  size: number,
  maximum: number,
  origin = "string",
): ZodIssue[] {
  return size > maximum ? [{ code: "too_big", origin, maximum, path }] : [];
}

export function limitIssues(q: Limited): ZodIssue[] {
  return [
    ...over(["title"], q.title.trim().length, QUEST_LIMITS.title),
    ...q.tags.flatMap((t, i) =>
      over(["tags", i], t.trim().length, QUEST_LIMITS.tag),
    ),
    ...over(["tags"], q.tags.length, QUEST_LIMITS.tags, "array"),
    ...over(["detail"], q.detail.length, QUEST_LIMITS.detail),
    ...over(["note"], q.note.length, QUEST_LIMITS.note),
  ];
}

export function fitsLimits(q: Limited): boolean {
  return limitIssues(q).length === 0;
}
