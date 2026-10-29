"use client";

import { useEffect, useState } from "react";
import { countLocal } from "./storage";

export function useBrowserQuestCount(active: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const read = () => setCount(countLocal());
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [active]);

  return active ? count : 0;
}
