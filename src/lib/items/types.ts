export type ItemStatus = "backlog" | "in_progress" | "done";

export const ITEM_STATUSES: ItemStatus[] = ["backlog", "in_progress", "done"];

export const STATUS_LABELS: Record<ItemStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  done: "Done",
};

export type Item = {
  id: string;
  status: ItemStatus;
  position: number;
  title: string;
  dueAt: string | null;
  tags: string[];
  detail: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemDraft = {
  title: string;
  status: ItemStatus;
  dueAt: string | null;
  tags: string[];
  detail: string;
  note: string;
};

export type ReorderPayload = {
  status: ItemStatus;
  ids: string[];
};
