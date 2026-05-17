export type QuestStatus = "backlog" | "in_progress" | "done";

export const QUEST_STATUSES: QuestStatus[] = ["backlog", "in_progress", "done"];

export const STATUS_LABELS: Record<QuestStatus, string> = {
  backlog: "Quest Log",
  in_progress: "In Pursuit",
  done: "Conquered",
};

export type Quest = {
  id: string;
  status: QuestStatus;
  position: number;
  title: string;
  dueAt: string | null;
  tags: string[];
  detail: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestDraft = {
  title: string;
  status: QuestStatus;
  dueAt: string | null;
  tags: string[];
  detail: string;
  note: string;
};

export type ReorderPayload = {
  status: QuestStatus;
  ids: string[];
};
