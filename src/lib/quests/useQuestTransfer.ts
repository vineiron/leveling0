"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "./errors";
import type { Quest } from "./types";

export function useQuestTransfer(
  onRun: (picked: Quest[]) => Promise<void>,
  onDone: () => void,
) {
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!working) return;
    const stay = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", stay);
    return () => window.removeEventListener("beforeunload", stay);
  }, [working]);

  async function run(picked: Quest[]) {
    setWorking(true);
    setFailure(null);
    try {
      await onRun(picked);
      onDone();
    } catch (e) {
      setFailure(errorMessage(e));
      setWorking(false);
    }
  }

  return { working, failure, run };
}
