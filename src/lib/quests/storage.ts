import { ApiError, toFriendlyMessages } from "./errors";
import type { Quest, QuestDraft, QuestStatus } from "./types";

const LS_KEY = "leveling0:items:v1";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readLocal(): Quest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Quest[];
  } catch {
    return [];
  }
}

function writeLocal(quests: Quest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(quests));
}

export type QuestStore = {
  list(): Promise<Quest[]>;
  create(draft: QuestDraft): Promise<Quest>;
  update(
    id: string,
    patch: Partial<QuestDraft> & { position?: number },
  ): Promise<Quest>;
  remove(id: string): Promise<void>;
  reorder(groups: Array<{ status: QuestStatus; ids: string[] }>): Promise<void>;
};

export const localStore: QuestStore = {
  async list() {
    const quests = readLocal();
    return [...quests].sort((a, b) => {
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      return a.position - b.position;
    });
  },
  async create(draft) {
    const quests = readLocal();
    const sameStatus = quests.filter((i) => i.status === draft.status);
    const maxPos = sameStatus.reduce((m, i) => Math.max(m, i.position), -1);
    const now = new Date().toISOString();
    const quest: Quest = {
      id: uid(),
      status: draft.status,
      position: maxPos + 1,
      title: draft.title,
      dueAt: draft.dueAt,
      tags: draft.tags,
      detail: draft.detail,
      note: draft.note,
      createdAt: now,
      updatedAt: now,
    };
    quests.push(quest);
    writeLocal(quests);
    return quest;
  },
  async update(id, patch) {
    const quests = readLocal();
    const idx = quests.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Not found");
    const next: Quest = {
      ...quests[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    quests[idx] = next;
    writeLocal(quests);
    return next;
  },
  async remove(id) {
    const quests = readLocal().filter((i) => i.id !== id);
    writeLocal(quests);
  },
  async reorder(groups) {
    const quests = readLocal();
    const map = new Map(quests.map((i) => [i.id, i]));
    const now = new Date().toISOString();
    for (const group of groups) {
      group.ids.forEach((id, position) => {
        const it = map.get(id);
        if (!it) return;
        if (it.status !== group.status || it.position !== position) {
          map.set(id, {
            ...it,
            status: group.status,
            position,
            updatedAt: now,
          });
        }
      });
    }
    writeLocal([...map.values()]);
  },
};

async function jsonOrThrow(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    const messages =
      body !== null
        ? toFriendlyMessages(body, res.status)
        : [text || `Request failed (${res.status}).`];
    throw new ApiError(messages, res.status);
  }
  return res.json();
}

export const apiStore: QuestStore = {
  async list() {
    const data = await jsonOrThrow(
      await fetch("/api/quests", { cache: "no-store" }),
    );
    return data.quests as Quest[];
  },
  async create(draft) {
    const data = await jsonOrThrow(
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      }),
    );
    return data.quest as Quest;
  },
  async update(id, patch) {
    const data = await jsonOrThrow(
      await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    );
    return data.quest as Quest;
  },
  async remove(id) {
    await jsonOrThrow(await fetch(`/api/quests/${id}`, { method: "DELETE" }));
  },
  async reorder(groups) {
    await jsonOrThrow(
      await fetch("/api/quests/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups }),
      }),
    );
  },
};
