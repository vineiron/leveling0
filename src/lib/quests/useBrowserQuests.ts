"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocal } from "./storage";
import type { Quest } from "./types";

const NONE: Quest[] = [];

export function useBrowserQuests(active: boolean) {
  const [quests, setQuests] = useState<Quest[]>(NONE);
  const reload = useCallback(() => setQuests(readLocal()), []);

  useEffect(() => {
    if (!active) return;
    reload();
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, [active, reload]);

  return { quests: active ? quests : NONE, reload };
}
