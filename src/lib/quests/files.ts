import { QUEST_STATUSES, type Quest, STATUS_LABELS } from "./types";

export type QuestFile = { quests: Quest[]; skipped: number };

export function fileQuest(q: Quest) {
  return {
    id: q.id,
    title: q.title,
    status: q.status,
    dueAt: q.dueAt,
    tags: q.tags,
    detail: q.detail,
    note: q.note,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

function localDate(now: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function exportFileName(quests: Quest[], now: Date): string {
  const columns = new Set(quests.map((q) => q.status));
  const what =
    quests.length === 1
      ? slug(quests[0].title) || "quest"
      : columns.size === 1
        ? slug(STATUS_LABELS[quests[0].status])
        : "quests";
  return `leveling0-${what}-${localDate(now)}.json`;
}

export function questFileJson(quests: Quest[]): string {
  const ordered = [...quests].sort(
    (a, b) =>
      QUEST_STATUSES.indexOf(a.status) - QUEST_STATUSES.indexOf(b.status) ||
      a.position - b.position,
  );
  return `${JSON.stringify({ quests: ordered.map(fileQuest) }, null, 2)}\n`;
}

export function downloadQuests(quests: Quest[]) {
  const url = URL.createObjectURL(
    new Blob([questFileJson(quests)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName(quests, new Date());
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function readQuestFile(text: string): Promise<QuestFile | null> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null || !("quests" in data))
    return null;
  const items = data.quests;
  if (!Array.isArray(items)) return null;

  const { importedQuestSchema } = await import("@/lib/validation");
  const now = new Date().toISOString();
  const quests: Quest[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const parsed = importedQuestSchema.safeParse(item);
    if (!parsed.success || seen.has(parsed.data.id)) continue;
    const q = parsed.data;
    seen.add(q.id);
    quests.push({
      id: q.id,
      status: q.status,
      position: quests.length,
      title: q.title,
      dueAt: q.dueAt?.toISOString() ?? null,
      tags: q.tags,
      detail: q.detail,
      note: q.note,
      createdAt: q.createdAt?.toISOString() ?? now,
      updatedAt: q.updatedAt?.toISOString() ?? now,
    });
  }
  return { quests, skipped: items.length - quests.length };
}
