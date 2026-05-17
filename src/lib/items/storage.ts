import { ApiError, toFriendlyMessages } from "./errors";
import type { Item, ItemDraft, ItemStatus } from "./types";

const LS_KEY = "leveling0:items:v1";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readLocal(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Item[];
  } catch {
    return [];
  }
}

function writeLocal(items: Item[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export type ItemStore = {
  list(): Promise<Item[]>;
  create(draft: ItemDraft): Promise<Item>;
  update(
    id: string,
    patch: Partial<ItemDraft> & { position?: number },
  ): Promise<Item>;
  remove(id: string): Promise<void>;
  reorder(groups: Array<{ status: ItemStatus; ids: string[] }>): Promise<void>;
};

export const localStore: ItemStore = {
  async list() {
    const items = readLocal();
    return [...items].sort((a, b) => {
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      return a.position - b.position;
    });
  },
  async create(draft) {
    const items = readLocal();
    const sameStatus = items.filter((i) => i.status === draft.status);
    const maxPos = sameStatus.reduce((m, i) => Math.max(m, i.position), -1);
    const now = new Date().toISOString();
    const item: Item = {
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
    items.push(item);
    writeLocal(items);
    return item;
  },
  async update(id, patch) {
    const items = readLocal();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Not found");
    const next: Item = {
      ...items[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    items[idx] = next;
    writeLocal(items);
    return next;
  },
  async remove(id) {
    const items = readLocal().filter((i) => i.id !== id);
    writeLocal(items);
  },
  async reorder(groups) {
    const items = readLocal();
    const map = new Map(items.map((i) => [i.id, i]));
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

export const apiStore: ItemStore = {
  async list() {
    const data = await jsonOrThrow(
      await fetch("/api/items", { cache: "no-store" }),
    );
    return data.items as Item[];
  },
  async create(draft) {
    const data = await jsonOrThrow(
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      }),
    );
    return data.item as Item;
  },
  async update(id, patch) {
    const data = await jsonOrThrow(
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    );
    return data.item as Item;
  },
  async remove(id) {
    await jsonOrThrow(await fetch(`/api/items/${id}`, { method: "DELETE" }));
  },
  async reorder(groups) {
    await jsonOrThrow(
      await fetch("/api/items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups }),
      }),
    );
  },
};
