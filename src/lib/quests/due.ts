import type { QuestStatus } from "./types";

export type DueState = "none" | "upcoming" | "soon" | "overdue" | "done";

const SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

export function dueState(dueAt: string | null, status: QuestStatus): DueState {
  if (status === "done") return dueAt ? "done" : "none";
  if (!dueAt) return "none";
  const t = new Date(dueAt).getTime();
  if (Number.isNaN(t)) return "none";
  const delta = t - Date.now();
  if (delta < 0) return "overdue";
  if (delta <= SOON_WINDOW_MS) return "soon";
  return "upcoming";
}
