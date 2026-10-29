"use client";

import { useEffect, useState } from "react";
import { ApiError } from "./errors";
import type { Quest } from "./types";

function reason(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof TypeError) return "The connection dropped.";
  return e instanceof Error ? e.message : String(e);
}

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
      setFailure(reason(e));
      setWorking(false);
    }
  }

  return { working, failure, run };
}
