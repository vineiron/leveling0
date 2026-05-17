import type { ItemStatus } from "./types";

export type DueState = "none" | "upcoming" | "soon" | "overdue" | "done";

// How close to the deadline counts as "due soon" (amber heads-up).
// 24h is a sensible same-day/next-day window for a task board; tune here.
const SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Single source of truth for how a due date should read, so the card pill
 * and the form field never disagree.
 *
 * - A completed item is never "overdue"/"soon" — its deadline is informational.
 * - Otherwise: past = overdue, within SOON_WINDOW = soon, else upcoming.
 */
export function dueState(dueAt: string | null, status: ItemStatus): DueState {
  if (status === "done") return dueAt ? "done" : "none";
  if (!dueAt) return "none";
  const t = new Date(dueAt).getTime();
  if (Number.isNaN(t)) return "none";
  const delta = t - Date.now();
  if (delta < 0) return "overdue";
  if (delta <= SOON_WINDOW_MS) return "soon";
  return "upcoming";
}
