"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiStore, localStore, type ItemStore } from "./storage";
import type { Item, ItemDraft, ItemStatus } from "./types";

type ReorderGroups = Array<{ status: ItemStatus; ids: string[] }>;

export type UseItems = {
  items: Item[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (draft: ItemDraft) => Promise<void>;
  update: (id: string, patch: Partial<ItemDraft>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  previewReorder: (groups: ReorderGroups) => void;
  commitReorder: (groups: ReorderGroups) => Promise<void>;
  mode: "local" | "remote";
};

export function useItems(): UseItems {
  const { user, loading: authLoading } = useAuth();
  const store: ItemStore = user ? apiStore : localStore;
  const mode: "local" | "remote" = user ? "remote" : "local";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const refresh = useCallback(async () => {
    const my = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const next = await store.list();
      if (my === reqId.current) setItems(next);
    } catch (e) {
      if (my === reqId.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (my === reqId.current) setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const create = useCallback(
    async (draft: ItemDraft) => {
      const created = await store.create(draft);
      setItems((prev) => [...prev, created]);
    },
    [store],
  );

  const update = useCallback(
    async (id: string, patch: Partial<ItemDraft>) => {
      const updated = await store.update(id, patch);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [store],
  );

  const remove = useCallback(
    async (id: string) => {
      await store.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [store],
  );

  // Local-only optimistic apply. Used during drag-over to drive visual feedback
  // without paying for a network round-trip on every hover tick.
  const previewReorder = useCallback((groups: ReorderGroups) => {
    setItems((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      for (const g of groups) {
        g.ids.forEach((id, position) => {
          const it = map.get(id);
          if (!it) return;
          map.set(id, { ...it, status: g.status, position });
        });
      }
      return [...map.values()];
    });
  }, []);

  // Persist the latest reorder state. On failure we refetch to resync the UI.
  const commitReorder = useCallback(
    async (groups: ReorderGroups) => {
      try {
        await store.reorder(groups);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        await refresh();
      }
    },
    [store, refresh],
  );

  return useMemo(
    () => ({
      items,
      loading: loading || authLoading,
      error,
      refresh,
      create,
      update,
      remove,
      previewReorder,
      commitReorder,
      mode,
    }),
    [
      items,
      loading,
      authLoading,
      error,
      refresh,
      create,
      update,
      remove,
      previewReorder,
      commitReorder,
      mode,
    ],
  );
}
